import type { ActivityView, EventView, CategoryId } from "@/lib/types";
import { categoryEmoji } from "@/lib/categories";

/**
 * Maps Supabase rows (snake_case, joined venue + participants) into the
 * ActivityView / EventView the screens render. Keeping this here means the
 * query shape and the view shape are bridged in one place.
 */

// The row shape returned by the activities select in queries.ts
export interface ActivityRow {
  id: string;
  title: string;
  description: string;
  category: string;
  starts_at: string;
  ends_at: string | null;
  estimated_cost_per_person: number | string | null;
  min_participants: number;
  max_participants: number;
  status: string;
  creator_id: string;
  venues: { name: string | null; city: string | null } | null;
  activity_participants: { user_id: string; status: string }[] | null;
}

export interface EventRowJoined {
  id: string;
  title: string;
  organiser_name: string;
  category: string;
  starts_at: string;
  venues: { name: string | null } | null;
}

/** Derive a friendly "Today / Tomorrow / Saturday" label from a timestamp. */
export function dayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(d) - startOf(now)) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays > 1 && diffDays < 7) return d.toLocaleDateString("en-GB", { weekday: "long" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true });
}

function durationLabel(startIso: string, endIso: string | null): string {
  if (!endIso) return "a few hrs";
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  const hrs = ms / 3_600_000;
  if (hrs <= 0) return "a few hrs";
  if (hrs < 1) return `${Math.round(hrs * 60)} min`;
  return Number.isInteger(hrs) ? `${hrs} hrs` : `${hrs.toFixed(1)} hrs`;
}

// Stable pseudo-position so each activity lands somewhere sensible on the
// stylised map until Phase 3 swaps in a real map from real coordinates.
function pseudoPos(id: string): { x: number; y: number } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return { x: 18 + (h % 64), y: 20 + ((h >> 8) % 58) };
}

export function mapActivityRow(row: ActivityRow): ActivityView {
  const crew = (row.activity_participants ?? [])
    .filter((p) => p.status === "accepted" || p.status === "confirmed_on_way" || p.status === "attended")
    .map((p) => p.user_id);
  // the creator always counts as part of the crew
  if (!crew.includes(row.creator_id)) crew.unshift(row.creator_id);

  const cost = Number(row.estimated_cost_per_person ?? 0);
  const pos = pseudoPos(row.id);
  const spotsOpen = row.max_participants - crew.length;
  const status: ActivityView["status"] =
    spotsOpen <= 0 ? "filled" : spotsOpen <= Math.max(1, Math.ceil(row.max_participants * 0.3)) ? "filling" : "open";

  const category = (row.category as CategoryId) ?? "nightlife";

  return {
    id: row.id,
    emoji: categoryEmoji(category),
    category,
    title: row.title,
    description: row.description,
    venue: row.venues?.name ?? "A spot in town",
    area: row.venues?.name ? row.venues.name.split(",").pop()?.trim() ?? "Yola" : "Yola",
    city: row.venues?.city ?? "Yola",
    hostId: row.creator_id,
    day: dayLabel(row.starts_at),
    time: timeLabel(row.starts_at),
    duration: durationLabel(row.starts_at, row.ends_at),
    cost,
    min: row.min_participants,
    max: row.max_participants,
    crew,
    status,
    mapX: pos.x,
    mapY: pos.y,
  };
}

const EVENT_EMOJI: Record<string, string> = {
  tech: "🎪",
  sports: "🏆",
  music: "🎶",
  food: "🍽️",
  arts: "🎨",
};

export function mapEventRow(row: EventRowJoined, interested = 0): EventView {
  return {
    id: row.id,
    emoji: EVENT_EMOJI[row.category] ?? "🎉",
    title: row.title,
    org: row.organiser_name,
    day: dayLabel(row.starts_at),
    venue: row.venues?.name ?? "Venue TBC",
    interested,
    category: (row.category as CategoryId) ?? "nightlife",
  };
}
