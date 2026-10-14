import { NextResponse } from "next/server";
import { createUserClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const destination = next && next.startsWith("/") ? next : "/chat";

  if (!code) return NextResponse.redirect(new URL("/login?error=link", url.origin));

  try {
    const supabase = await createUserClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL("/login?error=link", url.origin));

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").insert({ id: user.id, email: user.email });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL("/login?error=link", url.origin));
  }

  return NextResponse.redirect(new URL(destination, url.origin));
}
