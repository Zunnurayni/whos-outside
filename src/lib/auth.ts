import { createClient } from "@/lib/supabase/server";
import { ME } from "@/lib/data/sample";
import type { Person } from "@/lib/types";
import { rowToPerson } from "@/lib/data/profiles";

/**
 * Current signed-in user as a Person, or null when signed out.
 * In demo mode (no Supabase) we return the sample ME so the app is navigable
 * exactly as before.
 */
export async function getCurrentUser(): Promise<Person | null> {
  const supabase = createClient();
  if (!supabase) return ME; // demo mode: always "signed in" as Nurain

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, handle")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) return rowToPerson(profile);
  // profile row not created yet — fall back to auth metadata
  return {
    id: user.id,
    name: (user.user_metadata?.display_name as string) ?? user.email?.split("@")[0] ?? "You",
    initials: (user.email?.[0] ?? "Y").toUpperCase(),
    color: "#6c4cf0",
  };
}

/** True when a real backend is connected (used to decide demo vs live UI copy). */
export function isBackendLive(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
