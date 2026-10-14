import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { planImageUrl, type SavedPlan } from "@/lib/plan/record";
import { createUserClient } from "@/lib/supabase/server";
import { PlanFollowUp } from "@/components/plan/plan-follow-up";
import { PlanGallery } from "@/components/plan/plan-gallery";
import { SiteHeader } from "@/components/site-header";
import { buttonStyles } from "@/components/ui/button-styles";

export const metadata: Metadata = {
  title: "Your planting plan",
  robots: { index: false, follow: false },
};

export default function PlanPage({ params }: PageProps<"/plan/[id]">) {
  return (
    <>
      <SiteHeader
        action={
          <Link href="/planner" className={buttonStyles({ variant: "secondary", className: "px-3 sm:px-4" })}>
            <Plus aria-hidden className="size-4" />
            <span className="hidden sm:inline">New plan</span>
          </Link>
        }
      />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-2 pb-16 sm:px-8">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-[1.75rem] bg-sand/70" />}>
          {params.then(({ id }) => (
            <PlanContent id={id} />
          ))}
        </Suspense>
      </main>
    </>
  );
}

async function PlanContent({ id }: { id: string }) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createUserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/plan/${id}`);

  const { data: plan } = await supabase.from("plans").select("*").eq("id", id).maybeSingle<SavedPlan>();
  if (!plan) notFound();

  const plants = (plan.plants ?? []).map((plant) => ({
    name: plant.name,
    note: plant.note,
    image: plant.image_path ? planImageUrl(plant.image_path) : undefined,
  }));

  return (
    <>
      <h1 className="sr-only">Your planting plan</h1>
      <PlanGallery
        summary={plan.summary}
        sceneUrl={plan.scene_path ? planImageUrl(plan.scene_path) : undefined}
        plants={plants}
      />
      <PlanFollowUp answers={plan.answers} summary={plan.summary} />
    </>
  );
}
