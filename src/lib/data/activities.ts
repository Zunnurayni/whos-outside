import type { ActivityView, EventView } from "@/lib/types";
import { SAMPLE_ACTIVITIES, SAMPLE_EVENTS } from "./sample";

/**
 * Data access layer.
 *
 * DEMO MODE (no Supabase env vars): returns the Yola sample set so the app
 * runs with zero setup.
 *
 * LIVE MODE: once you connect Supabase, replace the bodies below with real
 * queries. The function signatures stay the same, so no screen needs to
 * change. See docs/BUILD_GUIDE.md Phase 2 for the exact query to drop in —
 * a worked example is left in a comment inside getActivities().
 */

export function isLiveMode(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function getActivities(): Promise<ActivityView[]> {
  // LIVE MODE example (Phase 2) — uncomment once your schema is seeded:
  //
  //   const supabase = createClient(); // from "@/lib/supabase/server"
  //   if (supabase) {
  //     const { data } = await supabase
  //       .from("activities")
  //       .select("*, venues(name, city), activity_participants(user_id)")
  //       .eq("status", "open")
  //       .order("starts_at");
  //     if (data) return data.map(mapRowToView);
  //   }
  //
  // Until then, demo data:
  return SAMPLE_ACTIVITIES;
}

export async function getActivity(id: string): Promise<ActivityView | undefined> {
  const all = await getActivities();
  return all.find((a) => a.id === id);
}

export async function getEvents(): Promise<EventView[]> {
  return SAMPLE_EVENTS;
}

export function spotsLeft(a: ActivityView): number {
  return a.max - a.crew.length;
}
