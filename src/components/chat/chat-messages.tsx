"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { Sprout } from "lucide-react";
import { describeAnswers, introRequest } from "@/lib/chat/brief";
import type { PendingChat } from "@/lib/chat/pending";
import { cn } from "@/lib/cn";
import { ChatMarkdown } from "@/components/chat/chat-markdown";

function UserRow({ children }: { children: ReactNode }) {
  return (
    <li className="flex justify-end">
      <div className="max-w-[88%] rounded-2xl rounded-br-md bg-leaf-700 px-4 py-3 text-white shadow-sm shadow-leaf-900/10 sm:max-w-[75%]">
        <span className="sr-only">You said: </span>
        {children}
      </div>
    </li>
  );
}

/** The automatic first message, shown as the questionnaire it was built from. */
export function IntroMessage({ pending }: { pending: PendingChat }) {
  return (
    <UserRow>
      <p className="font-medium">{introRequest(pending.answers)}</p>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        {describeAnswers(pending.answers).map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-leaf-200">{label}</dt>
            <dd className="text-white/95">{value}</dd>
          </div>
        ))}
      </dl>
      {pending.photo && (
        <Image
          src={pending.photo}
          alt="Your balcony photo"
          width={480}
          height={320}
          unoptimized
          className="mt-3 h-32 w-full rounded-xl object-cover sm:h-40"
        />
      )}
    </UserRow>
  );
}

export function UserMessage({ content }: { content: string }) {
  return (
    <UserRow>
      <p className="leading-relaxed break-words whitespace-pre-wrap">{content}</p>
    </UserRow>
  );
}

function AssistantRow({ children, busy }: { children: ReactNode; busy?: boolean }) {
  return (
    <li className="flex gap-3" aria-busy={busy || undefined}>
      <span
        aria-hidden
        className="mt-1 hidden size-8 shrink-0 place-items-center rounded-full bg-leaf-700 text-cream sm:grid"
      >
        <Sprout className="size-4" />
      </span>
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-leaf-100 bg-white px-4 py-4 shadow-sm shadow-leaf-900/5 sm:px-6 sm:py-5">
        <span className="sr-only">Garden assistant: </span>
        {children}
      </div>
    </li>
  );
}

export function AssistantMessage({ content, streaming }: { content: string; streaming?: boolean }) {
  return (
    <AssistantRow busy={streaming}>
      <ChatMarkdown content={content} />
      {streaming && <TypingDots className="mt-3" />}
    </AssistantRow>
  );
}

function TypingDots({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("flex gap-1", className)}>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-1.5 animate-bounce rounded-full bg-leaf-400"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

function planStages(city: string, hasPhoto: boolean) {
  return [
    "Reading your answers…",
    ...(hasPhoto ? ["Looking at your balcony photo…"] : []),
    `Checking the climate in ${city}…`,
    "Choosing plants that will thrive…",
    "Planning pots and placement…",
    "Drawing the plants…",
  ];
}

/** Shown until the first words of a reply arrive. */
export function AssistantWaiting({ pending, isPlan }: { pending: PendingChat; isPlan: boolean }) {
  const [stage, setStage] = useState(0);
  const stages = planStages(pending.answers.location.city, Boolean(pending.photo));

  useEffect(() => {
    if (!isPlan) return;
    const timer = setInterval(
      () => setStage((current) => Math.min(current + 1, stages.length - 1)),
      3500,
    );
    return () => clearInterval(timer);
  }, [isPlan, stages.length]);

  return (
    <AssistantRow busy>
      {isPlan ? (
        <div className="flex items-center gap-3">
          <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-leaf-100 text-leaf-700">
            <span className="absolute inset-0 animate-ping rounded-full bg-leaf-200 opacity-60 motion-reduce:hidden" />
            <Sprout aria-hidden className="relative size-4" />
          </span>
          <div>
            <p className="font-medium text-ink">Growing your balcony plan</p>
            <p className="text-sm text-ink-soft">{stages[stage]}</p>
          </div>
        </div>
      ) : (
        <TypingDots className="py-1.5" />
      )}
    </AssistantRow>
  );
}
