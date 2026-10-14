import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { EventName, EventProperties } from "@/lib/analytics/events";
import { NotConfiguredError } from "@/lib/server/errors";

let client: SupabaseClient | undefined;

function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new NotConfiguredError("Set SUPABASE_URL and SUPABASE_ANON_KEY.");
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}

// The anon role can only insert rows. Usage counts are read through the
// `count_recent_chat_requests` function defined in supabase/schema.sql.

/** A plan is the first reply of a chat; a message is any follow-up answer. */
export type ChatRequestKind = "plan" | "message";

export async function recordChatRequest(ipHash: string, kind: ChatRequestKind) {
  const { error } = await getSupabase()
    .from("chat_requests")
    .insert({ ip_hash: ipHash, kind });
  if (error) throw new Error(`Failed to record chat request: ${error.message}`);
}

export async function countRecentChatRequests(
  ipHash: string,
  since: Date,
): Promise<Record<ChatRequestKind, number>> {
  const { data, error } = await getSupabase()
    .rpc("count_recent_chat_requests", { p_ip_hash: ipHash, p_since: since.toISOString() })
    .single<{ plans: number; messages: number }>();
  if (error) throw new Error(`Failed to check rate limit: ${error.message}`);
  return { plan: Number(data.plans), message: Number(data.messages) };
}

export async function insertEvent(event: {
  name: EventName;
  sessionId?: string;
  properties?: EventProperties;
}) {
  const { error } = await getSupabase().from("events").insert({
    name: event.name,
    session_id: event.sessionId ?? null,
    properties: event.properties ?? {},
  });
  if (error) throw new Error(`Failed to record event: ${error.message}`);
}
