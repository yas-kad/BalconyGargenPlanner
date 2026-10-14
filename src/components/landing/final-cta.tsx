import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonStyles } from "@/components/ui/button-styles";

export function FinalCta() {
  return (
    <section aria-labelledby="final-cta-title" className="px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 overflow-hidden rounded-[2rem] bg-sand lg:grid-cols-2">
        <Image
          src="/images/landing-garden.jpg"
          alt="A quiet courtyard with clipped greens and pots of herbs"
          width={1200}
          height={900}
          className="aspect-[4/3] h-full w-full object-cover lg:aspect-auto lg:min-h-[28rem]"
        />
        <div className="px-6 py-10 sm:px-12 lg:py-16">
          <h2
            id="final-cta-title"
            className="font-display text-3xl leading-tight font-medium tracking-tight text-balance sm:text-5xl"
          >
            Ready to grow something that fits?
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-pretty text-ink-soft">
            Tell us about the space. We’ll match plants to the sun, the climate and the time you have.
          </p>
          <Link href="/planner" className={buttonStyles({ size: "lg", className: "mt-8" })}>
            Create my plan
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
