"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, MapPin, Clock, Check, X, Users, MessageCircle, AlertCircle, Sparkles } from "lucide-react";
import type { ActivityView, CrewView, CrewState } from "@/lib/types";
import { personById } from "@/lib/data/sample";
import { TopBar } from "@/components/layout/TopBar";
import { Pad } from "@/components/layout/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";

const STATE_META: Record<CrewState, { cls: string; icon: any; label: string }> = {
  locked: {
    cls: "bg-good/15 text-good border-good/30",
    icon: Lock,
    label: "Crew Locked",
  },
  checkin: {
    cls: "bg-violet/15 text-violet border-violet/30",
    icon: MapPin,
    label: "Check-in Open",
  },
  pending: {
    cls: "bg-warn/15 text-warn border-warn/30",
    icon: Clock,
    label: "Awaiting Host",
  },
};

export function CrewsClient({
  activities,
  crews,
}: {
  activities: ActivityView[];
  crews: CrewView[];
}) {
  const { show } = useToast();
  const [tab, setTab] = useState<"active" | "pending">("active");
  const [confirmedCheckins, setConfirmedCheckins] = useState<Record<string, boolean>>({});
  const byId = (id: string) => activities.find((a) => a.id === id);

  const active = crews.filter((c) => c.state !== "pending");
  const pending = crews.filter((c) => c.state === "pending");
  const rows = tab === "active" ? active : pending;

  const handleCheckin = (actId: string) => {
    setConfirmedCheckins((prev) => ({ ...prev, [actId]: true }));
    show("Confirmed: You're on your way! 🚀 Meeting spot unlocked", "📍");
  };

  return (
    <>
      <TopBar variant="title" title="My Crews" subtitle="Plans you're locked into" />
      <Pad className="pb-10">
        {/* Tab Segmented Control */}
        <div className="my-4 flex rounded-xl border border-line bg-surface-2 p-1">
          <button
            onClick={() => setTab("active")}
            className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-all ${
              tab === "active"
                ? "bg-surface text-fg shadow-xs"
                : "text-fg-soft hover:text-fg"
            }`}
          >
            Active Crews ({active.length})
          </button>
          <button
            onClick={() => setTab("pending")}
            className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-all ${
              tab === "pending"
                ? "bg-surface text-fg shadow-xs"
                : "text-fg-soft hover:text-fg"
            }`}
          >
            Requested ({pending.length})
          </button>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface p-10 text-center text-fg-soft">
            <span className="text-4xl">👥</span>
            <h3 className="mt-3 font-display text-base font-bold text-fg">
              {tab === "active" ? "No active crews right now" : "No pending requests"}
            </h3>
            <p className="mt-1 max-w-[28ch] text-xs text-fg-soft">
              {tab === "active"
                ? "Explore Yola plans or drop your own to gather a crew!"
                : "When you request to join a plan, it appears here until approved."}
            </p>
            <Link
              href="/discover"
              className="mt-4 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-ink"
            >
              Explore Plans
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {rows.map((c) => {
              const a = byId(c.activityId);
              if (!a) return null;
              const meta = STATE_META[c.state];
              const Icon = meta.icon;
              const isCheckedIn = confirmedCheckins[a.id];

              return (
                <div
                  key={c.activityId}
                  className="rounded-2xl border border-line bg-surface p-4 shadow-card transition-all"
                >
                  {/* Crew Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-display text-[1.08rem] font-bold text-fg leading-tight">
                        {a.emoji} {a.title}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-fg-soft">
                        <span>🗓️ {a.day}, {a.time}</span>
                        <span aria-hidden="true">·</span>
                        <span>📍 {a.area}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[10px] font-bold text-fg-soft uppercase tracking-wider">
                          {c.role === "host" ? "👑 You Host" : "Member"}
                        </span>
                        <span className="text-xs text-fg-soft font-medium">
                          {a.crew.length}/{a.max} confirmed
                        </span>
                      </div>
                    </div>

                    <span
                      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${meta.cls}`}
                    >
                      <Icon className="h-3 w-3" />
                      {meta.label}
                    </span>
                  </div>

                  {/* Flake-Proof Check-in Box */}
                  {c.state === "checkin" && (
                    <div className="mt-4 rounded-xl border border-violet/30 bg-violet/10 p-3.5">
                      <div className="flex items-start gap-2 text-xs font-semibold text-violet">
                        <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                        <div>
                          Check-in window active! Confirm &quot;On my way&quot; to unlock the exact
                          meeting table.
                        </div>
                      </div>

                      {isCheckedIn ? (
                        <div className="mt-3 flex items-center gap-2 rounded-lg bg-good/15 p-2.5 text-xs font-bold text-good">
                          <Check className="h-4 w-4" />
                          <span>Locked in: Meet at Jimeta Market Main Gate, Table 4</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCheckin(a.id)}
                          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-violet py-2.5 text-xs font-bold text-white shadow-sm active:scale-95 transition-transform"
                        >
                          <span>I&apos;m On My Way 🚀</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Locked Crew Chat Bar */}
                  {c.state === "locked" && (
                    <div className="mt-3 border-t border-line/60 pt-3">
                      <Link
                        href={`/activities/${a.id}`}
                        className="flex w-full items-center justify-between rounded-xl bg-surface-2 px-3.5 py-2 text-xs font-bold text-fg hover:bg-surface-2/80 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <MessageCircle className="h-4 w-4 text-violet" />
                          Crew Details & Chat
                        </span>
                        <span>›</span>
                      </Link>
                    </div>
                  )}

                  {/* Host: Join Requests */}
                  {c.role === "host" && c.requests && c.requests.length > 0 && c.state !== "pending" && (
                    <div className="mt-4 border-t border-line/60 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-fg-soft">
                          Join Requests ({c.requests.length})
                        </span>
                      </div>
                      <div className="mt-2 divide-y divide-line/60">
                        {c.requests.map((r) => (
                          <RequestRow
                            key={r.personId}
                            personId={r.personId}
                            shared={r.shared}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Flake-Proof Explain Card */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 text-xs text-fg-soft shadow-xs">
          <Sparkles className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div>
            <strong className="text-fg">Flake-Proof Rule:</strong> Plans auto-cancel 30 min before
            start if fewer than the minimum crew confirm check-in. No ghosting, no wasted trips.
          </div>
        </div>
      </Pad>
    </>
  );
}

function RequestRow({ personId, shared }: { personId: string; shared: string[] }) {
  const { show } = useToast();
  const [status, setStatus] = useState<"pending" | "accepted" | "declined">("pending");
  const p = personById(personId);

  if (status === "accepted") {
    return (
      <div className="flex items-center justify-between py-2 text-xs font-semibold text-good">
        <span>✓ {p.name} added to crew</span>
      </div>
    );
  }

  if (status === "declined") {
    return (
      <div className="flex items-center justify-between py-2 text-xs text-fg-faint">
        <span>Request from {p.name} declined</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 py-2.5">
      <Avatar personId={personId} size={36} />
      <div className="min-w-0 flex-1">
        <div className="text-xs font-bold text-fg">{p.name}</div>
        <div className="text-[11px] text-fg-soft">Shared vibe: {shared.join(", ")}</div>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => {
            setStatus("accepted");
            show(`${p.name} added to your crew! 🎉`, "✓");
          }}
          className="grid h-8 w-8 place-items-center rounded-lg bg-good text-white shadow-xs active:scale-90"
          aria-label="Approve"
        >
          <Check className="h-4 w-4 stroke-[2.5]" />
        </button>
        <button
          onClick={() => {
            setStatus("declined");
            show("Request declined", "✕");
          }}
          className="grid h-8 w-8 place-items-center rounded-lg bg-surface-2 text-fg-soft hover:text-fg active:scale-90"
          aria-label="Decline"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
