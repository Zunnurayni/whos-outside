import { getActivities, getEvents } from "@/lib/data/activities";
import { DiscoverClient } from "./DiscoverClient";

// Server Component: fetches data (sample or live) and hands it to the
// interactive client view.
export default async function DiscoverPage() {
  const [activities, events] = await Promise.all([getActivities(), getEvents()]);
  return <DiscoverClient activities={activities} events={events} />;
}
