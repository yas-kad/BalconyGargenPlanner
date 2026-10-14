import { ImageIcon } from "lucide-react";
import type { PlanPlant } from "@/lib/chat/events";
import { ChatMarkdown } from "@/components/chat/chat-markdown";

function Picture({ src, alt, className }: { src?: string; alt: string; className: string }) {
  if (!src) {
    return (
      <div className={`grid place-items-center bg-sand text-leaf-400 ${className}`}>
        <ImageIcon aria-hidden className="size-6 animate-pulse" />
        <span className="sr-only">Drawing {alt}</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- generated images are data URLs or public storage files
    <img src={src} alt={alt} className={`object-cover ${className}`} />
  );
}

export function PlanGallery({
  summary,
  sceneUrl,
  plants,
  imagesLoading,
}: {
  summary: string;
  sceneUrl?: string;
  plants: PlanPlant[];
  imagesLoading?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-leaf-100 bg-white shadow-sm shadow-leaf-900/5">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0">
          <Picture
            src={sceneUrl}
            alt="Your planted space"
            className="aspect-[4/5] w-full bg-sand sm:aspect-[5/4] lg:aspect-auto lg:h-full lg:min-h-[28rem]"
          />
        </div>
        <ul className="divide-y divide-leaf-100 border-t border-leaf-100 lg:border-t-0 lg:border-l">
          {plants.map((plant) => (
            <li key={plant.name} className="flex items-center gap-3 px-3 py-3">
              <Picture
                src={plant.image}
                alt=""
                className="size-14 shrink-0 rounded-xl bg-sand"
              />
              <div className="min-w-0">
                <p className="font-medium text-ink">{plant.name}</p>
                {plant.note && <p className="mt-0.5 text-sm leading-snug text-ink-soft">{plant.note}</p>}
              </div>
            </li>
          ))}
          {plants.length === 0 && imagesLoading && (
            <li className="px-4 py-6 text-sm text-ink-soft">Choosing the plants…</li>
          )}
        </ul>
      </div>

      {summary && (
        <div className="border-t border-leaf-100 px-4 py-4 sm:px-6">
          <ChatMarkdown content={summary} />
        </div>
      )}
    </div>
  );
}
