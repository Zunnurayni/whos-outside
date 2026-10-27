"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  UserPlus,
  CheckCircle2,
  XCircle,
  Navigation,
  Users,
  Clock,
  Bell,
} from "lucide-react";
import type { NotificationView, NotificationKind } from "@/lib/data/notifications";
import { TopBar } from "@/components/layout/TopBar";
import { Pad } from "@/components/layout/AppShell";
import { markNotificationsRead } from "@/lib/actions";

const META: Record<NotificationKind, { icon: any; cls: string }> = {
  join_request: { icon: UserPlus, cls: "bg-violet/15 text-violet" },
  request_accepted: { icon: CheckCircle2, cls: "bg-good/15 text-good" },
  request_declined: { icon: XCircle, cls: "bg-crit/15 text-crit" },
  on_way: { icon: Navigation, cls: "bg-violet/15 text-violet" },
  crew_joined: { icon: Users, cls: "bg-accent/20 text-accent-ink" },
  starting_soon: { icon: Clock, cls: "bg-warn/15 text-warn" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.round(hr / 24);
  return d === 1 ? "yesterday" : `${d}d ago`;
}

export function NotificationsClient({ items }: { items: NotificationView[] }) {
  // Opening the screen clears the unread badge.
  useEffect(() => {
    markNotificationsRead().catch(() => {});
  }, []);

  return (
    <>
      <TopBar variant="detail" title="Notifications" />
      <Pad className="pt-4">
        {items.length === 0 ? (
          <div className="mt-24 flex flex-col items-center text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-surface-2 text-fg-faint">
              <Bell className="h-7 w-7" />
            </div>
            <p className="mt-4 font-display text-[1.1rem] font-bold text-fg">
              Nothing yet
            </p>
            <p className="mt-1 max-w-[26ch] text-[0.9rem] text-fg-soft">
              When someone joins your plan or a crew member is on the way, it shows up here.
            </p>
            <Link
              href="/discover"
              className="mt-6 rounded-[14px] bg-accent px-5 py-3 font-bold text-accent-ink active:scale-[0.97]"
            >
              See who&apos;s outside
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-2 pb-6">
            {items.map((n) => {
              const meta = META[n.kind];
              const Icon = meta.icon;
              const row = (
                <div
                  className={`flex items-start gap-3 rounded-2xl border border-line/70 p-3.5 ${
                    n.read ? "bg-surface" : "bg-surface-2"
                  }`}
                >
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${meta.cls}`}>
                    <Icon className="h-5 w-5 stroke-[2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.92rem] leading-snug text-fg">{n.body}</p>
                    <p className="mt-1 text-[0.72rem] text-fg-faint">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-crit" />}
                </div>
              );
              return (
                <li key={n.id}>
                  {n.activityId ? (
                    <Link href={`/activities/${n.activityId}`} className="block active:scale-[0.99]">
                      {row}
                    </Link>
                  ) : (
                    row
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Pad>
    </>
  );
}
