import { createUserClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createUserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return Response.json({ email: user?.email ?? null });
  } catch {
    return Response.json({ email: null });
  }
}
