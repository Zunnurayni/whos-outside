import type { Person } from "@/lib/types";
import { personById as samplePerson, PEOPLE } from "./sample";
import { createClient } from "@/lib/supabase/server";

/**
 * Resolves profile rows into the Person shape the Avatar/crew UI uses.
 * Falls back to the sample people map in demo mode or on error.
 */

const PALETTE = ["#6c4cf0", "#e0668a", "#2f9e6f", "#d9802b", "#4b7bd4", "#8b5cf0", "#c0583f", "#1f9d8b"];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

function colorFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function rowToPerson(row: { id: string; display_name: string; handle: string | null }): Person {
  return {
    id: row.id,
    name: row.display_name,
    handle: row.handle ? `@${row.handle}` : undefined,
    initials: initials(row.display_name),
    color: colorFor(row.id),
  };
}

/** Fetch many profiles at once, keyed by id, for crew rendering. */
export async function getProfiles(ids: string[]): Promise<Record<string, Person>> {
  const unique = Array.from(new Set(ids)).filter(Boolean);
  const supabase = createClient();
  if (!supabase || unique.length === 0) {
    // demo mode: use the sample people map
    return Object.fromEntries(unique.map((id) => [id, samplePerson(id)]));
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, handle")
    .in("id", unique);

  const out: Record<string, Person> = {};
  for (const id of unique) out[id] = PEOPLE[id] ?? samplePerson(id);
  for (const row of data ?? []) out[row.id] = rowToPerson(row);
  return out;
}

/** The current user's chosen interest categories (empty in demo mode). */
export async function getMyInterests(): Promise<string[]> {
  const supabase = createClient();
  if (!supabase) return [];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("user_interests")
    .select("category")
    .eq("user_id", user.id);
  return (data ?? []).map((r) => r.category);
}
