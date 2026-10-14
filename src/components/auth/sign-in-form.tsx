"use client";

import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { buttonStyles } from "@/components/ui/button-styles";

export function SignInForm({ next = "/chat", compact = false }: { next?: string; compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, next }),
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(data?.error ?? "We couldn't send the sign-in link.");
        return;
      }
      setSent(true);
    } catch {
      setError("We couldn't reach our servers. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <p role="status" className="text-sm leading-relaxed text-ink">
        Check <span className="font-medium">{email}</span> for a sign-in link. It opens your plan
        where you left off.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className={compact ? "" : "mx-auto max-w-md"}>
      {!compact && (
        <>
          <h1 className="font-display text-3xl font-medium tracking-tight">Sign in</h1>
          <p className="mt-2 text-ink-soft">
            We&apos;ll email you a link. Your first plan is free, and it stays saved to this account.
          </p>
        </>
      )}
      <label htmlFor="sign-in-email" className="mt-4 block text-sm font-medium">
        Email
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id="sign-in-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="h-11 flex-1 rounded-full border border-leaf-200 bg-white px-4 text-base outline-none focus:border-leaf-400"
        />
        <button type="submit" disabled={pending} className={buttonStyles()}>
          <Mail aria-hidden className="size-4" />
          {pending ? "Sending…" : "Email me a link"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-terracotta">
          {error}
        </p>
      )}
    </form>
  );
}
