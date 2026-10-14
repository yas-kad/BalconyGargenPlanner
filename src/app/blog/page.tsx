import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { posts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Practical guides for balcony, terrace and garden containers.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <>
      <p className="text-xs font-semibold tracking-[0.22em] text-leaf-700 uppercase">Guides</p>
      <h1 className="mt-3 max-w-xl font-display text-4xl font-medium tracking-tight text-balance sm:text-6xl">
        From the garden notebook
      </h1>
      <p className="mt-4 max-w-lg text-lg leading-relaxed text-ink-soft">
        Sun, watering, and plants that behave in a pot.
      </p>
      <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="group block">
              <span className="block overflow-hidden rounded-[1.5rem]">
                <Image
                  src={post.cover}
                  alt={post.coverAlt}
                  width={1200}
                  height={675}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  loading="eager"
                  className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </span>
              <p className="mt-4 text-xs font-medium tracking-wide text-leaf-600 uppercase">
                {new Date(post.date).toLocaleDateString("en", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <h2 className="mt-1 font-display text-2xl font-medium tracking-tight group-hover:text-leaf-800">
                {post.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{post.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
