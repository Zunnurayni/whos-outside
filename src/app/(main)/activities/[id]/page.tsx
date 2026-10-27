import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getActivity } from "@/lib/data/activities";
import { getProfiles } from "@/lib/data/profiles";
import { getCurrentUser } from "@/lib/auth";
import { ActivityDetailClient } from "./ActivityDetailClient";

// Dynamic: join state and new activities must render per-request in live mode.
export const dynamic = "force-dynamic";

// Rich link preview: title/description per plan; the image comes from the
// sibling opengraph-image.tsx. This is what Snap/WhatsApp/X show when shared.
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const a = await getActivity(params.id);
  if (!a) return { title: "Plan not found — Who's Outside?" };

  const title = `${a.title} · Who's Outside?`;
  const description = `${a.day}, ${a.time} at ${a.venue}. Who's outside? Find out and join the crew.`;
  return {
    title,
    description,
    openGraph: { title, description, images: ["/og-default.png"], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: ["/og-default.png"] },
  };
}

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
