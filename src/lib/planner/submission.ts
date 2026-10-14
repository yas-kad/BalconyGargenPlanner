import type { PlannerAnswers } from "@/lib/planner/answers";
import {
  balconySizeOptions,
  budgetOptions,
  directionOptions,
  gardenStyleOptions,
  maintenanceOptions,
  petsOptions,
  spaceTypeOptions,
  sunExposureOptions,
  windExposureOptions,
  type BalconySize,
  type Budget,
  type ChoiceOption,
  type Direction,
  type GardenStyle,
  type Maintenance,
  type PetsAnswer,
  type SpaceType,
  type SunExposure,
  type WindExposure,
} from "@/lib/planner/options";

/** Questionnaire answers once every step is valid, without the photo. */
export type PlanAnswers = {
  location: { country: string; city: string };
  balcony: {
    spaceType: SpaceType;
    sunExposure: SunExposure;
    direction: Direction;
    size: BalconySize;
    windExposure: WindExposure;
    pets: PetsAnswer;
  };
  preferences: {
    style: GardenStyle;
    maintenance: Maintenance;
    budget: Budget;
  };
};

/** Call only after every step passed `validateStep`. */
export function toPlanAnswers({ location, balcony, preferences }: PlannerAnswers): PlanAnswers {
  const required = <T>(value: T | null): T => {
    if (value === null) throw new Error("Planner answers are incomplete.");
    return value;
  };

  return {
    location: { country: location.country, city: location.city.trim() },
    balcony: {
      spaceType: required(balcony.spaceType),
      sunExposure: required(balcony.sunExposure),
      direction: required(balcony.direction),
      size: required(balcony.size),
      windExposure: required(balcony.windExposure),
      pets: required(balcony.pets),
    },
    preferences: {
      style: required(preferences.style),
      maintenance: required(preferences.maintenance),
      budget: required(preferences.budget),
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function oneOf<T extends string>(
  options: readonly ChoiceOption<T>[],
  value: unknown,
): T | null {
  return options.find((option) => option.value === value)?.value ?? null;
}

/** Validates untrusted input; returns `null` if anything is missing or unknown. */
export function parsePlanAnswers(input: unknown): PlanAnswers | null {
  if (!isRecord(input)) return null;
  const { location, balcony, preferences } = input;
  if (!isRecord(location) || !isRecord(balcony) || !isRecord(preferences)) return null;

  const country = typeof location.country === "string" ? location.country : "";
  const city = typeof location.city === "string" ? location.city.trim() : "";
  if (!/^[A-Z]{2}$/.test(country) || city.length < 2 || city.length > 80) return null;

  const answers = {
    location: { country, city },
    balcony: {
      spaceType: oneOf(spaceTypeOptions, balcony.spaceType),
      sunExposure: oneOf(sunExposureOptions, balcony.sunExposure),
      direction: oneOf(directionOptions, balcony.direction),
      size: oneOf(balconySizeOptions, balcony.size),
      windExposure: oneOf(windExposureOptions, balcony.windExposure),
      pets: oneOf(petsOptions, balcony.pets),
    },
    preferences: {
      style: oneOf(gardenStyleOptions, preferences.style),
      maintenance: oneOf(maintenanceOptions, preferences.maintenance),
      budget: oneOf(budgetOptions, preferences.budget),
    },
  };

  const choices = [...Object.values(answers.balcony), ...Object.values(answers.preferences)];
  return choices.every((choice) => choice !== null) ? (answers as PlanAnswers) : null;
}
