import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms for using Balcony Garden Planner.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 text-[0.95rem] leading-relaxed">
        <h1 className="font-display text-4xl font-medium tracking-tight">Terms</h1>
        <p className="mt-4 text-ink-soft">Last updated 13 October 2026.</p>
        <h2 className="mt-8 font-display text-2xl font-medium">The plans</h2>
        <p className="mt-3">
          Plant suggestions and pictures are a starting point, not professional horticultural advice.
          Check that a plant is safe for your pets before you buy it.
        </p>
        <h2 className="mt-8 font-display text-2xl font-medium">Free use</h2>
        <p className="mt-3">
          The planner is free. A signed-in account can create up to 3 plans in 24 hours, and ask up to
          5 follow-up questions on each plan. There is also a daily cap on follow-up messages.
        </p>
        <h2 className="mt-8 font-display text-2xl font-medium">Your account</h2>
        <p className="mt-3">
          You&apos;re responsible for the email address you sign in with. Don&apos;t misuse the service
          or try to get around the free-plan limit.
        </p>
      </main>
    </>
  );
}
