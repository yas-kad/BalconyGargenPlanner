import {
  Carrot,
  Citrus,
  Flower2,
  Leaf,
  TreePalm,
  type LucideIcon,
} from "lucide-react";
import type { PreferenceAnswers } from "@/lib/planner/answers";
import {
  budgetOptions,
  gardenStyleOptions,
  maintenanceOptions,
  type GardenStyle,
} from "@/lib/planner/options";
import { ChoiceGroup } from "@/components/planner/fields/choice-group";
import type { StepProps } from "@/components/planner/steps/types";

const styleIcons: Record<GardenStyle, LucideIcon> = {
  mediterranean: Citrus,
  tropical: TreePalm,
  minimalist: Leaf,
  "colorful-flowers": Flower2,
  "herbs-and-vegetables": Carrot,
};

const styleOptions = gardenStyleOptions.map((option) => ({
  ...option,
  icon: styleIcons[option.value],
}));

export function PreferencesStep({
  values,
  errors,
  onChange,
}: StepProps<PreferenceAnswers>) {
  return (
    <div className="grid gap-9">
      <ChoiceGroup
        name="style"
        legend="Which style are you drawn to?"
        options={styleOptions}
        value={values.style}
        onChange={(style) => onChange({ style })}
        error={errors.style}
        columns="sm:grid-cols-2"
      />
      <ChoiceGroup
        name="maintenance"
        legend="How much care do you want to give?"
        options={maintenanceOptions}
        value={values.maintenance}
        onChange={(maintenance) => onChange({ maintenance })}
        error={errors.maintenance}
        columns="sm:grid-cols-3"
      />
      <ChoiceGroup
        name="budget"
        legend="What's your budget?"
        options={budgetOptions}
        value={values.budget}
        onChange={(budget) => onChange({ budget })}
        error={errors.budget}
        columns="sm:grid-cols-3"
      />
    </div>
  );
}
