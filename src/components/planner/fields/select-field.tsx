import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import type { FieldName } from "@/lib/planner/answers";
import { describedBy, FieldError } from "@/components/planner/fields/field-error";
import { inputStyles } from "@/components/planner/fields/text-field";

type SelectFieldProps = {
  name: FieldName;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  placeholder: string;
  error?: string;
  autoComplete?: string;
};

export function SelectField({
  name,
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  autoComplete,
}: SelectFieldProps) {
  const errorId = `${name}-error`;

  return (
    <div data-field={name} className="scroll-mt-6">
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(error && errorId)}
          className={cn(
            inputStyles(Boolean(error)),
            "cursor-pointer appearance-none pr-11",
            !value && "text-ink-soft/60",
          )}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-ink">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-4 mt-1 size-4 -translate-y-1/2 text-ink-soft"
        />
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
