"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonStyles } from "@/components/ui/button-styles";

export function AuthButton() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((data: { email?: string | null }) => {
        if (active) setEmail(data.email ?? null);
      })
      .catch(() => {
        if (active) setEmail(null);
      });
    return () => {
      active = false;
    };
  }, []);

  if (email === undefined) return <span className="h-11 w-16" aria-hidden />;

  if (!email) {
    return (
      <Link href="/login" className={buttonStyles({ variant: "ghost", className: "px-3" })}>
        Sign in
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={buttonStyles({ variant: "ghost", className: "max-w-40 px-3" })}
      onClick={() => {
        void fetch("/api/auth/sign-out", { method: "POST" }).then(() => {
          router.refresh();
          setEmail(null);
        });
      }}
    >
      <span className="truncate">Sign out</span>
    </button>
  );
}
