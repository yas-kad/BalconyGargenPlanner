import type { CountryOption } from "@/lib/countries";
import type { LocationAnswers } from "@/lib/planner/answers";
import { SelectField } from "@/components/planner/fields/select-field";
import { TextField } from "@/components/planner/fields/text-field";
import type { StepProps } from "@/components/planner/steps/types";

type LocationStepProps = StepProps<LocationAnswers> & {
  countries: readonly CountryOption[];
};

export function LocationStep({
  values,
  errors,
  onChange,
  countries,
}: LocationStepProps) {
  return (
    <div className="grid gap-6">
      <SelectField
        name="country"
        label="Country"
        placeholder="Select your country"
        options={countries}
        value={values.country}
        onChange={(country) => onChange({ country })}
        error={errors.country}
        autoComplete="country"
      />
      <TextField
        name="city"
        label="City"
        placeholder="e.g. Lyon"
        value={values.city}
        onChange={(city) => onChange({ city })}
        error={errors.city}
        autoComplete="address-level2"
        enterKeyHint="next"
      />
    </div>
  );
}
