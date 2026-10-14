"use client";

import { useId, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";
import { FOLLOW_UP_LIMIT, MAX_QUESTION_CHARS } from "@/lib/chat/protocol";

const suggestions = [
  "How often should I water in summer?",
  "Can you make it cheaper?",
  "What should I buy first?",
];

type ChatComposerProps = {
  /** False while a reply is on its way; typing is still allowed. */
  canSend: boolean;
  remaining: number;
  showSuggestions: boolean;
  onSend: (question: string) => void;
};

export function ChatComposer({ canSend, remaining, showSuggestions, onSend }: ChatComposerProps) {
  const [value, setValue] = useState("");
  const inputId = useId();
  const hintId = useId();
  const ready = canSend && value.trim().length > 0;

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!ready) return;
    onSend(value);
    setValue("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div>
      {showSuggestions && (
        <ul aria-label="Suggested questions" className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {suggestions.map((suggestion) => (
            <li key={suggestion} className="shrink-0">
              <button
                type="button"
                disabled={!canSend}
                onClick={() => onSend(suggestion)}
                className="rounded-full border border-leaf-200 bg-white px-3.5 py-2 text-sm text-ink-soft transition-colors hover:border-leaf-300 hover:bg-leaf-50 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-600 disabled:opacity-50"
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={submit}
        className="flex items-end gap-2 rounded-[1.5rem] border border-leaf-200 bg-white p-1.5 pl-4 shadow-sm shadow-leaf-900/5 transition-colors focus-within:border-leaf-400"
      >
        <label htmlFor={inputId} className="sr-only">
          Ask a follow-up question
        </label>
        <textarea
          id={inputId}
          rows={1}
          value={value}
          maxLength={MAX_QUESTION_CHARS}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          aria-describedby={hintId}
          placeholder="Ask about plants, pots or care…"
          className="max-h-40 min-h-10 flex-1 resize-none bg-transparent py-2 text-base leading-6 text-ink outline-none field-sizing-content placeholder:text-ink-soft/70"
        />
        <button
          type="submit"
          disabled={!ready}
          aria-label="Send question"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-leaf-700 text-white transition-colors hover:bg-leaf-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-600 disabled:bg-leaf-200 disabled:text-leaf-50"
        >
          <ArrowUp aria-hidden className="size-5" />
        </button>
      </form>
      <p id={hintId} className="mt-2 px-1 text-xs text-ink-soft">
        {remaining} of {FOLLOW_UP_LIMIT} free questions left
      </p>
    </div>
  );
}
