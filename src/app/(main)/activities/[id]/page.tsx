import { notFound } from "next/navigation";
import { getActivities, getActivity } from "@/lib/data/activities";
import { ActivityDetailClient } from "./ActivityDetailClient";

export async function generateStaticParams() {
  const all = await getActivities();
  return all.map((a) => ({ id: a.id }));
}

export default async function ActivityPage({ params }: { params: { id: string } }) {
  const activity = await getActivity(params.id);
  if (!activity) notFound();
  return <ActivityDetailClient activity={activity} />;
}
