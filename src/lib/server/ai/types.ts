export type ChatTurn = {
  role: "user" | "assistant";
  text: string;
  /** `data:image/…;base64,` URL; only sent on user turns. */
  imageDataUrl?: string;
};

export type ReplyStreamOptions = {
  instructions: string;
  turns: ChatTurn[];
  maxOutputTokens: number;
  /** Hashed requester id, for providers that support abuse monitoring. */
  userHash: string;
  signal: AbortSignal;
};

/**
 * Resolves once the provider has accepted the request, so auth and validation
 * errors surface before any text is streamed to the browser.
 */
export type StreamReply = (options: ReplyStreamOptions) => Promise<AsyncIterable<string>>;

export const CUT_SHORT_NOTE = "\n\n_This reply was cut short. Ask me to continue._";

export type GeneratedImage = {
  mimeType: string;
  base64: string;
};

export type GenerateImage = (prompt: string, signal: AbortSignal) => Promise<GeneratedImage>;
