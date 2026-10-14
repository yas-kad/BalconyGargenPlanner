import type { PlanAnswers } from "@/lib/planner/submission";

/** Questions the user can ask after the plan, per chat. */
export const FOLLOW_UP_LIMIT = 5;
export const MAX_QUESTION_CHARS = 1000;

export type ChatRole = "user" | "assistant";

export type ChatMessage = { role: ChatRole; content: string };

export type ChatRequestBody = {
  answers: PlanAnswers;
  /** Base64 image, either a `data:image/…;base64,` URL or bare base64 (JPEG). */
  photo?: string;
  /**
   * The whole conversation, oldest first, ending with the newest user message.
   * The first message is the questionnaire brief; the server rebuilds it from
   * `answers`, so its content is not trusted.
   */
  messages: ChatMessage[];
};

export type ChatErrorCode =
  | "invalid_request"
  | "photo_too_large"
  | "session_limit"
  | "daily_limit"
  | "auth_required"
  | "not_configured"
  | "generation_failed";

export type ChatErrorBody = { error: string; code: ChatErrorCode };
