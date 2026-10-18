import { getActivities } from "@/lib/data/activities";
import { SAMPLE_CREWS } from "@/lib/data/sample";
import { CrewsClient } from "./CrewsClient";

export default async function CrewsPage() {
  const activities = await getActivities();
  return <CrewsClient activities={activities} crews={SAMPLE_CREWS} />;
}
