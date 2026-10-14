import { eventNames, type EventName, type EventProperties } from "@/lib/analytics/events";
import { insertEvent } from "@/lib/server/supabase";

const MAX_BODY_CHARS = 4096;
const MAX_PROPERTIES = 12;
const MAX_STRING_LENGTH = 200;

function parseProperties(input: unknown): EventProperties | null {
  if (input === undefined) return {};
  if (typeof input !== "object" || input === null || Array.isArray(input)) return null;

  const entries = Object.entries(input);
  if (entries.length > MAX_PROPERTIES) return null;

  const properties: EventProperties = {};
  for (const [key, value] of entries) {
    if (key.length > 40) return null;
    if (typeof value === "string") properties[key] = value.slice(0, MAX_STRING_LENGTH);
    else if (typeof value === "number" && Number.isFinite(value)) properties[key] = value;
    else if (typeof value === "boolean" || value === null) properties[key] = value;
    else return null;
  }
  return properties;
}

export async function POST(request: Request) {
  const text = await request.text();
  if (text.length > MAX_BODY_CHARS) return new Response(null, { status: 413 });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }

  const name = body?.name;
  const properties = parseProperties(body?.properties);
  if (!eventNames.includes(name as EventName) || !properties) {
    return new Response(null, { status: 400 });
  }

  try {
    await insertEvent({
      name: name as EventName,
      sessionId: typeof body.sessionId === "string" ? body.sessionId.slice(0, 64) : undefined,
      properties,
    });
  } catch (error) {
    console.error(error);
    return new Response(null, { status: 503 });
  }

  return new Response(null, { status: 204 });
}
