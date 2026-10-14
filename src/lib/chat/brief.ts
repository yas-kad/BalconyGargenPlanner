import {
  balconySizeOptions,
  spaceTypeOptions,
  budgetOptions,
  directionOptions,
  gardenStyleOptions,
  maintenanceOptions,
  petsOptions,
  sunExposureOptions,
  windExposureOptions,
  type ChoiceOption,
} from "@/lib/planner/options";
import type { PlanAnswers } from "@/lib/planner/submission";

function describe<T extends string>(options: readonly ChoiceOption<T>[], value: T) {
  const option = options.find((candidate) => candidate.value === value);
  if (!option) return value;
  return option.description ? `${option.label} (${option.description})` : option.label;
}

export function countryName(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** The questionnaire as label/value pairs, shared by the chat UI and the prompt. */
export function describeAnswers({ location, balcony, preferences }: PlanAnswers) {
  return [
    ["Location", `${location.city}, ${countryName(location.country)}`],
    ["Space", describe(spaceTypeOptions, balcony.spaceType)],
    ["Direct sun", describe(sunExposureOptions, balcony.sunExposure)],
    ["Faces", describe(directionOptions, balcony.direction)],
    ["Size", describe(balconySizeOptions, balcony.size)],
    ["Wind", describe(windExposureOptions, balcony.windExposure)],
    ["Pets", describe(petsOptions, balcony.pets)],
    ["Style", describe(gardenStyleOptions, preferences.style)],
    ["Maintenance", describe(maintenanceOptions, preferences.maintenance)],
    ["Budget", describe(budgetOptions, preferences.budget)],
  ] as const satisfies readonly (readonly [string, string])[];
}

export function introRequest(answers: PlanAnswers): string {
  const space = describe(spaceTypeOptions, answers.balcony.spaceType).split(" (")[0].toLowerCase();
  return `Please create a garden plan for my ${space}.`;
}

/** The first user message, sent automatically when the chat opens. */
export function buildIntroMessage(answers: PlanAnswers, hasPhoto: boolean): string {
  return [
    introRequest(answers),
    "",
    ...describeAnswers(answers).map(([label, value]) => `- ${label}: ${value}`),
    `- Photo: ${hasPhoto ? "attached" : "none"}`,
  ].join("\n");
}
