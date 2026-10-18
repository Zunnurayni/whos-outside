import { getActivities } from "@/lib/data/activities";
import { MapClient } from "./MapClient";

export default async function MapPage() {
  const activities = await getActivities();
  return <MapClient activities={activities} />;
}
