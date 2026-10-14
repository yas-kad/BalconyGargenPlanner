import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonStyles } from "@/components/ui/button-styles";

export function Hero() {
  return (
    <section className="px-5 pt-4 pb-16 sm:px-8 lg:pt-8 lg:pb-24">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-leaf-700 uppercase">
            Balcony · Terrace · Garden
          </p>
          <h1 className="mt-5 font-display text-[2.75rem] leading-[0.98] font-medium tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Plants chosen for the light you actually have.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-pretty text-ink-soft">
            A few questions, then a short plan: one picture of the planting, and a photo of each plant, sized for your climate and your week.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/planner" className={buttonStyles({ size: "lg" })}>
              Create my plan
              <ArrowRight aria-hidden className="size-4" />
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-ink underline decoration-leaf-300 underline-offset-4 hover:decoration-leaf-700"
            >
              Read the guides
            </Link>
          </div>
          <p className="mt-6 text-sm text-ink-soft">About 5 minutes · First plan is free</p>
        </div>

        <div className="relative">
          <Image
            src="/images/landing-hero.jpg"
            alt="A sunlit balcony with an olive, lavender and trailing jasmine in terracotta pots"
            width={1600}
            height={900}
            priority
            loading="eager"
            className="aspect-[5/4] w-full rounded-[2rem] object-cover shadow-2xl shadow-leaf-900/10 sm:aspect-[16/11]"
          />
          <Image
            src="/images/landing-detail.jpg"
            alt="Lavender and rosemary in a terracotta pot"
            width={800}
            height={800}
            className="absolute -bottom-8 -left-4 hidden w-36 rounded-2xl object-cover shadow-xl ring-4 ring-cream sm:block lg:-left-10 lg:w-44"
          />
        </div>
      </div>
    </section>
  );
}
