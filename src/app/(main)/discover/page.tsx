import { getActivities, getEvents } from "@/lib/data/activities";
import { getCurrentUser } from "@/lib/auth";
import { DiscoverClient } from "./DiscoverClient";

export const dynamic = "force-dynamic";

// Server Component: fetches data (sample or live) and hands it to the
// interactive client view.
export default async function DiscoverPage() {
  const [activities, events, me] = await Promise.all([getActivities(), getEvents(), getCurrentUser()]);
  return <DiscoverClient activities={activities} events={events} currentUserId={me?.id ?? "me"} />;
}
