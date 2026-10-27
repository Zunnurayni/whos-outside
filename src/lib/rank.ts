import type { ActivityView } from "@/lib/types";

// Default origin (lng, lat) when the user hasn't shared GPS. Matches the map.
const YOLA: [number, number] = [12.4954, 9.2035];

// Great-circle distance in km between two [lng, lat] points.
export function distanceKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[1] - a[1]) * Math.PI) / 180;
  const dLng = ((b[0] - a[0]) * Math.PI) / 180;
  const la1 = (a[1] * Math.PI) / 180;
  const la2 = (b[1] * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

/**
 * Split plans into those within `radiusKm` of the user and the rest, each
 * sorted nearest-first. A plan with no coordinates is treated as "unknown
 * distance" and lands in `far` (never hidden outright). When the user has no
 * location, everything is "near" (we can't filter, so we don't).
 */
export function partitionByRadius(
  activities: ActivityView[],
  userLngLat: [number, number] | null,
  radiusKm = 10
): { near: ActivityView[]; far: ActivityView[] } {
  if (!userLngLat) return { near: activities, far: [] };

  const withDist = activities.map((a) => {
    const hasCoords = a.lng != null && a.lat != null;
    const km = hasCoords ? distanceKm(userLngLat, [a.lng as number, a.lat as number]) : Infinity;
    return { a, km };
  });
  withDist.sort((x, y) => x.km - y.km);

  const near = withDist.filter((x) => x.km <= radiusKm).map((x) => x.a);
  const far = withDist.filter((x) => x.km > radiusKm).map((x) => x.a);
  return { near, far };
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
