"use client";

import { useState } from "react";
import { buildIntroMessage } from "@/lib/chat/brief";
import type { ChatStreamEvent } from "@/lib/chat/events";
import { FOLLOW_UP_LIMIT, type ChatMessage, type ChatRequestBody } from "@/lib/chat/protocol";
import type { PlanAnswers } from "@/lib/planner/submission";
import { ChatComposer } from "@/components/chat/chat-composer";
import { AssistantMessage, UserMessage } from "@/components/chat/chat-messages";

export function PlanFollowUp({
  answers,
  summary,
}: {
  answers: PlanAnswers;
  summary: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "user", content: buildIntroMessage(answers, false) },
    { role: "assistant", content: summary },
  ]);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const asked = messages.filter((message) => message.role === "user").length - 1;

  async function send(question: string) {
    const content = question.trim();
    if (!content || busy || asked >= FOLLOW_UP_LIMIT) return;
    const history: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(history);
    setBusy(true);
    setError("");
    setReply("");

    try {
      const body: ChatRequestBody = { answers, messages: history };
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok || !response.body) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "The garden assistant couldn't reply.");
      }

      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        buffer += value ?? "";
        const lines = buffer.split("\n");
        buffer = done ? "" : (lines.pop() ?? "");
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as ChatStreamEvent;
          if (event.type === "text") {
            text += event.delta;
            setReply(text);
          }
        }
        if (done) break;
      }
      if (text.trim()) setMessages([...history, { role: "assistant", content: text.trim() }]);
      setReply("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8">
      <h2 className="font-display text-2xl font-medium">Ask a follow-up</h2>
      <ol aria-label="Follow-up conversation" className="mt-4 space-y-4">
        {messages.slice(2).map((message, index) =>
          message.role === "user" ? (
            <UserMessage key={index} content={message.content} />
          ) : (
            <AssistantMessage key={index} content={message.content} />
          ),
        )}
        {reply && <AssistantMessage content={reply} streaming />}
      </ol>
      {error && (
        <p role="alert" className="mt-3 text-sm text-terracotta">
          {error}
        </p>
      )}
      {asked >= FOLLOW_UP_LIMIT ? (
        <p className="mt-4 text-sm text-ink-soft">You&apos;ve used the 5 follow-up questions for this plan.</p>
      ) : (
        <div className="mt-4">
          <ChatComposer
            canSend={!busy}
            remaining={FOLLOW_UP_LIMIT - asked}
            showSuggestions={asked === 0 && !busy}
            onSend={(question) => void send(question)}
          />
        </div>
      )}
    </div>
  );
}
