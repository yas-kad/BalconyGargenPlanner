import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChatStreamEvent, PlanPlant } from "@/lib/chat/events";
import { createPlanSplitter } from "@/lib/plan/payload";
import type { PlanAnswers } from "@/lib/planner/submission";
import type { ChatTurn, GenerateImage, StreamReply } from "@/lib/server/ai/types";

const IMAGE_CONCURRENCY = 3;

async function uploadImage(
  supabase: SupabaseClient,
  path: string,
  mimeType: string,
  base64: string,
) {
  const { error } = await supabase.storage.from("plan-images").upload(path, Buffer.from(base64, "base64"), {
    contentType: mimeType,
    upsert: true,
  });
  if (error) throw new Error(error.message);
  return supabase.storage.from("plan-images").getPublicUrl(path).data.publicUrl;
}

function scenePrompt(answers: PlanAnswers, plants: PlanPlant[]) {
  const { location, balcony, preferences } = answers;
  return [
    `Photorealistic photo of a planted ${balcony.spaceType} in ${location.city}.`,
    `${balcony.sunExposure} sunlight, facing ${balcony.direction}, ${balcony.windExposure} wind.`,
    `Style: ${preferences.style}. Include these plants, in containers on a balcony or terrace: ${plants.map((plant) => plant.name).join(", ")}.`,
    "Natural daylight, lived-in, no people, no text, no labels, no watermark.",
  ].join(" ");
}

export async function* streamPlan({
  supabase,
  userId,
  answers,
  instructions,
  turns,
  streamReply,
  generateImage,
  signal,
}: {
  supabase: SupabaseClient;
  userId: string;
  answers: PlanAnswers;
  instructions: string;
  turns: ChatTurn[];
  streamReply: StreamReply;
  generateImage: GenerateImage;
  signal: AbortSignal;
}): AsyncGenerator<ChatStreamEvent> {
  const splitter = createPlanSplitter();
  let summary = "";
  const chunks = await streamReply({
    instructions,
    turns,
    maxOutputTokens: 2_500,
    userHash: userId,
    signal,
  });

  for await (const delta of chunks) {
    const prose = splitter.push(delta);
    if (!prose) continue;
    summary += prose;
    yield { type: "text", delta: prose };
  }
  const finished = splitter.finish();
  if (finished.prose) {
    summary += finished.prose;
    yield { type: "text", delta: finished.prose };
  }
  summary = summary.trim();

  if (!finished.payload) {
    yield {
      type: "error",
      message: "The reply arrived without a plant list, so no pictures were made. Please try again.",
    };
    yield { type: "done" };
    return;
  }

  const payload = finished.payload;
  yield {
    type: "plants",
    plants: payload.plants.map(({ name, note }) => ({ name, note })),
  };
  const planId = crypto.randomUUID();
  const stored = payload.plants.map((plant) => ({ ...plant, imagePath: undefined as string | undefined }));
  let scenePath: string | undefined;
  const queue: ChatStreamEvent[] = [];
  let wake: (() => void) | undefined;
  let workersDone = false;

  const jobs: ({ kind: "scene" } | { kind: "plant"; index: number })[] = [
    { kind: "scene" },
    ...stored.map((_, index) => ({ kind: "plant" as const, index })),
  ];

  const notify = () => {
    wake?.();
    wake = undefined;
  };

  let cursor = 0;
  const workers = (async () => {
    async function worker() {
      while (cursor < jobs.length) {
        const job = jobs[cursor];
        cursor += 1;
        try {
          const image =
            job.kind === "scene"
              ? await generateImage(scenePrompt(answers, stored), signal)
              : await generateImage(
                  `Photorealistic close-up of ${stored[job.index].name} in a pot, soft daylight, simple background, no text, no labels, no watermark.`,
                  signal,
                );
          const extension = image.mimeType.includes("jpeg") ? "jpg" : "png";
          const file = job.kind === "scene" ? "scene" : `plant-${job.index}`;
          const path = `${userId}/${planId}/${file}.${extension}`;
          const url = await uploadImage(supabase, path, image.mimeType, image.base64);
          if (job.kind === "scene") {
            scenePath = path;
            queue.push({ type: "scene", image: url });
          } else {
            stored[job.index].imagePath = path;
            queue.push({ type: "plant", name: stored[job.index].name, image: url });
          }
        } catch (error) {
          console.error("Image generation failed:", error);
        }
        notify();
      }
    }
    await Promise.all(Array.from({ length: Math.min(IMAGE_CONCURRENCY, jobs.length) }, worker));
    workersDone = true;
    notify();
  })();

  while (!workersDone || queue.length > 0) {
    if (queue.length === 0) {
      await new Promise<void>((resolve) => {
        if (workersDone || queue.length > 0) resolve();
        else wake = resolve;
      });
      continue;
    }
    const event = queue.shift();
    if (event) yield event;
  }
  await workers;

  const plants = stored
    .filter((plant) => plant.imagePath)
    .map((plant) => ({ name: plant.name, note: plant.note, image_path: plant.imagePath }));

  const { error } = await supabase.from("plans").insert({
    id: planId,
    user_id: userId,
    answers,
    summary,
    plants,
    scene_path: scenePath ?? null,
  });
  if (error) {
    console.error("Failed to save plan:", error.message);
    yield { type: "error", message: "The pictures are ready, but the plan could not be saved." };
  } else {
    yield { type: "plan", id: planId };
  }
  yield { type: "done" };
}
