export type ChoiceOption<T extends string = string> = {
  value: T;
  label: string;
  description?: string;
};

type ValueOf<T extends readonly ChoiceOption[]> = T[number]["value"];

export const spaceTypeOptions = [
  { value: "balcony", label: "Balcony", description: "Above the street" },
  { value: "terrace", label: "Terrace", description: "Rooftop or patio" },
  { value: "garden", label: "Garden", description: "Ground level" },
] as const satisfies readonly ChoiceOption[];

export const sunExposureOptions = [
  { value: "full", label: "Full sun", description: "6+ hours" },
  { value: "partial", label: "Partial sun", description: "3–6 hours" },
  { value: "shade", label: "Shade", description: "Under 3 hours" },
] as const satisfies readonly ChoiceOption[];

export const directionOptions = [
  { value: "north", label: "North" },
  { value: "east", label: "East" },
  { value: "south", label: "South" },
  { value: "west", label: "West" },
] as const satisfies readonly ChoiceOption[];

export const balconySizeOptions = [
  { value: "small", label: "Small", description: "Under 3 m²" },
  { value: "medium", label: "Medium", description: "3–8 m²" },
  { value: "large", label: "Large", description: "8 m² or more" },
] as const satisfies readonly ChoiceOption[];

export const windExposureOptions = [
  { value: "low", label: "Low", description: "Sheltered" },
  { value: "medium", label: "Medium", description: "Some breeze" },
  { value: "high", label: "High", description: "Very exposed" },
] as const satisfies readonly ChoiceOption[];

export const petsOptions = [
  { value: "yes", label: "Yes", description: "Cats, dogs or other animals" },
  { value: "no", label: "No", description: "No pets at home" },
] as const satisfies readonly ChoiceOption[];

export const gardenStyleOptions = [
  {
    value: "mediterranean",
    label: "Mediterranean",
    description: "Olive, lavender, rosemary and terracotta",
  },
  {
    value: "tropical",
    label: "Tropical",
    description: "Lush, large leaves and bold greens",
  },
  {
    value: "minimalist",
    label: "Minimalist",
    description: "Few species, clean lines, calm textures",
  },
  {
    value: "colorful-flowers",
    label: "Colorful flowers",
    description: "Blooms and color through the seasons",
  },
  {
    value: "herbs-and-vegetables",
    label: "Herbs and vegetables",
    description: "A productive, edible balcony",
  },
] as const satisfies readonly ChoiceOption[];

export const maintenanceOptions = [
  { value: "low", label: "Low", description: "A few minutes a week" },
  {
    value: "moderate",
    label: "Moderate",
    description: "Regular watering and the odd trim",
  },
  {
    value: "high",
    label: "I enjoy gardening",
    description: "Happy to spend time on it",
  },
] as const satisfies readonly ChoiceOption[];

export const budgetOptions = [
  { value: "low", label: "Low", description: "Keep it affordable" },
  { value: "medium", label: "Medium", description: "A balanced investment" },
  { value: "premium", label: "Premium", description: "Statement plants and pots" },
] as const satisfies readonly ChoiceOption[];

export type SpaceType = ValueOf<typeof spaceTypeOptions>;
export type SunExposure = ValueOf<typeof sunExposureOptions>;
export type Direction = ValueOf<typeof directionOptions>;
export type BalconySize = ValueOf<typeof balconySizeOptions>;
export type WindExposure = ValueOf<typeof windExposureOptions>;
export type PetsAnswer = ValueOf<typeof petsOptions>;
export type GardenStyle = ValueOf<typeof gardenStyleOptions>;
export type Maintenance = ValueOf<typeof maintenanceOptions>;
export type Budget = ValueOf<typeof budgetOptions>;
