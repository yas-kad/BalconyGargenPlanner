import Link from "next/link";
import { Sprout } from "lucide-react";

export function Logo() {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-leaf-600"
    >
      <span className="grid size-9 place-items-center rounded-full bg-leaf-700 text-cream transition-colors group-hover:bg-leaf-800">
        <Sprout aria-hidden className="size-[18px]" strokeWidth={2} />
      </span>
      <span className="font-display text-[17px] font-medium tracking-tight text-ink">
        Balcony Garden Planner
      </span>
    </Link>
  );
}
