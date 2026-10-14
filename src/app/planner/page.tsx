import type { Metadata } from "next";
import Link from "next/link";
import { X } from "lucide-react";
import { getCountryOptions } from "@/lib/countries";
import { siteConfig } from "@/lib/site";
import { PlannerForm } from "@/components/planner/planner-form";
import { SiteHeader } from "@/components/site-header";
import { buttonStyles } from "@/components/ui/button-styles";

const title = "Create your balcony plan";
const description =
  "Answer a few quick questions about your balcony, sunlight, climate and style to get personalized plant recommendations.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/planner" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${title} · ${siteConfig.name}`,
    description,
    url: "/planner",
  },
  twitter: {
    card: "summary",
    title: `${title} · ${siteConfig.name}`,
    description,
  },
};

export default function PlannerPage() {
  const countries = getCountryOptions();

  return (
    <>
      <SiteHeader
        action={
          <Link
            href="/"
            aria-label="Exit planner"
            className={buttonStyles({ variant: "ghost", className: "px-3 sm:px-4" })}
          >
            <X aria-hidden className="size-4" />
            <span className="hidden sm:inline">Exit</span>
          </Link>
        }
      />
      <main className="flex-1 px-5 pt-4 pb-16 sm:px-8 sm:pt-8 sm:pb-24">
        <div className="mx-auto w-full max-w-2xl">
          <PlannerForm countries={countries} />
        </div>
      </main>
    </>
  );
}
