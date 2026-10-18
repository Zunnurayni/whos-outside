"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  Sparkles,
  Share2,
  CheckCircle2,
  Wallet,
  Flame,
  ArrowLeft,
} from "lucide-react";
import type { ActivityView } from "@/lib/types";
import { categoryLabel, formatNaira } from "@/lib/categories";
import { personById } from "@/lib/data/sample";
import { TopBar } from "@/components/layout/TopBar";
import { Pad } from "@/components/layout/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";

export function ActivityDetailClient({ activity: a }: { activity: ActivityView }) {
  const { show } = useToast();
  const host = personById(a.hostId);
  const isHost = a.hostId === "me";
  const [crew, setCrew] = useState<string[]>(a.crew);
  const joined = crew.includes("me");
  const sl = a.max - crew.length;
  const pct = Math.min(100, Math.round((crew.length / a.max) * 100));
  const isLockedIn = crew.length >= a.min;

  const join = () => {
    setCrew((c) => [...c, "me"]);
    show(`Request sent to ${host.name} 🎉 You're in line!`, "👍");
  };

  const leave = () => {
    setCrew((c) => c.filter((p) => p !== "me"));
    show("You left this plan", "👋");
  };

  const handleShare = () => {
    show("Snapchat sticker card copied! Deep-links straight to this plan 👻", "⤴");
  };

  return (
    <>
      <TopBar
        variant="detail"
        title={a.title}
        subtitle={`${a.area} · ${a.day}`}
        onShare={handleShare}
      />

      {/* Atmospheric Header Banner */}
      <div
        className={`relative flex min-h-[200px] flex-col justify-end overflow-hidden px-5 pb-6 text-white bg-gradient-to-br ${
          a.themeGradient || "from-violet-950 via-neutral-900 to-black"
        }`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 85% 20%, rgba(255,212,0,.45), transparent 45%), radial-gradient(circle at 15% 85%, rgba(108,76,240,.3), transparent 50%)",
          }}
        />

        <div className="relative flex items-center justify-between">
          <span className="rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-xs font-bold text-white/95">
            {a.emoji} {categoryLabel(a.category)}
          </span>
          {sl <= 2 && (
            <span className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-extrabold text-accent-ink shadow-sm">
              <Flame className="h-3 w-3 fill-current" /> Only {sl} left
            </span>
          )}
        </div>

        <h1 className="relative mt-3 font-display text-[1.65rem] font-bold leading-tight text-white">
          {a.title}
        </h1>

        <div className="relative mt-2.5 flex flex-wrap items-center gap-3 text-[0.85rem] text-white/90">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-accent" />
            {a.venue}, {a.area}
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-accent" />
            {a.day}, {a.time}
          </span>
        </div>
      </div>

      <Pad className="pt-4">
        {/* Quick Vibe Badges */}
        {a.vibes && a.vibes.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-1">
            {a.vibes.map((v) => (
              <span
                key={v}
                className="rounded-lg bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-fg-soft"
              >
                #{v}
              </span>
            ))}
          </div>
        )}

        {/* 4-Box Key Stats Grid */}
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <StatBox
            icon={Clock}
            label="Timing"
            main={`${a.day}, ${a.time}`}
            sub={`Duration: ${a.duration}`}
          />
          <StatBox
            icon={Wallet}
            label="Cost / Person"
            main={a.cost === 0 ? "Free" : formatNaira(a.cost)}
            sub={a.cost === 0 ? "No fee required" : "Split at venue"}
          />
          <StatBox
            icon={MapPin}
            label="Public Venue"
            main={a.venue}
            sub={`${a.area}, ${a.city}`}
          />
          <StatBox
            icon={Users}
            label="Crew Size"
            main={`${crew.length} of ${a.max}`}
            sub={isLockedIn ? "Min reached ✓" : `Needs ${a.min - crew.length} more`}
          />
        </div>

        {/* Host Profile Card */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Avatar personId={a.hostId} size={48} showStatus />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-fg">{host.name}</span>
                {isHost && (
                  <span className="rounded-md bg-accent px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-accent-ink">
                    You
                  </span>
                )}
              </div>
              <div className="text-[0.76rem] text-fg-soft">
                {host.vibe || "Plan organiser · Verified community member"}
              </div>
            </div>
          </div>
        </div>

        {/* About This Plan */}
        <div className="mt-5">
          <h2 className="font-display text-[1.05rem] font-bold text-fg">
            About this plan
          </h2>
          <p className="mt-2 text-[0.92rem] leading-relaxed text-fg-soft">
            {a.description}
          </p>
        </div>

        {/* Crew Progress & Seating */}
        <div className="mt-6 rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[0.72rem] font-bold uppercase tracking-wider text-fg-faint">
                Crew Attendance
              </div>
              <div className="mt-1 font-display text-[1.2rem] font-bold text-fg">
                {crew.length} <span className="text-fg-faint">/ {a.max} joined</span>
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                isLockedIn ? "bg-good/15 text-good" : "bg-warn/15 text-warn"
              }`}
            >
              {isLockedIn ? "✓ Plan is a go" : `Needs ${a.min - crew.length} more`}
            </span>
          </div>

          {/* Micro Progress Bar */}
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isLockedIn ? "bg-good" : "bg-accent"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Seating Row */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {crew.map((id) => (
              <div key={id} className="flex items-center gap-1.5 rounded-full bg-surface-2 pr-3 pl-1 py-1">
                <Avatar personId={id} size={28} />
                <span className="text-xs font-bold text-fg">
                  {id === "me" ? "You" : personById(id).name.split(" ")[0]}
                </span>
              </div>
            ))}
            {sl > 0 && (
              <span className="flex items-center justify-center rounded-full border border-dashed border-line px-3 py-1.5 text-xs font-semibold text-fg-faint">
                +{sl} spots open
              </span>
            )}
          </div>
        </div>

        {/* Safety & Meeting Privacy Note */}
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-line/60 bg-surface-2/60 p-3.5 text-[0.8rem] text-fg-soft">
          <ShieldCheck className="h-5 w-5 text-good shrink-0 mt-0.5" />
          <div>
            <strong className="text-fg">Safe Meetup Guarantee:</strong> Meetups happen strictly at public spots.
            The exact table or meeting point is revealed 45 min before start to locked-in members only.
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div
          className="sticky bottom-[78px] mt-6 flex flex-col gap-2 rounded-2xl bg-surface/95 backdrop-blur-md p-3 border border-line shadow-xl"
        >
          {isHost ? (
            <Link
              href="/crews"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet py-3.5 text-[0.92rem] font-bold text-white shadow-md active:scale-95 transition-transform"
            >
              <Users className="h-4 w-4" />
              Manage Crew & Requests
            </Link>
          ) : joined ? (
            <button
              onClick={leave}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 py-3.5 text-[0.92rem] font-bold text-fg-soft active:scale-95 transition-transform"
            >
              <CheckCircle2 className="h-4 w-4 text-good" />
              You&apos;re in this crew · Tap to leave
            </button>
          ) : (
            <button
              onClick={join}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-[0.95rem] font-extrabold text-accent-ink shadow-md active:scale-95 transition-transform"
            >
              <span>Request to Join</span>
              <span aria-hidden="true">·</span>
              <span>{a.cost === 0 ? "Free" : formatNaira(a.cost)}</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface py-2.5 text-[0.84rem] font-bold text-fg hover:bg-surface-2 active:scale-95 transition-transform"
          >
            <span>👻 Share to Snapchat Story</span>
          </button>
        </div>
      </Pad>
    </>
  );
}

function StatBox({
  icon: Icon,
  label,
  main,
  sub,
}: {
  icon: any;
  label: string;
  main: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-line bg-surface p-3 shadow-xs">
      <div className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-wider text-fg-faint">
        <Icon className="h-3 w-3 text-violet" />
        {label}
      </div>
      <div className="mt-1 font-display text-[0.95rem] font-bold text-fg truncate">
        {main}
      </div>
      <div className="mt-0.5 text-[0.74rem] text-fg-soft truncate">{sub}</div>
    </div>
  );
}
