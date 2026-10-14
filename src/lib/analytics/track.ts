import type {
  EventName,
  EventProperties,
  TrackRequestBody,
} from "@/lib/analytics/events";

const SESSION_KEY = "bgp-session-id";

/** A per-tab id that ties questionnaire steps to the chat they lead to. */
function getSessionId(): string | undefined {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

/** Fire-and-forget; uses a beacon so events survive navigating away. */
export function track(name: EventName, properties?: EventProperties) {
  const payload: TrackRequestBody = {
    name,
    sessionId: getSessionId(),
    properties,
  };
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
    return;
  }
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}
