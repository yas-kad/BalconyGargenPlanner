import { createUserClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: { email?: unknown; next?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "The request body must be JSON." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL.test(email) || email.length > 254) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const next = typeof body.next === "string" && body.next.startsWith("/") ? body.next : "/chat";
  const origin = siteConfig.url.replace(/\/$/, "");

  try {
    const supabase = await createUserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) return Response.json({ error: error.message }, { status: 400 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Sign-in isn't set up yet. Please try again later." }, { status: 503 });
  }

  return Response.json({ ok: true });
}
