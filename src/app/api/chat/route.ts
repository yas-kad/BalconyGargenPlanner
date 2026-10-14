import { buildIntroMessage } from "@/lib/chat/brief";
import type { ChatStreamEvent } from "@/lib/chat/events";
import {
  FOLLOW_UP_LIMIT,
  MAX_QUESTION_CHARS,
  type ChatErrorBody,
  type ChatErrorCode,
  type ChatMessage,
} from "@/lib/chat/protocol";
import { parsePlanAnswers } from "@/lib/planner/submission";
import { getAiProvider } from "@/lib/server/ai/provider";
import type { ChatTurn } from "@/lib/server/ai/types";
import { buildInstructions } from "@/lib/server/chat-prompt";
import { streamPlan } from "@/lib/server/stream-plan";
import { createUserClient } from "@/lib/supabase/server";
import { getClientIp, hashIp } from "@/lib/server/client-ip";
import { NotConfiguredError } from "@/lib/server/errors";
import {
  countRecentChatRequests,
  recordChatRequest,
  type ChatRequestKind,
} from "@/lib/server/supabase";

export const maxDuration = 120;

const DAY_MS = 24 * 60 * 60 * 1000;
/** Saved plans per signed-in account, over a rolling 24 hours. */
const FREE_PLANS_PER_DAY = 3;
/** Per IP, over a rolling 24 hours. Stops one network from generating endlessly. */
const DAILY_LIMITS: Record<ChatRequestKind, number> = { plan: 10, message: 15 };
const MAX_OUTPUT_TOKENS: Record<ChatRequestKind, number> = { plan: 2_500, message: 2_000 };
const MAX_BODY_BYTES = 8 * 1024 * 1024;
const MAX_PHOTO_CHARS = 7 * 1024 * 1024;
const MAX_REPLY_CHARS = 30_000;
const DATA_URL_PATTERN = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;
const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;

function errorResponse(status: number, code: ChatErrorCode, error: string) {
  return Response.json({ error, code } satisfies ChatErrorBody, { status });
}

/** Accepts a base64 data URL or bare base64 (treated as JPEG). */
function parsePhoto(photo: unknown): { dataUrl?: string; error?: ChatErrorCode } {
  if (photo === undefined || photo === null || photo === "") return {};
  if (typeof photo !== "string") return { error: "invalid_request" };
  if (photo.length > MAX_PHOTO_CHARS) return { error: "photo_too_large" };
  if (DATA_URL_PATTERN.test(photo)) return { dataUrl: photo };
  if (BASE64_PATTERN.test(photo)) return { dataUrl: `data:image/jpeg;base64,${photo}` };
  return { error: "invalid_request" };
}

/** Messages must alternate user/assistant, starting and ending with the user. */
function parseMessages(input: unknown): ChatMessage[] | null {
  if (!Array.isArray(input) || input.length % 2 === 0 || input.length > 4 * FOLLOW_UP_LIMIT) {
    return null;
  }

  const messages: ChatMessage[] = [];
  for (const [index, item] of input.entries()) {
    const role = index % 2 === 0 ? "user" : "assistant";
    if (typeof item !== "object" || item === null) return null;
    const { role: itemRole, content } = item as Record<string, unknown>;
    if (itemRole !== role || typeof content !== "string") return null;

    const text = content.trim();
    const maxLength = role === "user" ? MAX_QUESTION_CHARS : MAX_REPLY_CHARS;
    if (index > 0 && (!text || text.length > maxLength)) return null;
    messages.push({ role, content: text });
  }
  return messages;
}

function ndjson(events: AsyncIterable<ChatStreamEvent>, abort: AbortController) {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of events) {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        }
        controller.close();
      } catch (error) {
        if (!abort.signal.aborted) console.error("Chat stream failed:", error);
        controller.error(error);
      }
    },
    cancel() {
      abort.abort();
    },
  });
}

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return errorResponse(413, "photo_too_large", "That photo is too large. Try a smaller one.");
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "invalid_request", "The request body must be JSON.");
  }

  const answers = parsePlanAnswers(body?.answers);
  const messages = parseMessages(body?.messages);
  if (!answers || !messages) {
    return errorResponse(400, "invalid_request", "Some answers or messages are missing or invalid.");
  }

  const photo = parsePhoto(body.photo);
  if (photo.error === "photo_too_large") {
    return errorResponse(413, "photo_too_large", "That photo is too large. Try a smaller one.");
  }
  if (photo.error) {
    return errorResponse(400, "invalid_request", "The photo must be a base64 JPG, PNG or WebP image.");
  }

  const followUps = (messages.length - 1) / 2;
  if (followUps > FOLLOW_UP_LIMIT) {
    return errorResponse(
      429,
      "session_limit",
      `You've used all ${FOLLOW_UP_LIMIT} questions for this plan.`,
    );
  }

  let provider: ReturnType<typeof getAiProvider>;
  let supabase: Awaited<ReturnType<typeof createUserClient>>;
  try {
    provider = getAiProvider();
    supabase = await createUserClient();
  } catch (error) {
    console.error(error);
    return errorResponse(503, "not_configured", "The garden assistant isn't set up yet. Please try again later.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return errorResponse(401, "auth_required", "Sign in to save your planting plan. It's free.");
  }

  const kind: ChatRequestKind = followUps === 0 ? "plan" : "message";

  if (kind === "plan") {
    const since = new Date(Date.now() - DAY_MS).toISOString();
    const { count, error } = await supabase
      .from("plans")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since);
    if (error) {
      console.error(error);
      return errorResponse(502, "generation_failed", "Something went wrong on our side. Please try again.");
    }
    if ((count ?? 0) >= FREE_PLANS_PER_DAY) {
      return errorResponse(
        429,
        "daily_limit",
        `You've created ${FREE_PLANS_PER_DAY} plans in the last 24 hours. You can start another tomorrow.`,
      );
    }
  }

  const ipHash = hashIp(getClientIp(request.headers));

  try {
    const recent = await countRecentChatRequests(ipHash, new Date(Date.now() - DAY_MS));
    if (recent[kind] >= DAILY_LIMITS[kind]) {
      return errorResponse(
        429,
        "daily_limit",
        kind === "plan"
          ? `You've created ${DAILY_LIMITS.plan} plans in the last 24 hours. You can start another tomorrow.`
          : "You've reached today's limit of follow-up questions.",
      );
    }
    await recordChatRequest(ipHash, kind);
  } catch (error) {
    console.error("Chat rate limit failed:", error);
    if (error instanceof NotConfiguredError) {
      return errorResponse(503, "not_configured", "The garden assistant isn't set up yet. Please try again later.");
    }
    return errorResponse(502, "generation_failed", "Something went wrong on our side. Please try again.");
  }

  const turns: ChatTurn[] = messages.map((message, index) =>
    index === 0
      ? {
          role: "user",
          text: buildIntroMessage(answers, Boolean(photo.dataUrl)),
          imageDataUrl: photo.dataUrl,
        }
      : { role: message.role, text: message.content },
  );

  const abort = new AbortController();
  request.signal.addEventListener("abort", () => abort.abort(), { once: true });

  try {
    const instructions = buildInstructions(answers, Boolean(photo.dataUrl), new Date());

    async function* followUpEvents(): AsyncGenerator<ChatStreamEvent> {
      const chunks = await provider.streamReply({
        instructions,
        turns,
        maxOutputTokens: MAX_OUTPUT_TOKENS.message,
        userHash: ipHash,
        signal: abort.signal,
      });
      for await (const delta of chunks) yield { type: "text", delta };
      yield { type: "done" };
    }

    const events: AsyncGenerator<ChatStreamEvent> =
      kind === "plan"
        ? streamPlan({
            supabase,
            userId: user.id,
            answers,
            instructions,
            turns,
            streamReply: provider.streamReply,
            generateImage: provider.generateImage,
            signal: abort.signal,
          })
        : followUpEvents();

    return new Response(ndjson(events, abort), {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error(`Chat request to ${provider.name} failed:`, error);
    return errorResponse(502, "generation_failed", "The garden assistant couldn't reply. Please try again.");
  }
}
