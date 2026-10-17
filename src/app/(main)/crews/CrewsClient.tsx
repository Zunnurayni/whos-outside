"use client";

import { useState } from "react";
import Link from "next/link";
import type { ActivityView, CrewView, CrewState } from "@/lib/types";
import { personById } from "@/lib/data/sample";
import { TopBar } from "@/components/layout/TopBar";
import { Pad } from "@/components/layout/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { useToast } from "@/components/ui/Toast";

const STATE_META: Record<CrewState, { cls: string; icon: string; label: string }> = {
  locked: { cls: "bg-[color-mix(in_srgb,var(--good)_15%,transparent)] text-good", icon: "🔒", label: "Crew locked" },
  checkin: { cls: "bg-[color-mix(in_srgb,var(--violet)_18%,transparent)] text-violet", icon: "📍", label: "Check-in soon" },
  pending: { cls: "bg-[color-mix(in_srgb,var(--warn)_16%,transparent)] text-warn", icon: "⏳", label: "Awaiting approval" },
};

export function CrewsClient({ activities, crews }: { activities: ActivityView[]; crews: CrewView[] }) {
  const { show } = useToast();
  const [tab, setTab] = useState<"active" | "pending">("active");
  const byId = (id: string) => activities.find((a) => a.id === id);

  const active = crews.filter((c) => c.state !== "pending");
  const pending = crews.filter((c) => c.state === "pending");
  const rows = tab === "active" ? active : pending;

  return (
    <>
      <TopBar variant="title" title="My Crews" />
      <Pad>
        <div className="my-4 flex gap-1 rounded-[13px] bg-surface-2 p-1">
          {(["active", "pending"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-[10px] py-[9px] text-[0.85rem] font-bold ${
                tab === t ? "bg-surface text-fg shadow-sm" : "text-fg-soft"
              }`}
            >
              {t === "active" ? `Active (${active.length})` : `Requested (${pending.length})`}
            </button>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="px-5 py-[50px] text-center text-fg-soft">
            <div className="text-[46px]">🫥</div>
            <h3 className="my-[14px_6px] mt-3.5 text-[1.1rem] text-fg">Nothing here yet</h3>
            <p>
              {tab === "active"
                ? "Join a plan and your crew shows up here."
                : "No pending requests right now."}
            </p>
            <Link href="/discover">
              <Button size="sm" full={false} className="mt-3.5">
                Find a plan
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-[13px]">
            {rows.map((c) => {
              const a = byId(c.activityId);
              if (!a) return null;
              const m = STATE_META[c.state];
              return (
                <div key={c.activityId} className="rounded-md border border-line bg-surface p-[15px] shadow-card">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0">
                      <div className="font-display text-[1.02rem] font-bold">
                        {a.emoji} {a.title}
                      </div>
                      <div className="mt-[3px] text-[0.8rem] text-fg-soft">
                        🗓️ {a.day}, {a.time} · 📍 {a.area}
                      </div>
                      <div className="mt-2">
                        {c.role === "host" ? <Pill variant="cat">You host</Pill> : <Pill>Member</Pill>}
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-[9px] py-1 text-[0.74rem] font-bold ${m.cls}`}>
                      {m.icon} {m.label}
                    </span>
                  </div>

                  {c.state === "checkin" && (
                    <>
                      <div className="mt-3 rounded-xl bg-violet-soft p-3 text-[0.82rem] font-semibold text-violet">
                        ⏰ Check-in opens 45 min before. Confirm &quot;On my way&quot; to unlock the exact meeting pin.
                      </div>
                      <Button
                        variant="violet"
                        size="sm"
                        full={false}
                        className="mt-2.5"
                        onClick={() => show("You're confirmed — meeting pin unlocked 📍", "✅")}
                      >
                        I&apos;m on my way
                      </Button>
                    </>
                  )}

                  {c.state === "locked" && (
                    <Link href={`/activities/${a.id}`}>
                      <Button variant="secondary" size="sm" full={false} className="mt-3">
                        Open crew chat & details
                      </Button>
                    </Link>
                  )}

                  {c.role === "host" && c.requests && c.requests.length > 0 && c.state !== "pending" && (
                    <>
                      <hr className="my-[13px] h-px border-0 bg-line" />
                      <div className="text-[0.7rem] font-bold uppercase tracking-wider text-fg-faint">
                        {c.requests.length} join request{c.requests.length > 1 ? "s" : ""}
                      </div>
                      {c.requests.map((r) => (
                        <RequestRow key={r.personId} personId={r.personId} shared={r.shared} />
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-[18px] px-5 text-center text-[0.76rem] text-fg-faint">
          Flake-proofing: a plan auto-cancels if fewer than the minimum confirm at check-in, so nobody wastes a
          trip.{" "}
          <span className="inline-block rounded-md bg-surface-2 px-2 py-[3px] text-[0.68rem] font-bold uppercase tracking-wide text-fg-faint">
            Demo
          </span>
        </p>
      </Pad>
    </>
  );
}

function RequestRow({ personId, shared }: { personId: string; shared: string[] }) {
  const { show } = useToast();
  const [done, setDone] = useState(false);
  const p = personById(personId);
  return (
    <div className={`flex items-center gap-[11px] py-[11px] transition-opacity ${done ? "opacity-40" : ""}`}>
      <Avatar personId={personId} size={38} />
      <div className="min-w-0">
        <div className="text-[0.9rem] font-semibold">{p.name}</div>
        <div className="text-[0.74rem] text-fg-soft">Shares: {shared.join(", ")}</div>
      </div>
      <div className="ml-auto flex gap-[7px]">
        <button
          onClick={() => {
            setDone(true);
            show(`${p.name} added to the crew ✅`, "✓");
          }}
          className="grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-good text-[15px] text-white"
          aria-label="Approve"
        >
          ✓
        </button>
        <button
          onClick={() => {
            setDone(true);
            show("Request declined");
          }}
          className="grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-surface-2 text-[15px] text-fg-soft"
          aria-label="Decline"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
