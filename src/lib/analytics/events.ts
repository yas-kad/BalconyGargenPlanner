/** Events the browser may send to `/api/track`. */
export const eventNames = [
  "questionnaire_step",
  "questionnaire_completed",
  "chat_started",
  "chat_message_sent",
  "limit_reached",
] as const;

export type EventName = (typeof eventNames)[number];

export type EventProperties = Record<string, string | number | boolean | null>;

export type TrackRequestBody = {
  name: EventName;
  sessionId?: string;
  properties?: EventProperties;
};
