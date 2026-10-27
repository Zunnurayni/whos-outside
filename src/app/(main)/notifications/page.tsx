import { getNotifications } from "@/lib/data/notifications";
import { NotificationsClient } from "./NotificationsClient";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const items = await getNotifications();
  return <NotificationsClient items={items} />;
}
