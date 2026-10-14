import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

type PlannerProgressProps = {
  steps: readonly { id: string; title: string }[];
  currentIndex: number;
  complete: boolean;
};

export function PlannerProgress({
  steps,
  currentIndex,
  complete,
}: PlannerProgressProps) {
  const progress = complete ? 100 : ((currentIndex + 1) / steps.length) * 100;
  const valueText = complete
    ? "All steps complete"
    : `Step ${currentIndex + 1} of ${steps.length}: ${steps[currentIndex].title}`;

  return (
    <div>
      <div
        role="progressbar"
        aria-label="Planner progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-valuetext={valueText}
        className="h-1.5 overflow-hidden rounded-full bg-leaf-100"
      >
        <div
          className="h-full rounded-full bg-leaf-600 transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol className="mt-4 grid grid-cols-3 gap-2">
        {steps.map((step, index) => {
          const isDone = complete || index < currentIndex;
          const isCurrent = !complete && index === currentIndex;

          return (
            <li
              key={step.id}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex min-w-0 items-center gap-2 text-xs sm:text-sm",
                isCurrent ? "font-medium text-ink" : isDone ? "text-leaf-700" : "text-ink-soft",
              )}
            >
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full text-xs font-medium transition-colors",
                  isDone && "bg-leaf-600 text-white",
                  isCurrent && "bg-ink text-cream",
                  !isDone && !isCurrent && "border border-leaf-200 bg-white",
                )}
              >
                {isDone ? (
                  <Check aria-hidden className="size-3.5" strokeWidth={3} />
                ) : (
                  index + 1
                )}
              </span>
              <span className="truncate">
                {step.title}
                {isDone && <span className="sr-only"> (completed)</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
