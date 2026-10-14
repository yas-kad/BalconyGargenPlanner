"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics/track";
import { buildIntroMessage } from "@/lib/chat/brief";
import type { ChatStreamEvent, PlanPlant } from "@/lib/chat/events";
import { readPendingChat, SAVED_PLAN_KEY, type PendingChat } from "@/lib/chat/pending";
import {
  FOLLOW_UP_LIMIT,
  type ChatErrorBody,
  type ChatErrorCode,
  type ChatMessage,
  type ChatRequestBody,
} from "@/lib/chat/protocol";
import { SignInForm } from "@/components/auth/sign-in-form";
import { ChatComposer } from "@/components/chat/chat-composer";
import {
  AssistantMessage,
  AssistantWaiting,
  IntroMessage,
  UserMessage,
} from "@/components/chat/chat-messages";
import { ErrorNotice, LimitNotice, MissingAnswers } from "@/components/chat/chat-notices";
import { PlanGallery } from "@/components/plan/plan-gallery";

type Status = "idle" | "waiting" | "streaming";

type ChatError = { code: ChatErrorCode | "network"; message: string };

class ChatRequestError extends Error {
  constructor(
    readonly code: ChatErrorCode,
    message: string,
  ) {
    super(message);
  }
}

const GENERIC_ERROR = "The garden assistant couldn't reply. Please try again.";
const NETWORK_ERROR = "We lost the connection before the reply finished. Please try again.";
const NOT_RETRYABLE: readonly ChatError["code"][] = [
  "invalid_request",
  "photo_too_large",
  "session_limit",
  "daily_limit",
  "auth_required",
];

const subscribe = () => () => {};

export function ChatView() {
  // undefined while prerendering and hydrating, null when there is no questionnaire.
  const pending = useSyncExternalStore(subscribe, readPendingChat, () => undefined);

  if (pending === undefined) {
    return <div aria-hidden className="mt-6 h-64 animate-pulse rounded-[1.75rem] bg-sand/70" />;
  }
  if (pending === null) return <MissingAnswers />;
  return <Conversation pending={pending} />;
}

function Conversation({ pending }: { pending: PendingChat }) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { role: "user", content: buildIntroMessage(pending.answers, Boolean(pending.photo)) },
  ]);
  const [reply, setReply] = useState("");
  const [summary, setSummary] = useState("");
  const [scene, setScene] = useState<string>();
  const [plants, setPlants] = useState<PlanPlant[]>([]);
  const [status, setStatus] = useState<Status>("waiting");
  const [error, setError] = useState<ChatError | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const followBottomRef = useRef(true);

  const request = useCallback(
    async (history: ChatMessage[]) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const isPlan = history.length === 1;
      setStatus("waiting");
      setError(null);
      setReply("");
      if (isPlan) {
        setSummary("");
        setScene(undefined);
        setPlants([]);
      }

      let text = "";
      let savedId = "";
      let streamError = "";
      let frame = 0;
      try {
        const body: ChatRequestBody = {
          answers: pending.answers,
          photo: pending.photo,
          messages: history,
        };
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        if (!response.ok || !response.body) {
          const data = (await response.json().catch(() => null)) as ChatErrorBody | null;
          throw new ChatRequestError(data?.code ?? "generation_failed", data?.error ?? GENERIC_ERROR);
        }

        setStatus("streaming");
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
        let buffer = "";
        const apply = (event: ChatStreamEvent) => {
          if (event.type === "text") {
            text += event.delta;
            frame ||= requestAnimationFrame(() => {
              frame = 0;
              if (isPlan) setSummary(text);
              else setReply(text);
            });
          } else if (event.type === "plants") {
            setPlants(event.plants);
          } else if (event.type === "scene") {
            setScene(event.image);
          } else if (event.type === "plant") {
            setPlants((current) =>
              current.map((plant) =>
                plant.name === event.name ? { ...plant, image: event.image } : plant,
              ),
            );
          } else if (event.type === "plan") {
            savedId = event.id;
            try {
              sessionStorage.setItem(SAVED_PLAN_KEY, event.id);
            } catch {
              // The plan page link still works for this visit.
            }
          } else if (event.type === "error") {
            streamError = event.message;
          }
        };
        for (;;) {
          const { done, value } = await reader.read();
          buffer += value ?? "";
          const lines = buffer.split("\n");
          buffer = done ? "" : (lines.pop() ?? "");
          for (const line of lines) {
            if (!line.trim()) continue;
            apply(JSON.parse(line) as ChatStreamEvent);
          }
          if (done) break;
        }
        cancelAnimationFrame(frame);
        if (isPlan) setSummary(text.trim());

        if (!text.trim() && !savedId) throw new ChatRequestError("generation_failed", GENERIC_ERROR);
        if (!isPlan && text.trim()) {
          setMessages([...history, { role: "assistant", content: text.trim() }]);
          setReply("");
        }
        setStatus("idle");
        if (streamError) setError({ code: "generation_failed", message: streamError });
        if (savedId) router.replace(`/plan/${savedId}`);
      } catch (caught) {
        cancelAnimationFrame(frame);
        if (controller.signal.aborted) return;

        const chatError: ChatError =
          caught instanceof ChatRequestError
            ? { code: caught.code, message: caught.message }
            : { code: "network", message: NETWORK_ERROR };
        setReply("");
        setStatus("idle");
        setError(chatError);
        if (chatError.code === "session_limit" || chatError.code === "daily_limit") {
          track("limit_reached", { reason: chatError.code === "daily_limit" ? "daily" : "session" });
        }
      }
    },
    [pending, router],
  );

  // Deferred so React's dev-only double mount doesn't send the plan request twice.
  useEffect(() => {
    const saved = sessionStorage.getItem(SAVED_PLAN_KEY);
    if (saved) {
      router.replace(`/plan/${saved}`);
      return;
    }
    const timer = setTimeout(() => {
      track("chat_started", {
        country: pending.answers.location.country,
        hasPhoto: Boolean(pending.photo),
      });
      void request([
        { role: "user", content: buildIntroMessage(pending.answers, Boolean(pending.photo)) },
      ]);
    }, 0);
    return () => clearTimeout(timer);
  }, [pending, request, router]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const busy = status !== "idle";
  const hasPlan = messages.length > 1;
  // A question whose reply failed doesn't count; sending a new one replaces it.
  const failedQuestion = !busy && hasPlan && messages.at(-1)?.role === "user";
  const questionsAsked =
    messages.filter((message) => message.role === "user").length - 1 - (failedQuestion ? 1 : 0);
  const remaining = Math.max(0, FOLLOW_UP_LIMIT - questionsAsked);
  const limitReason =
    error?.code === "daily_limit"
      ? "daily"
      : error?.code === "session_limit" || (remaining === 0 && !busy)
        ? "session"
        : null;

  function send(question: string) {
    const content = question.trim();
    if (!content || busy || !hasPlan || remaining === 0) return;

    const base = failedQuestion ? messages.slice(0, -1) : messages;
    const history: ChatMessage[] = [...base, { role: "user", content }];
    const asked = questionsAsked + 1;

    setMessages(history);
    followBottomRef.current = true;
    track("chat_message_sent", { question: asked });
    if (asked === FOLLOW_UP_LIMIT) track("limit_reached", { reason: "session" });
    void request(history);
  }

  // Keep the newest text in view unless the reader has scrolled up.
  useEffect(() => {
    const onScroll = () => {
      const distance =
        document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      followBottomRef.current = distance < 160;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (followBottomRef.current) {
      window.scrollTo({ top: document.documentElement.scrollHeight });
    }
  }, [messages, reply, summary, plants, scene, status, error]);

  // The chat isn't saved, so warn before a reload or tab close throws it away.
  useEffect(() => {
    if (!hasPlan && !busy) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasPlan, busy]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
      <h1 className="sr-only">Your balcony plan</h1>

      <ol aria-label="Conversation" className="flex-1 space-y-5 pt-2 pb-6 sm:space-y-6">
        {messages.map((message, index) =>
          index === 0 ? (
            <IntroMessage key="intro" pending={pending} />
          ) : message.role === "user" ? (
            <UserMessage key={index} content={message.content} />
          ) : (
            <AssistantMessage key={index} content={message.content} />
          ),
        )}
        {(summary || plants.length > 0 || scene) && (
          <li>
            <PlanGallery summary={summary} sceneUrl={scene} plants={plants} imagesLoading={busy} />
          </li>
        )}
        {status === "waiting" && !summary && <AssistantWaiting pending={pending} isPlan={!hasPlan} />}
        {status === "streaming" && reply && <AssistantMessage content={reply} streaming />}
      </ol>

      <p role="status" className="sr-only">
        {busy
          ? hasPlan
            ? "The garden assistant is replying."
            : "The garden assistant is writing your balcony plan."
          : hasPlan
            ? "Reply finished."
            : ""}
      </p>

      {error?.code === "auth_required" && (
        <div className="mb-6 rounded-[1.5rem] border border-leaf-100 bg-white p-5">
          <p className="font-medium">Sign in to save your plan</p>
          <p className="mt-1 text-sm text-ink-soft">{error.message}</p>
          <div className="mt-4">
            <SignInForm next="/chat" compact />
          </div>
        </div>
      )}
      {error && error.code !== "auth_required" && !limitReason && (
        <div className="pb-6">
          <ErrorNotice
            message={error.message}
            onRetry={NOT_RETRYABLE.includes(error.code) ? undefined : () => void request(messages)}
          />
        </div>
      )}

      {limitReason ? (
        <div className="pb-[max(2rem,env(safe-area-inset-bottom))]">
          <LimitNotice reason={limitReason} />
        </div>
      ) : error?.code === "auth_required" ? null : (
        <div className="sticky bottom-0 -mx-4 bg-gradient-to-t from-cream from-75% to-cream/0 px-4 pt-6 pb-[max(1rem,env(safe-area-inset-bottom))] sm:-mx-8 sm:px-8">
          <ChatComposer
            canSend={hasPlan && !busy}
            remaining={remaining}
            showSuggestions={hasPlan && !busy && !error && questionsAsked === 0}
            onSend={send}
          />
        </div>
      )}
    </div>
  );
}
