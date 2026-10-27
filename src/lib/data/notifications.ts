import { createClient } from "@/lib/supabase/server";

export type NotificationKind =
  | "join_request"
  | "request_accepted"
  | "request_declined"
  | "on_way"
  | "crew_joined"
  | "starting_soon";

export interface NotificationView {
  id: string;
  kind: NotificationKind;
  body: string;
  activityId: string | null;
  read: boolean;
  createdAt: string;
}

// Sample notifications shown in demo mode (no Supabase env). They make the
// bell and the notifications screen feel alive before real data exists.
const SAMPLE: NotificationView[] = [
  {
    id: "n1",
    kind: "join_request",
    body: "Zainab asked to join Afrobeats listening night",
    activityId: "a-music",
    read: false,
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: "n2",
    kind: "on_way",
    body: "Ibrahim is on the way to 5-a-side at the pitch",
    activityId: "a-sports",
    read: false,
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: "n3",
    kind: "request_accepted",
    body: "You're in. Sunset walk by the river",
    activityId: "a-river",
    read: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "n4",
    kind: "crew_joined",
    body: "Fatima joined your Suya & shawarma run",
    activityId: "a-food",
    read: true,
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
];

export async function getNotifications(): Promise<NotificationView[]> {
  const supabase = createClient();
  if (!supabase) return SAMPLE;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("id, kind, body, activity_id, read_at, created_at")
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    kind: r.kind as NotificationKind,
    body: r.body,
    activityId: r.activity_id,
    read: r.read_at != null,
    createdAt: r.created_at,
  }));
}

export async function getUnreadCount(): Promise<number> {
  const supabase = createClient();
  if (!supabase) return SAMPLE.filter((n) => !n.read).length;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", user.id)
    .is("read_at", null);

  if (error) return 0;
  return count ?? 0;
}
