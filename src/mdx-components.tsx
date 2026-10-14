import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import type { ReactNode } from "react";

function heading(Tag: "h2" | "h3", className: string) {
  return function Heading({ children }: { children?: ReactNode }) {
    return <Tag className={className}>{children}</Tag>;
  };
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="font-display text-4xl font-medium tracking-tight text-balance">{children}</h1>
    ),
    h2: heading("h2", "mt-8 font-display text-2xl font-medium tracking-tight"),
    h3: heading("h3", "mt-6 text-lg font-semibold"),
    p: ({ children }) => <p className="mt-3 leading-relaxed text-ink/90">{children}</p>,
    ul: ({ children }) => (
      <ul className="mt-3 list-disc space-y-1.5 pl-5 marker:text-leaf-400">{children}</ul>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    a: ({ children, href }) => (
      <a href={href} className="font-medium text-leaf-700 underline">
        {children}
      </a>
    ),
    img: ({ src, alt }) =>
      typeof src === "string" ? (
        <Image
          src={src}
          alt={alt ?? ""}
          width={1600}
          height={1000}
          className="w-full rounded-[1.5rem] object-cover"
        />
      ) : null,
    figure: ({ children }) => <figure className="mt-8">{children}</figure>,
    figcaption: ({ children }) => (
      <figcaption className="mt-2 text-sm text-ink-soft">{children}</figcaption>
    ),
    ...components,
  };
}
