import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ChatView } from "@/components/chat/chat-view";
import { SiteHeader } from "@/components/site-header";
import { buttonStyles } from "@/components/ui/button-styles";

export const metadata: Metadata = {
  title: "Your balcony plan",
  description: "Your personal balcony garden plan, with a garden assistant to answer your questions.",
  robots: { index: false, follow: false },
};

export default function ChatPage() {
  return (
    <>
      <SiteHeader
        action={
          <Link
            href="/planner"
            aria-label="Create a new plan"
            className={buttonStyles({ variant: "secondary", className: "px-3 sm:px-4" })}
          >
            <Plus aria-hidden className="size-4" />
            <span className="hidden sm:inline">New plan</span>
          </Link>
        }
      />
      <main className="flex flex-1 flex-col px-4 sm:px-8">
        <ChatView />
      </main>
    </>
  );
}
