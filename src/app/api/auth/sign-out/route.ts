import { createUserClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createUserClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error(error);
  }
  return new Response(null, { status: 204 });
}
