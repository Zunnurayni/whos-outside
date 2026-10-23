import { getActivities, getEvents } from "@/lib/data/activities";
import { getCurrentUser } from "@/lib/auth";
import { getMyInterests } from "@/lib/data/profiles";
import { rankActivities } from "@/lib/rank";
import { DiscoverClient } from "./DiscoverClient";

export const dynamic = "force-dynamic";

// Server Component: fetches data, ranks the feed by the user's interests and
// proximity, then hands it to the interactive client view.
export default async function DiscoverPage() {
  const [activities, events, me, interests] = await Promise.all([
    getActivities(),
    getEvents(),
    getCurrentUser(),
    getMyInterests(),
  ]);

  const ranked = rankActivities(activities, { interests });
  const personalised = interests.length > 0;

  return (
    <DiscoverClient
      activities={ranked}
      events={events}
      currentUserId={me?.id ?? "me"}
      personalised={personalised}
    />
  );
}
