import type { ReactNode } from "react";
import Link from "next/link";
import { AuthButton } from "@/components/auth/auth-button";
import { Logo } from "@/components/logo";

export function SiteHeader({ action }: { action?: ReactNode }) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
      <Logo />
      <div className="flex items-center gap-2">
        <Link
          href="/blog"
          className="hidden px-3 text-sm font-medium text-ink-soft hover:text-ink sm:inline"
        >
          Guides
        </Link>
        <AuthButton />
        {action}
      </div>
    </header>
  );
}
