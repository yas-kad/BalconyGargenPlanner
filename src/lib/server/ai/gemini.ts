import "server-only";
import { FinishReason, GoogleGenAI, Modality, type Content, type Part } from "@google/genai";
import { CUT_SHORT_NOTE, type GenerateImage, type StreamReply } from "@/lib/server/ai/types";

const DEFAULT_MODEL = "gemini-3.8-flash";
const DATA_URL_PATTERN = /^data:(image\/[a-z]+);base64,(.+)$/;

export const streamGeminiReply: StreamReply = async ({
  instructions,
  turns,
  maxOutputTokens,
  signal,
}) => {
  const contents: Content[] = turns.map((turn) => {
    const parts: Part[] = [{ text: turn.text }];
    const image = turn.role === "user" ? turn.imageDataUrl?.match(DATA_URL_PATTERN) : null;
    if (image) parts.push({ inlineData: { mimeType: image[1], data: image[2] } });
    return { role: turn.role === "assistant" ? "model" : "user", parts };
  });

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const stream = await ai.models.generateContentStream({
    model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
    contents,
    config: { systemInstruction: instructions, maxOutputTokens, abortSignal: signal },
  });

  return (async function* () {
    let finishReason: FinishReason | undefined;
    for await (const chunk of stream) {
      const blocked = chunk.promptFeedback?.blockReason;
      if (blocked) throw new Error(`Gemini blocked the request (${blocked}).`);

      const text = chunk.text;
      if (text) yield text;
      finishReason = chunk.candidates?.[0]?.finishReason ?? finishReason;
    }

    if (finishReason === FinishReason.MAX_TOKENS) {
      yield CUT_SHORT_NOTE;
    } else if (finishReason && finishReason !== FinishReason.STOP) {
      throw new Error(`Gemini stopped early (${finishReason}).`);
    }
  })();
};

const DEFAULT_IMAGE_MODEL = "gemini-3.1-flash-image";

export const generateGeminiImage: GenerateImage = async (prompt, signal) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_IMAGE_MODEL || DEFAULT_IMAGE_MODEL,
    contents: prompt,
    config: {
      responseModalities: [Modality.IMAGE],
      abortSignal: signal,
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts ?? []) {
    if (part.inlineData?.data) {
      return {
        mimeType: part.inlineData.mimeType || "image/png",
        base64: part.inlineData.data,
      };
    }
  }
  throw new Error("Gemini returned no image.");
};
