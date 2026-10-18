import { getActivities } from "@/lib/data/activities";
import { MapClient } from "./MapClient";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const activities = await getActivities();
  // The token is a public client key (NEXT_PUBLIC). Restrict it by URL in the
  // Mapbox dashboard. Absent → the stylised fallback map renders.
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
  return <MapClient activities={activities} mapboxToken={mapboxToken} />;
}
