import type { ActivityView } from "@/lib/types";

// Yola city centre (lng, lat) — the ranking origin when the user hasn't
// shared GPS. Matches the map default.
const YOLA: [number, number] = [12.4954, 9.2035];

function distanceKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[1] - a[1]) * Math.PI) / 180;
  const dLng = ((b[0] - a[0]) * Math.PI) / 180;
  const la1 = (a[1] * Math.PI) / 180;
  const la2 = (b[1] * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

// A day label → how soon it is, lower is sooner.
function timeRank(day: string): number {
  const d = day.toLowerCase();
  if (d === "today") return 0;
  if (d === "tomorrow") return 1;
  if (["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"].includes(d))
    return 2;
  return 3;
}

export interface RankOptions {
  interests: string[]; // category ids the user picked
  userLngLat?: [number, number] | null;
}

/**
 * Transparent relevance ranking — NOT a compatibility score. Orders plans by:
 *  - interest match (did they pick this category?)
 *  - how soon it starts
 *  - distance from the user (or Yola centre)
 *  - popularity (how full the crew is, as a light tiebreaker)
 * Returns a new array, highest relevance first. Each item keeps a _reason the
 * UI can show ("Matches your interests", "Starts today", "Closest to you").
 */
export interface RankedActivity extends ActivityView {
  _reason?: string;
}

export function rankActivities(
  activities: ActivityView[],
  { interests, userLngLat }: RankOptions
): RankedActivity[] {
  const origin = userLngLat ?? YOLA;
  const interestSet = new Set(interests);

  const scored = activities.map((a) => {
    let score = 0;
    let reason = "";

    // Interest match is the strongest signal.
    if (interestSet.has(a.category)) {
      score += 100;
      reason = "Matches your interests";
    }

    // Sooner is better (today > tomorrow > this week).
    const tr = timeRank(a.day);
    score += (3 - tr) * 20;
    if (!reason && tr === 0) reason = "Happening today";

    // Closer is better. Within ~10km, nearer plans get a boost.
    if (a.lng != null && a.lat != null) {
      const km = distanceKm(origin, [a.lng, a.lat]);
      score += Math.max(0, 15 - km); // up to +15 for very close
      if (!reason && km < 2) reason = "Close to you";
    }

    // Light popularity tiebreaker.
    score += Math.min(10, a.crew.length);
    if (!reason && a.status === "filling") reason = "Filling fast";

    return { ...a, _score: score, _reason: reason || undefined };
  });

  scored.sort((x, y) => y._score - x._score);
  // strip the internal score before returning
  return scored.map(({ _score, ...rest }) => rest);
}
