import type { PlanAnswers } from "@/lib/planner/submission";

export type StoredPlant = {
  name: string;
  note: string;
  image_path?: string;
};

export type SavedPlan = {
  id: string;
  user_id: string;
  answers: PlanAnswers;
  summary: string;
  plants: StoredPlant[];
  scene_path: string | null;
  created_at: string;
};

export function planImageUrl(path: string): string {
  const base = (process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
  return `${base}/storage/v1/object/public/plan-images/${path}`;
}
