import { Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { FieldName } from "@/lib/planner/answers";
import type { ChoiceOption } from "@/lib/planner/options";
import { describedBy, FieldError } from "@/components/planner/fields/field-error";

export type ChoiceGroupOption<T extends string> = ChoiceOption<T> & {
  icon?: LucideIcon;
};

type ChoiceGroupProps<T extends string> = {
  name: FieldName;
  legend: string;
  hint?: string;
  options: readonly ChoiceGroupOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  error?: string;
  /** Grid column classes, e.g. "sm:grid-cols-3". Mobile defaults to one column. */
  columns?: string;
  /** Stack icon above text from the md breakpoint, for narrow multi-column grids. */
  stackOnDesktop?: boolean;
};

export function ChoiceGroup<T extends string>({
  name,
  legend,
  hint,
  options,
  value,
  onChange,
  error,
  columns,
  stackOnDesktop = false,
}: ChoiceGroupProps<T>) {
  const hintId = `${name}-hint`;
  const errorId = `${name}-error`;
  const descriptionIds = describedBy(hint && hintId, error && errorId);

  return (
    <fieldset data-field={name} className="scroll-mt-6">
      <legend className="text-sm font-medium">{legend}</legend>
      {hint && (
        <p id={hintId} className="mt-1 text-sm text-ink-soft">
          {hint}
        </p>
      )}

      <div className={cn("mt-3 grid gap-2.5", columns)}>
        {options.map((option) => {
          const selected = option.value === value;
          const Icon = option.icon;

          return (
            <label
              key={option.value}
              className={cn(
                "relative flex cursor-pointer items-center gap-3 rounded-2xl border p-4 pr-11 transition-colors duration-150 select-none has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-leaf-600",
                stackOnDesktop && "md:flex-col md:items-start md:pr-4",
                selected
                  ? "border-leaf-600 bg-leaf-50 ring-1 ring-leaf-600"
                  : error
                    ? "border-rose-200 bg-white hover:border-rose-300"
                    : "border-leaf-100 bg-white hover:border-leaf-300 hover:bg-leaf-50/40",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                aria-describedby={descriptionIds}
                className="sr-only"
              />
              {Icon && (
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-xl transition-colors",
                    selected ? "bg-leaf-600 text-white" : "bg-leaf-50 text-leaf-700",
                  )}
                >
                  <Icon aria-hidden className="size-[18px]" />
                </span>
              )}
              <span className="min-w-0">
                <span className="block text-[15px] leading-snug font-medium">
                  {option.label}
                </span>
                {option.description && (
                  <span className="mt-0.5 block text-sm leading-snug text-ink-soft">
                    {option.description}
                  </span>
                )}
              </span>
              <span
                aria-hidden
                className={cn(
                  "absolute top-1/2 right-4 grid size-5 -translate-y-1/2 place-items-center rounded-full border transition-colors",
                  stackOnDesktop && "md:top-4 md:translate-y-0",
                  selected
                    ? "border-leaf-600 bg-leaf-600 text-white"
                    : "border-leaf-200 bg-white",
                )}
              >
                {selected && <Check className="size-3" strokeWidth={3} />}
              </span>
            </label>
          );
        })}
      </div>

      <FieldError id={errorId} message={error} />
    </fieldset>
  );
}
