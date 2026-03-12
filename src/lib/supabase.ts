import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  supabase = createClient(url, key);
  return supabase;
}

export async function loadUserData(userId: string) {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("focus_data")
    .select("data")
    .eq("user_id", userId)
    .single();
  if (error || !data) return null;
  return data.data;
}

export async function saveUserData(userId: string, userData: unknown) {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from("focus_data").upsert(
    {
      user_id: userId,
      data: userData,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (error) console.error("Save error:", error);
}
