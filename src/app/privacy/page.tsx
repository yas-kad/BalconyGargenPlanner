import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What Balcony Garden Planner stores about your account and plans.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 text-[0.95rem] leading-relaxed">
        <h1 className="font-display text-4xl font-medium tracking-tight">Privacy</h1>
        <p className="mt-4 text-ink-soft">Last updated 13 October 2026.</p>
        <h2 className="mt-8 font-display text-2xl font-medium">What we store</h2>
        <p className="mt-3">
          When you sign in, we store your email address with Supabase. When you generate a plan, we
          store your questionnaire answers, a short summary, the plant list and the pictures made for
          that plan. We do not keep the chat that follows.
        </p>
        <h2 className="mt-8 font-display text-2xl font-medium">Photos</h2>
        <p className="mt-3">
          A photo you upload is sent to the AI provider to shape the plan. It is not saved in our
          database.
        </p>
        <h2 className="mt-8 font-display text-2xl font-medium">Analytics</h2>
        <p className="mt-3">
          We record a few events, such as finishing the questionnaire, so we can see which steps
          people complete. Those events do not include the text of your plan.
        </p>
      </main>
    </>
  );
}
