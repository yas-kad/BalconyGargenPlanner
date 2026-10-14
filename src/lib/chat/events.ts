export type PlanPlant = {
  name: string;
  note: string;
  /** Public image URL once the plan is saved, or a data URL while it streams. */
  image?: string;
};

export type ChatStreamEvent =
  | { type: "text"; delta: string }
  | { type: "plants"; plants: { name: string; note: string }[] }
  | { type: "scene"; image: string }
  | { type: "plant"; name: string; image: string }
  | { type: "plan"; id: string }
  | { type: "error"; message: string }
  | { type: "done" };

export function isChatStreamEvent(value: unknown): value is ChatStreamEvent {
  return typeof value === "object" && value !== null && "type" in value;
}
