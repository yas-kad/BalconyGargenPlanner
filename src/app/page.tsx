import type { Metadata } from "next";
import Link from "next/link";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PlanPreview } from "@/components/landing/plan-preview";
import { Spaces } from "@/components/landing/spaces";
import { SiteHeader } from "@/components/site-header";
import { buttonStyles } from "@/components/ui/button-styles";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <SiteHeader
        action={
          <Link
            href="/planner"
            className={buttonStyles({
              variant: "secondary",
              className: "hidden sm:inline-flex",
            })}
          >
            Start planning
          </Link>
        }
      />
      <main className="flex-1">
        <Hero />
        <Spaces />
        <HowItWorks />
        <PlanPreview />
        <FinalCta />
      </main>
    </>
  );
}
