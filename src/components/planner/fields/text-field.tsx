import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import type { FieldName } from "@/lib/planner/answers";
import { describedBy, FieldError } from "@/components/planner/fields/field-error";

export const inputStyles = (invalid: boolean) =>
  cn(
    "mt-2 block h-12 w-full rounded-xl border bg-white px-4 text-base text-ink transition-[border-color,box-shadow] duration-200 placeholder:text-ink-soft/60 focus:ring-4 focus:outline-none",
    invalid
      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
      : "border-leaf-200 hover:border-leaf-300 focus:border-leaf-600 focus:ring-leaf-100",
  );

type TextFieldProps = {
  name: FieldName;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
} & Pick<
  InputHTMLAttributes<HTMLInputElement>,
  "placeholder" | "autoComplete" | "enterKeyHint"
>;

export function TextField({
  name,
  label,
  value,
  onChange,
  error,
  ...inputProps
}: TextFieldProps) {
  const errorId = `${name}-error`;

  return (
    <div data-field={name} className="scroll-mt-6">
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(error && errorId)}
        className={inputStyles(Boolean(error))}
        {...inputProps}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}
