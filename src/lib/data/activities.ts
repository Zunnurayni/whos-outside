import type { ActivityView, EventView } from "@/lib/types";
import { SAMPLE_ACTIVITIES, SAMPLE_EVENTS } from "./sample";
import { createClient } from "@/lib/supabase/server";
import { mapActivityRow, mapEventRow, type ActivityRow, type EventRowJoined } from "./map-row";

/**
 * Data access layer.
 *
 * DEMO MODE (no Supabase env vars): returns the Yola sample set so the app
 * runs with zero setup.
 *
 * LIVE MODE (env vars set): runs real Supabase queries. On any error it falls
 * back to sample data so a misconfigured env never shows a blank app. The
 * return types never change, so no screen needs to be touched.
 */

const ACTIVITY_SELECT = `
  id, title, description, category, starts_at, ends_at,
  estimated_cost_per_person, cost_mode, total_cost, host_contribution, sponsor_name,
  min_participants, max_participants, status, creator_id,
  venues ( name, city, lat, lng ),
  creator:profiles!activities_creator_id_fkey ( display_name, handle ),
  activity_participants ( user_id, status )
`;

export function isLiveMode(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function getActivities(): Promise<ActivityView[]> {
  const supabase = createClient();
  if (!supabase) return SAMPLE_ACTIVITIES;

  const { data, error } = await supabase
    .from("activities")
    .select(ACTIVITY_SELECT)
    .in("status", ["open", "filled"])
    .order("starts_at", { ascending: true });

  if (error || !data) return SAMPLE_ACTIVITIES;
  return (data as unknown as ActivityRow[]).map(mapActivityRow);
}

export async function getActivity(id: string): Promise<ActivityView | undefined> {
  const supabase = createClient();
  if (!supabase) return SAMPLE_ACTIVITIES.find((a) => a.id === id);

  const { data, error } = await supabase
    .from("activities")
    .select(ACTIVITY_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) return undefined;
  if (!data) return SAMPLE_ACTIVITIES.find((a) => a.id === id);
  return mapActivityRow(data as unknown as ActivityRow);
}

export async function getEvents(): Promise<EventView[]> {
  const supabase = createClient();
  if (!supabase) return SAMPLE_EVENTS;

  const { data, error } = await supabase
    .from("events")
    .select("id, title, organiser_name, category, starts_at, venues ( name )")
    .eq("status", "published")
    .order("starts_at", { ascending: true });

  if (error || !data) return SAMPLE_EVENTS;
  return (data as unknown as EventRowJoined[]).map((row) => mapEventRow(row));
}

// spotsLeft now lives in categories.ts (client-safe). Re-exported here so any
// existing server-side import keeps working.
export { spotsLeft } from "@/lib/categories";
