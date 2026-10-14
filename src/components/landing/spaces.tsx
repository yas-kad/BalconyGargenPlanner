import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const spaces = [
  {
    title: "Balcony",
    body: "Wind, weight and a railing. Plants that stay in a pot.",
    src: "/images/blog-sunny-hero.jpg",
    alt: "A sunny balcony planted with geraniums, lavender and an olive",
  },
  {
    title: "Terrace",
    body: "More floor, more sun. Room for a small tree and a place to sit.",
    src: "/images/landing-terrace.jpg",
    alt: "A rooftop terrace with grasses and olive trees in large planters",
  },
  {
    title: "Garden",
    body: "A courtyard or a strip of ground, still planned pot by pot.",
    src: "/images/landing-garden.jpg",
    alt: "A small courtyard garden with herbs in terracotta pots",
  },
];

export function Spaces() {
  return (
    <section aria-labelledby="spaces-title" className="px-5 py-8 sm:px-8 lg:py-12">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex items-end justify-between gap-6">
          <h2
            id="spaces-title"
            className="max-w-xl font-display text-3xl leading-tight font-medium tracking-tight text-balance sm:text-5xl"
          >
            The same plan, for three kinds of space.
          </h2>
          <Link
            href="/planner"
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-leaf-800 underline decoration-leaf-300 underline-offset-4 sm:inline-flex"
          >
            Start with yours
            <ArrowUpRight aria-hidden className="size-4" />
          </Link>
        </div>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {spaces.map((space) => (
            <li key={space.title}>
              <Link href="/planner" className="group block">
                <span className="block overflow-hidden rounded-[1.75rem]">
                  <Image
                    src={space.src}
                    alt={space.alt}
                    width={1200}
                    height={900}
                    className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                </span>
                <span className="mt-4 block font-display text-2xl font-medium">{space.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-ink-soft">{space.body}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
