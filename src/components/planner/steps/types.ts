import type { FieldErrors } from "@/lib/planner/answers";

export type StepProps<T> = {
  values: T;
  errors: FieldErrors;
  onChange: (patch: Partial<T>) => void;
};
