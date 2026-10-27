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
  cost_mode?: string | null;
  total_cost?: number | string | null;
  host_contribution?: number | string | null;
  sponsor_name?: string | null;
  min_participants: number;
  max_participants: number;
  status: string;
  creator_id: string;
  venues: { name: string | null; city: string | null; lat: number | null; lng: number | null } | null;
  creator?: { display_name: string | null; handle: string | null } | null;
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
    hostName: row.creator?.display_name ?? undefined,
    day: dayLabel(row.starts_at),
    time: timeLabel(row.starts_at),
    duration: durationLabel(row.starts_at, row.ends_at),
    cost,
    costMode: (row.cost_mode as ActivityView["costMode"]) ?? "even",
    totalCost: Number(row.total_cost ?? 0),
    hostContribution: Number(row.host_contribution ?? 0),
    sponsorName: row.sponsor_name ?? null,
    min: row.min_participants,
    max: row.max_participants,
    crew,
    status,
    mapX: pos.x,
    mapY: pos.y,
    lat: row.venues?.lat ?? null,
    lng: row.venues?.lng ?? null,
    themeGradient: CATEGORY_GRADIENT[category] ?? CATEGORY_GRADIENT.nightlife,
    vibes: CATEGORY_VIBES[category] ?? [],
  };
}

// Per-category visual + vibe treatment so live DB activities get the same
// rich cards as the sample data (coloured banner + vibe tags), instead of
// falling back to the plain grey default.
const CATEGORY_GRADIENT: Record<string, string> = {
  food: "from-amber-950/80 via-orange-950/40 to-neutral-900",
  sports: "from-emerald-950/80 via-teal-950/40 to-neutral-900",
  outdoors: "from-green-950/80 via-lime-950/40 to-neutral-900",
  tech: "from-blue-950/80 via-indigo-950/40 to-neutral-900",
  arts: "from-pink-950/80 via-purple-950/40 to-neutral-900",
  music: "from-purple-950/80 via-fuchsia-950/40 to-neutral-900",
  gaming: "from-violet-950/80 via-indigo-950/40 to-neutral-900",
  nightlife: "from-orange-950/80 via-violet-950/40 to-neutral-900",
};

const CATEGORY_VIBES: Record<string, string[]> = {
  food: ["Good eats", "Split bill", "First-timers welcome"],
  sports: ["High energy", "All skill levels", "Bring water"],
  outdoors: ["Scenic", "Relaxed pace", "Golden hour"],
  tech: ["Beginner friendly", "Networking", "Bring a laptop"],
  arts: ["Creative flow", "Quiet vibes", "No experience needed"],
  music: ["Aux rotation", "Good vibes", "Night owl"],
  gaming: ["Casual", "Co-op", "Snacks"],
  nightlife: ["Social", "Late night", "Dress up"],
};

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
