import Link from "next/link";
import { CircleAlert, RotateCcw, Sparkles, Sprout } from "lucide-react";
import { FOLLOW_UP_LIMIT } from "@/lib/chat/protocol";
import { buttonStyles } from "@/components/ui/button-styles";

export function LimitNotice({ reason }: { reason: "session" | "daily" }) {
  const title =
    reason === "session"
      ? `You've used your ${FOLLOW_UP_LIMIT} free questions`
      : "You've reached today's free limit";
  const body =
    reason === "session"
      ? "Upgrade to Pro for unlimited questions and plan updates. Pro is coming soon. Your plan stays on this page until you close it."
      : "Upgrade to Pro for unlimited plans and questions. Pro is coming soon. In the meantime, come back tomorrow for more.";

  return (
    <div role="status" className="rounded-[1.5rem] border border-terracotta/30 bg-white p-4 shadow-sm shadow-leaf-900/5 sm:p-5">
      <div className="flex gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-terracotta/10 text-terracotta">
          <Sparkles aria-hidden className="size-4" />
        </span>
        <div>
          <p className="font-semibold text-ink">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{body}</p>
        </div>
      </div>
      {reason === "session" && (
        <Link href="/planner" className={buttonStyles({ variant: "secondary", className: "mt-4 w-full sm:w-auto" })}>
          Start a new plan
        </Link>
      )}
    </div>
  );
}

export function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-2xl border border-terracotta/30 bg-terracotta/5 p-4 sm:flex-row sm:items-center"
    >
      <div className="flex flex-1 gap-3">
        <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-terracotta" />
        <p className="text-sm leading-relaxed text-ink">{message}</p>
      </div>
      {onRetry ? (
        <button type="button" onClick={onRetry} className={buttonStyles({ variant: "secondary" })}>
          <RotateCcw aria-hidden className="size-4" />
          Try again
        </button>
      ) : (
        <Link href="/planner" className={buttonStyles({ variant: "secondary" })}>
          Start a new plan
        </Link>
      )}
    </div>
  );
}

export function MissingAnswers() {
  return (
    <div className="mx-auto mt-10 max-w-md rounded-[1.75rem] border border-leaf-100 bg-white px-6 py-10 text-center shadow-sm shadow-leaf-900/5 sm:mt-16">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-leaf-100 text-leaf-700">
        <Sprout aria-hidden className="size-6" />
      </span>
      <h1 className="mt-5 font-display text-2xl font-medium tracking-tight">
        Let&apos;s start with your balcony
      </h1>
      <p className="mt-3 leading-relaxed text-ink-soft">
        Answer a few quick questions and your garden assistant will write your plan right here.
      </p>
      <Link href="/planner" className={buttonStyles({ className: "mt-6" })}>
        Start the planner
      </Link>
    </div>
  );
}
