import "server-only";
import { generateGeminiImage, streamGeminiReply } from "@/lib/server/ai/gemini";
import { generateOpenAIImage, streamOpenAIReply } from "@/lib/server/ai/openai";
import type { GenerateImage, StreamReply } from "@/lib/server/ai/types";
import { NotConfiguredError } from "@/lib/server/errors";

const providers = {
  openai: {
    apiKeyEnv: "OPENAI_API_KEY",
    streamReply: streamOpenAIReply,
    generateImage: generateOpenAIImage,
  },
  gemini: {
    apiKeyEnv: "GEMINI_API_KEY",
    streamReply: streamGeminiReply,
    generateImage: generateGeminiImage,
  },
} satisfies Record<string, { apiKeyEnv: string; streamReply: StreamReply; generateImage: GenerateImage }>;

export type AiProviderName = keyof typeof providers;

/** Picks the provider from `AI_PROVIDER` (default "openai") and checks its key. */
export function getAiProvider(): {
  name: AiProviderName;
  streamReply: StreamReply;
  generateImage: GenerateImage;
} {
  const name = (process.env.AI_PROVIDER || "openai").trim().toLowerCase();
  if (!(name in providers)) {
    throw new NotConfiguredError(`Unknown AI_PROVIDER "${name}". Use "openai" or "gemini".`);
  }

  const provider = providers[name as AiProviderName];
  if (!process.env[provider.apiKeyEnv]) {
    throw new NotConfiguredError(`Set ${provider.apiKeyEnv} to use AI_PROVIDER=${name}.`);
  }
  return {
    name: name as AiProviderName,
    streamReply: provider.streamReply,
    generateImage: provider.generateImage,
  };
}
