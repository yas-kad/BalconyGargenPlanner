import { parsePlanAnswers, type PlanAnswers } from "@/lib/planner/submission";

const STORAGE_KEY = "bgp-pending-chat";
export const SAVED_PLAN_KEY = "bgp-saved-plan";

export type PendingChat = {
  answers: PlanAnswers;
  /** JPEG data URL, already downscaled. */
  photo?: string;
};

// sessionStorage keeps the questionnaire across reloads of /chat; the
// in-memory copy covers browsers that block storage.
let current: PendingChat | null | undefined;

export function savePendingChat(chat: PendingChat) {
  current = chat;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(chat));
  } catch {
    try {
      // Usually a full quota: keep the answers without the photo.
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ answers: chat.answers }));
    } catch {
      // Storage is unavailable; the in-memory copy still works until a reload.
    }
  }
}

/** Returns the same object on every call, so it can back `useSyncExternalStore`. */
export function readPendingChat(): PendingChat | null {
  if (current !== undefined) return current;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const data: unknown = raw ? JSON.parse(raw) : null;
    const record = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};
    const answers = parsePlanAnswers(record.answers);
    current = answers
      ? { answers, photo: typeof record.photo === "string" ? record.photo : undefined }
      : null;
  } catch {
    current = null;
  }
  return current;
}
