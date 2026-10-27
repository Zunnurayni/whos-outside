import { getActivities, getEvents } from "@/lib/data/activities";
import { getCurrentUser } from "@/lib/auth";
import { getMyInterests } from "@/lib/data/profiles";
import { getUnreadCount } from "@/lib/data/notifications";
import { rankActivities } from "@/lib/rank";
import { DiscoverClient } from "./DiscoverClient";

export const dynamic = "force-dynamic";

// Server Component: fetches data, ranks the feed by the user's interests and
// proximity, then hands it to the interactive client view.
export default async function DiscoverPage() {
  const [activities, events, me, interests, unread] = await Promise.all([
    getActivities(),
    getEvents(),
    getCurrentUser(),
    getMyInterests(),
    getUnreadCount(),
  ]);

  const ranked = rankActivities(activities, { interests });
  const personalised = interests.length > 0;

  return (
    <DiscoverClient
      activities={ranked}
      events={events}
      currentUserId={me?.id ?? "me"}
      personalised={personalised}
      unreadCount={unread}
    />
  );
}
