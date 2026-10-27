// View-model types used across the UI. These flatten the DB rows into
// the shape screens actually render (venue name inlined, crew expanded, etc).

export type CategoryId =
  | "food"
  | "sports"
  | "outdoors"
  | "tech"
  | "arts"
  | "music"
  | "gaming"
  | "nightlife";

export interface Category {
  id: CategoryId | "all";
  label: string;
  emoji: string;
}

export interface Person {
  id: string;
  name: string;
  handle?: string;
  initials: string;
  color: string;
  interests?: string[];
  vibe?: string;
  currentSpot?: string;
  isOutside?: boolean;
}

export interface ActivityView {
  id: string;
  emoji: string;
  category: CategoryId;
  title: string;
  description: string;
  venue: string;
  area: string;
  city: string;
  hostId: string;
  hostName?: string;
  day: string;
  time: string;
  duration: string;
  cost: number; // Naira, per-head share
  costMode?: "even" | "host_share" | "sponsored" | "byo";
  totalCost?: number;
  hostContribution?: number;
  sponsorName?: string | null;
  min: number;
  max: number;
  crew: string[]; // person ids
  status: "open" | "filling" | "filled";
  /** stylised map coordinate as a percentage of the canvas (fallback map) */
  mapX: number;
  mapY: number;
  vibes?: string[];
  themeGradient?: string;
  /** real-world coordinates for the Mapbox map; null if unknown */
  lat: number | null;
  lng: number | null;
}

export interface EventView {
  id: string;
  emoji: string;
  title: string;
  org: string;
  day: string;
  venue: string;
  interested: number;
  category: CategoryId;
}

export type CrewState = "locked" | "checkin" | "pending";

export interface CrewView {
  activityId: string;
  role: "host" | "member";
  state: CrewState;
  requests?: { personId: string; shared: string[] }[];
}
