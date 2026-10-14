import Image from "next/image";

export function ArticleFigure({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <figure className="mt-8">
      <Image
        src={src}
        alt={alt}
        width={1600}
        height={1000}
        sizes="(min-width: 768px) 768px, 100vw"
        loading="eager"
        className="aspect-[16/10] w-full rounded-[1.5rem] object-cover"
      />
      <figcaption className="mt-2 text-sm text-ink-soft">{caption}</figcaption>
    </figure>
  );
}
