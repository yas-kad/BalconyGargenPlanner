import type {
  BalconySize,
  Budget,
  Direction,
  GardenStyle,
  Maintenance,
  PetsAnswer,
  SpaceType,
  SunExposure,
  WindExposure,
} from "@/lib/planner/options";

export type LocationAnswers = {
  /** ISO 3166-1 alpha-2 code, e.g. "FR". */
  country: string;
  city: string;
};

export type BalconyAnswers = {
  photo: File | null;
  spaceType: SpaceType | null;
  sunExposure: SunExposure | null;
  direction: Direction | null;
  size: BalconySize | null;
  windExposure: WindExposure | null;
  pets: PetsAnswer | null;
};

export type PreferenceAnswers = {
  style: GardenStyle | null;
  maintenance: Maintenance | null;
  budget: Budget | null;
};

export type PlannerAnswers = {
  location: LocationAnswers;
  balcony: BalconyAnswers;
  preferences: PreferenceAnswers;
};

export type FieldName = Exclude<
  keyof LocationAnswers | keyof BalconyAnswers | keyof PreferenceAnswers,
  "photo"
>;

export type FieldErrors = Partial<Record<FieldName, string>>;

export const initialAnswers: PlannerAnswers = {
  location: { country: "", city: "" },
  balcony: {
    photo: null,
    spaceType: null,
    sunExposure: null,
    direction: null,
    size: null,
    windExposure: null,
    pets: null,
  },
  preferences: { style: null, maintenance: null, budget: null },
};

export const plannerSteps = [
  {
    id: "location",
    title: "Location",
    heading: "Where is your space?",
    description: "Your location tells us about your climate and growing season.",
  },
  {
    id: "balcony",
    title: "Space",
    heading: "Tell us about your space",
    description: "Sunlight, size and exposure decide which plants will thrive.",
  },
  {
    id: "preferences",
    title: "Preferences",
    heading: "Make it yours",
    description: "Shape the plan around your taste, your time and your budget.",
  },
] as const;

export type PlannerStepId = (typeof plannerSteps)[number]["id"];

function requireChoices<T extends object>(
  values: T,
  messages: Partial<Record<keyof T & FieldName, string>>,
): FieldErrors {
  const errors: FieldErrors = {};
  for (const [field, message] of Object.entries(messages) as [
    keyof T & FieldName,
    string,
  ][]) {
    if (values[field] === null) errors[field] = message;
  }
  return errors;
}

const stepValidators: Record<
  PlannerStepId,
  (answers: PlannerAnswers) => FieldErrors
> = {
  location: ({ location }) => {
    const errors: FieldErrors = {};
    const city = location.city.trim();
    if (!location.country) errors.country = "Please select your country.";
    if (!city) errors.city = "Please enter your city.";
    else if (city.length < 2) errors.city = "Please enter a valid city name.";
    return errors;
  },
  balcony: ({ balcony }) =>
    requireChoices(balcony, {
      spaceType: "Choose whether this is a balcony, terrace, or garden.",
      sunExposure: "Choose how much direct sun it gets.",
      direction: "Choose which direction your balcony faces.",
      size: "Choose the size of your balcony.",
      windExposure: "Choose how windy your balcony gets.",
      pets: "Let us know whether you have pets.",
    }),
  preferences: ({ preferences }) =>
    requireChoices(preferences, {
      style: "Choose the style you're drawn to.",
      maintenance: "Choose how much care you want to give.",
      budget: "Choose a budget.",
    }),
};

export function validateStep(
  step: PlannerStepId,
  answers: PlannerAnswers,
): FieldErrors {
  return stepValidators[step](answers);
}
