"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { ActivityView, Person } from "@/lib/types";
import { categoryEmoji, categoryLabel, formatNaira } from "@/lib/categories";
import { TopBar } from "@/components/layout/TopBar";
import { Pad } from "@/components/layout/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { useToast } from "@/components/ui/Toast";
import { requestToJoin, leaveActivity } from "@/lib/actions";

export function ActivityDetailClient({
  activity: a,
  host,
  currentUserId,
}: {
  activity: ActivityView;
  host: Person;
  currentUserId: string;
}) {
  const { show } = useToast();
  const isHost = a.hostId === currentUserId;
  const [crew, setCrew] = useState<string[]>(a.crew);
  const [pending, startTransition] = useTransition();
  const joined = crew.includes(currentUserId);
  const sl = a.max - crew.length;
  const pct = Math.min(100, Math.round((crew.length / a.max) * 100));

  const join = () => {
    // optimistic
    setCrew((c) => (c.includes(currentUserId) ? c : [...c, currentUserId]));
    startTransition(async () => {
      const res = await requestToJoin(a.id);
      if (res.message === "demo") show(`Request sent to ${host.name} 🎉`, "👍");
      else if (res.ok) show(res.message, "👍");
      else {
        setCrew((c) => c.filter((p) => p !== currentUserId));
        show(res.message, "⚠️");
      }
    });
  };
  const leave = () => {
    setCrew((c) => c.filter((p) => p !== currentUserId));
    startTransition(async () => {
      const res = await leaveActivity(a.id);
      if (res.message === "demo") show("You left this plan", "👋");
      else if (res.ok) show(res.message, "👋");
      else {
        setCrew((c) => (c.includes(currentUserId) ? c : [...c, currentUserId]));
        show(res.message, "⚠️");
      }
    });
  };

  const seats: JSX.Element[] = crew.map((p) => <Avatar key={p} personId={p} size={42} />);
  for (let i = crew.length; i < Math.min(a.max, crew.length + 2); i++) {
    seats.push(
      <div
        key={`seat-${i}`}
        className="-ml-[9px] grid h-[42px] w-[42px] place-items-center rounded-full border-2 border-dashed border-line bg-bg text-lg text-fg-faint"
      >
        ＋
      </div>
    );
  }

  return (
    <>
      <TopBar variant="detail" />

      {/* hero */}
      <div
        className="relative flex min-h-[200px] flex-col justify-end overflow-hidden rounded-b-lg p-5 pb-[22px] text-white"
        style={{ background: "linear-gradient(140deg, var(--violet), #8b6cf5)" }}
      >
        <div
          className="absolute inset-0 opacity-45"
          style={{
            background:
              "radial-gradient(circle at 85% 20%, rgba(255,212,0,.4), transparent 40%), radial-gradient(circle at 10% 90%, rgba(255,255,255,.12), transparent 50%)",
          }}
        />
        <Pill variant="ghost" className="relative self-start">
          {categoryEmoji(a.category)} {categoryLabel(a.category)}
        </Pill>
        <h1 className="relative mt-2.5 text-[1.6rem] text-white">{a.title}</h1>
        <div className="relative mt-3 flex flex-wrap gap-3.5 text-[0.86rem] text-white/95">
          <span>📍 {a.area}, {a.city}</span>
          <span>🗓️ {a.day}, {a.time}</span>
        </div>
      </div>

      <Pad>
        <div className="mt-[18px] grid grid-cols-2 gap-[11px]">
          <InfoBox label="When" value={a.day} sub={`${a.time} · ${a.duration}`} />
          <InfoBox label="Cost / person" value={formatNaira(a.cost)} sub={a.cost === 0 ? "No charge" : "Split on arrival"} />
          <InfoBox label="Venue" value={a.venue} small />
          <InfoBox label="Group size" value={`${a.min}–${a.max}`} sub={`${crew.length} confirmed`} />
        </div>

        {/* host */}
        <div className="mt-[18px] flex items-center gap-3 rounded-md border border-line bg-surface p-[15px]">
          <Avatar personId={a.hostId} size={46} />
          <div className="min-w-0 flex-1">
            <div className="font-bold">
              {host.name}{" "}
              {isHost && <Pill variant="cat" className="ml-1">You</Pill>}
            </div>
            <div className="text-[0.78rem] text-fg-soft">
              Organiser · {isHost ? "your plan" : "usually hosts food & hangout"}
            </div>
          </div>
          {!isHost && (
            <Button variant="ghostline" size="sm" full={false}>
              View
            </Button>
          )}
        </div>

        <div className="mb-2.5 mt-[22px] flex items-baseline justify-between">
          <h2 className="text-[1.05rem]">About this plan</h2>
        </div>
        <p className="text-[0.92rem] text-fg-soft">{a.description}</p>

        {/* crew */}
        <div className="mt-5 flex items-center justify-between">
          <div>
            <div className="text-[0.7rem] font-bold uppercase tracking-wider text-fg-faint">The crew</div>
            <div className="mt-2 flex items-center">{seats}</div>
          </div>
          <div className="text-right">
            <div className="font-display text-[1.3rem] font-bold">
              {crew.length}
              <span className="text-fg-faint">/{a.max}</span>
            </div>
            <div className="text-[0.72rem] text-fg-soft">{sl > 0 ? `${sl} spots open` : "Crew full"}</div>
          </div>
        </div>
        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-[7px] text-[0.74rem] text-fg-soft">
          {crew.length >= a.min
            ? "✅ Minimum reached — this plan is a go"
            : `Needs ${a.min - crew.length} more to lock in (min ${a.min})`}
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-sm bg-surface-2 p-3 text-[0.8rem] text-fg-soft">
          <span className="text-[17px]">🛡️</span>
          <div>
            Meet at the public venue, not anyone&apos;s address. Exact meeting pin is shared with the crew only
            after it locks. You can leave or report anytime.
          </div>
        </div>

        {/* sticky CTA */}
        <div
          className="sticky bottom-[92px] mt-6 pb-1.5 pt-3.5"
          style={{ background: "linear-gradient(0deg, var(--bg) 70%, transparent)" }}
        >
          {isHost ? (
            <Link href="/crews">
              <Button variant="violet">Manage crew & requests</Button>
            </Link>
          ) : joined ? (
            <Button variant="secondary" onClick={leave} disabled={pending}>
              ✓ You&apos;re in · tap to leave
            </Button>
          ) : (
            <Button onClick={join} disabled={pending}>
              Request to join · {formatNaira(a.cost)}
            </Button>
          )}
          <Button
            variant="ghostline"
            className="mt-[9px]"
            onClick={() => show("Snapchat share card generated (deep-links back here) 👻", "⤴")}
          >
            👻 Share to Snapchat
          </Button>
        </div>
      </Pad>
    </>
  );
}

function InfoBox({
  label,
  value,
  sub,
  small = false,
}: {
  label: string;
  value: string;
  sub?: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-sm border border-line bg-surface p-[13px]">
      <div className="text-[0.68rem] font-bold uppercase tracking-wide text-fg-faint">{label}</div>
      <div className={`mt-1 font-display font-bold ${small ? "text-[0.9rem]" : "text-[0.98rem]"}`}>{value}</div>
      {sub && <div className="mt-0.5 text-[0.82rem] text-fg-soft">{sub}</div>}
    </div>
  );
}
