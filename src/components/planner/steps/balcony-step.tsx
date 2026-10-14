import { Building2, Cloud, CloudSun, Sun, Trees, type LucideIcon } from "lucide-react";
import type { BalconyAnswers } from "@/lib/planner/answers";
import {
  balconySizeOptions,
  directionOptions,
  petsOptions,
  spaceTypeOptions,
  sunExposureOptions,
  windExposureOptions,
  type SpaceType,
  type SunExposure,
} from "@/lib/planner/options";
import { ChoiceGroup } from "@/components/planner/fields/choice-group";
import { PhotoUpload } from "@/components/planner/fields/photo-upload";
import type { StepProps } from "@/components/planner/steps/types";

const spaceIcons: Record<SpaceType, LucideIcon> = {
  balcony: Building2,
  terrace: Sun,
  garden: Trees,
};

const spaceOptions = spaceTypeOptions.map((option) => ({
  ...option,
  icon: spaceIcons[option.value],
}));

const sunIcons: Record<SunExposure, LucideIcon> = {
  full: Sun,
  partial: CloudSun,
  shade: Cloud,
};

const sunOptions = sunExposureOptions.map((option) => ({
  ...option,
  icon: sunIcons[option.value],
}));

export function BalconyStep({ values, errors, onChange }: StepProps<BalconyAnswers>) {
  return (
    <div className="grid gap-9">
      <ChoiceGroup
        name="spaceType"
        legend="What are we planting?"
        options={spaceOptions}
        value={values.spaceType}
        onChange={(spaceType) => onChange({ spaceType })}
        error={errors.spaceType}
        columns="sm:grid-cols-3"
      />
      <PhotoUpload photo={values.photo} onChange={(photo) => onChange({ photo })} />
      <ChoiceGroup
        name="sunExposure"
        legend="How much direct sun does it get?"
        hint="Hours of direct sunlight on a typical summer day."
        options={sunOptions}
        value={values.sunExposure}
        onChange={(sunExposure) => onChange({ sunExposure })}
        error={errors.sunExposure}
        columns="md:grid-cols-3"
        stackOnDesktop
      />
      <ChoiceGroup
        name="direction"
        legend="Which way does it face?"
        hint={
          values.spaceType === "garden"
            ? "The direction the main part of the garden faces."
            : values.spaceType === "terrace"
              ? "The direction you look in when standing on your terrace."
              : "The direction you look in when standing on your balcony."
        }
        options={directionOptions}
        value={values.direction}
        onChange={(direction) => onChange({ direction })}
        error={errors.direction}
        columns="grid-cols-2 sm:grid-cols-4"
      />
      <ChoiceGroup
        name="size"
        legend="How big is it?"
        options={balconySizeOptions}
        value={values.size}
        onChange={(size) => onChange({ size })}
        error={errors.size}
        columns="sm:grid-cols-3"
      />
      <ChoiceGroup
        name="windExposure"
        legend="How windy does it get?"
        options={windExposureOptions}
        value={values.windExposure}
        onChange={(windExposure) => onChange({ windExposure })}
        error={errors.windExposure}
        columns="sm:grid-cols-3"
      />
      <ChoiceGroup
        name="pets"
        legend="Do you have pets?"
        hint="We'll leave out plants that are toxic to cats and dogs."
        options={petsOptions}
        value={values.pets}
        onChange={(pets) => onChange({ pets })}
        error={errors.pets}
        columns="sm:grid-cols-2"
      />
    </div>
  );
}
