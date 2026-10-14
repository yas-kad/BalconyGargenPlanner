import Link from "next/link";
import { buttonStyles } from "@/components/ui/button-styles";

export default function PlanNotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="font-display text-3xl font-medium">We couldn&apos;t find this plan</h1>
      <p className="mt-3 text-ink-soft">It may belong to another account, or the link is out of date.</p>
      <Link href="/planner" className={`${buttonStyles()} mt-6`}>
        Start a plan
      </Link>
    </div>
  );
}
