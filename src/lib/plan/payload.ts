import type { PlanPlant } from "@/lib/chat/events";

export type PlanPayload = {
  plants: PlanPlant[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Reads the `PLANTS_JSON:` object the model appends to a plan. */
export function parsePlanPayload(raw: string): PlanPayload | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) return null;

  let data: unknown;
  try {
    data = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
  if (!isRecord(data) || !Array.isArray(data.plants)) return null;

  const plants: PlanPlant[] = [];
  for (const entry of data.plants) {
    if (!isRecord(entry) || typeof entry.name !== "string") continue;
    const name = entry.name.trim().slice(0, 60);
    const note = typeof entry.note === "string" ? entry.note.trim().slice(0, 160) : "";
    if (name) plants.push({ name, note });
    if (plants.length === 6) break;
  }
  if (plants.length < 3) return null;
  return { plants };
}

/** Holds back the machine-readable tail while the prose streams through. */
export function createPlanSplitter() {
  const marker = "PLANTS_JSON:";
  let buffer = "";
  let json = "";
  let capturing = false;

  return {
    push(delta: string): string {
      if (capturing) {
        json += delta;
        return "";
      }
      buffer += delta;
      const at = buffer.indexOf(marker);
      if (at === -1) {
        const keep = marker.length - 1;
        if (buffer.length <= keep) return "";
        const prose = buffer.slice(0, -keep);
        buffer = buffer.slice(-keep);
        return prose;
      }
      capturing = true;
      json = buffer.slice(at + marker.length);
      const prose = buffer.slice(0, at);
      buffer = "";
      return prose;
    },
    finish(): { prose: string; payload: PlanPayload | null } {
      const prose = capturing ? "" : buffer;
      buffer = "";
      return { prose, payload: capturing ? parsePlanPayload(json) : null };
    },
  };
}
