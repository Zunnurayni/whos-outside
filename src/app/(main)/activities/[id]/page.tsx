import { notFound } from "next/navigation";
import { getActivity } from "@/lib/data/activities";
import { getProfiles } from "@/lib/data/profiles";
import { getCurrentUser } from "@/lib/auth";
import { ActivityDetailClient } from "./ActivityDetailClient";

// Dynamic: join state and new activities must render per-request in live mode.
export const dynamic = "force-dynamic";

export default async function ActivityPage({ params }: { params: { id: string } }) {
  const activity = await getActivity(params.id);
  if (!activity) notFound();

  const [profiles, me] = await Promise.all([getProfiles([activity.hostId]), getCurrentUser()]);
  const host = profiles[activity.hostId];
  // "me" is the demo id; in live mode it's the real auth id. Fall back to "me"
  // so the demo path keeps working.
  const currentUserId = me?.id ?? "me";

  return <ActivityDetailClient activity={activity} host={host} currentUserId={currentUserId} />;
}
