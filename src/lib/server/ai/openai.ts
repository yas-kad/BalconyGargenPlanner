import "server-only";
import OpenAI from "openai";
import type {
  ResponseInput,
  ResponseInputContent,
} from "openai/resources/responses/responses";
import { CUT_SHORT_NOTE, type GenerateImage, type StreamReply } from "@/lib/server/ai/types";

const DEFAULT_MODEL = "gpt-5.4-mini";

export const streamOpenAIReply: StreamReply = async ({
  instructions,
  turns,
  maxOutputTokens,
  userHash,
  signal,
}) => {
  const input: ResponseInput = turns.map((turn) => {
    if (turn.role === "assistant" || !turn.imageDataUrl) {
      return { role: turn.role, content: turn.text };
    }
    const content: ResponseInputContent[] = [
      { type: "input_text", text: turn.text },
      { type: "input_image", image_url: turn.imageDataUrl, detail: "auto" },
    ];
    return { role: "user", content };
  });

  const openai = new OpenAI({ timeout: 110_000, maxRetries: 1 });
  const events = await openai.responses.create(
    {
      model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
      instructions,
      input,
      max_output_tokens: maxOutputTokens,
      stream: true,
      store: false,
      safety_identifier: userHash,
    },
    { signal },
  );

  return (async function* () {
    for await (const event of events) {
      switch (event.type) {
        case "response.output_text.delta":
        case "response.refusal.delta":
          yield event.delta;
          break;
        case "response.incomplete":
          yield CUT_SHORT_NOTE;
          break;
        case "response.failed":
          throw new Error(event.response.error?.message ?? "The OpenAI response failed.");
        case "error":
          throw new Error(event.message);
      }
    }
    })();
};

export const generateOpenAIImage: GenerateImage = async (prompt, signal) => {
  const openai = new OpenAI({ timeout: 110_000, maxRetries: 1 });
  const result = await openai.images.generate(
    {
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1.5",
      prompt,
      size: "1024x1024",
      quality: "low",
      output_format: "jpeg",
    },
    { signal },
  );
  const base64 = result.data?.[0]?.b64_json;
  if (!base64) throw new Error("OpenAI returned no image.");
  return { mimeType: "image/jpeg", base64 };
};
