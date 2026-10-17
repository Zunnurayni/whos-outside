import type { ActivityView, EventView, CrewView, Person } from "@/lib/types";

/**
 * Sample Yola / Adamawa data. Used whenever Supabase env vars are not set,
 * so the app is fully navigable with no backend (Phase 1 of the build guide).
 * Clearly fictional people; real neighbourhood names and Naira pricing.
 */

export const ME: Person = {
  id: "me",
  name: "Nurain",
  handle: "@Nurain_Dev",
  initials: "NA",
  color: "#6c4cf0",
  interests: ["Tech", "Food", "Football", "Photography", "Music", "Hiking"],
};

export const PEOPLE: Record<string, Person> = {
  me: ME,
  fatima: { id: "fatima", name: "Fatima B.", initials: "FB", color: "#e0668a", interests: ["Food", "Photography"] },
  ibrahim: { id: "ibrahim", name: "Ibrahim S.", initials: "IS", color: "#2f9e6f", interests: ["Football", "Gaming"] },
  aisha: { id: "aisha", name: "Aisha M.", initials: "AM", color: "#d9802b", interests: ["Arts", "Music"] },
  yusuf: { id: "yusuf", name: "Yusuf A.", initials: "YA", color: "#4b7bd4", interests: ["Tech", "Hiking"] },
  zainab: { id: "zainab", name: "Zainab K.", initials: "ZK", color: "#8b5cf0", interests: ["Food", "Reading"] },
  musa: { id: "musa", name: "Musa D.", initials: "MD", color: "#c0583f", interests: ["Football", "Fitness"] },
  hauwa: { id: "hauwa", name: "Hauwa I.", initials: "HI", color: "#1f9d8b", interests: ["Photography", "Travel"] },
  sadiq: { id: "sadiq", name: "Sadiq U.", initials: "SU", color: "#9a7b2e", interests: ["Tech", "Gaming"] },
};

export const SAMPLE_ACTIVITIES: ActivityView[] = [
  {
    id: "a1", emoji: "🍲", category: "food", title: "Suya & shawarma run at Jimeta",
    venue: "Jimeta Modern Market strip", area: "Jimeta", city: "Yola", hostId: "fatima",
    day: "Today", time: "7:30 PM", duration: "2 hrs", cost: 3500, min: 3, max: 6,
    crew: ["fatima", "zainab", "hauwa"], status: "filling",
    description:
      "Pulling together a small crew to hit the suya spots behind the market, then shawarma to finish. First timers welcome, I know the good vendors. We walk the strip, eat too much, head home.",
    mapX: 34, mapY: 40,
  },
  {
    id: "a2", emoji: "⚽", category: "sports", title: "5-a-side at Pologround pitch",
    venue: "Pologround Astro Turf", area: "Yola Town", city: "Yola", hostId: "ibrahim",
    day: "Today", time: "5:00 PM", duration: "1.5 hrs", cost: 1000, min: 6, max: 10,
    crew: ["ibrahim", "musa", "yusuf", "sadiq"], status: "filling",
    description:
      "Casual 5-a-side, splitting the pitch fee between whoever shows. Mixed skill, we just want a run before dark. Bring water, bibs provided.",
    mapX: 58, mapY: 28,
  },
  {
    id: "a3", emoji: "🏞️", category: "outdoors", title: "Sunset walk along River Benue",
    venue: "Benue riverbank, Jimeta", area: "Jimeta", city: "Yola", hostId: "hauwa",
    day: "Saturday", time: "5:30 PM", duration: "2 hrs", cost: 0, min: 3, max: 8,
    crew: ["hauwa", "aisha"], status: "open",
    description:
      "Easy riverside walk timed for golden hour. Bring a camera if you have one, we usually stop for photos and roasted corn from the vendors. Relaxed pace, good for meeting people.",
    mapX: 22, mapY: 62,
  },
  {
    id: "a4", emoji: "💻", category: "tech", title: "Bitcoin Cash dev meetup",
    venue: "BCH Hub Yola", area: "Yola Bypass", city: "Yola", hostId: "me",
    day: "Sunday", time: "2:00 PM", duration: "3 hrs", cost: 0, min: 4, max: 20,
    crew: ["me", "yusuf", "sadiq"], status: "open",
    description:
      "Open session at the hub. We go over a small build, talk wallets and adoption, then network. Laptops useful but not required. Snacks sorted. Beginners genuinely welcome, this is how most of us started.",
    mapX: 48, mapY: 52,
  },
  {
    id: "a5", emoji: "🎨", category: "arts", title: "Life drawing & chill at the gallery",
    venue: "Adamawa Arts Council", area: "Yola Town", city: "Yola", hostId: "aisha",
    day: "Saturday", time: "11:00 AM", duration: "2 hrs", cost: 1500, min: 3, max: 7,
    crew: ["aisha"], status: "open",
    description:
      "Bring a sketchbook, we loan pencils. No experience needed, it's about showing up and making marks. Quiet, friendly group. Tea afterward if people are up for it.",
    mapX: 66, mapY: 60,
  },
  {
    id: "a6", emoji: "🎧", category: "music", title: "Afrobeats listening night",
    venue: "Rooftop, Jimeta", area: "Jimeta", city: "Yola", hostId: "zainab",
    day: "Friday", time: "8:00 PM", duration: "3 hrs", cost: 2000, min: 4, max: 12,
    crew: ["zainab", "fatima", "aisha", "musa"], status: "filling",
    description:
      "Trading playlists on a rooftop, everyone gets a turn on the aux. Small drinks tab, bring your own vibe. Winds down around 11.",
    mapX: 40, mapY: 22,
  },
];

export const SAMPLE_EVENTS: EventView[] = [
  { id: "e1", emoji: "🎪", title: "Adamawa Tech & Innovation Fair", org: "3MTT Adamawa", day: "Nov 2", venue: "Yola IBB Square", interested: 84, category: "tech" },
  { id: "e2", emoji: "🏆", title: "Jimeta Half Marathon", org: "Yola Runners Club", day: "Nov 9", venue: "Jimeta Bypass start", interested: 210, category: "sports" },
  { id: "e3", emoji: "🎶", title: "Benue Riverside Live", org: "Adamawa Culture", day: "Nov 15", venue: "Riverbank arena", interested: 156, category: "music" },
];

export const SAMPLE_CREWS: CrewView[] = [
  { activityId: "a4", role: "host", state: "locked", requests: [
    { personId: "zainab", shared: ["Food"] },
    { personId: "musa", shared: ["Tech"] },
  ] },
  { activityId: "a1", role: "member", state: "checkin" },
  { activityId: "a6", role: "member", state: "locked" },
  { activityId: "a2", role: "member", state: "pending" },
];

export function personById(id: string): Person {
  return PEOPLE[id] ?? { id, name: "Someone", initials: "?", color: "#9c9284" };
}
