"use client";

import { useState } from "react";
import { ME } from "@/lib/data/sample";
import { TopBar } from "@/components/layout/TopBar";
import { Pad } from "@/components/layout/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { signOut } from "@/lib/actions";

const BADGES = [
  { e: "🎉", l: "First outing", on: true },
  { e: "🔥", l: "5 plans", on: true },
  { e: "👑", l: "Host x3", on: true },
  { e: "🌙", l: "Night owl", on: true },
  { e: "📸", l: "Memory maker", on: false },
  { e: "🤝", l: "Connector", on: false },
  { e: "⭐", l: "Top rated", on: false },
  { e: "🗺️", l: "Explorer", on: false },
];

const PAST = [
  { e: "🍲", t: "Suya night at Jimeta", s: "2 weeks ago · 5 people", r: "⭐ 5.0" },
  { e: "⚽", t: "5-a-side at Pologround", s: "Last month · 8 people", r: "⭐ 4.8" },
  { e: "💻", t: "BCH Hub build session", s: "Last month · 11 people", r: "⭐ 5.0" },
];

export function ProfileClient({
  live = false,
  displayName = "Nurain",
  handle = "@Nurain_Dev",
}: {
  live?: boolean;
  displayName?: string;
  handle?: string;
}) {
  return (
    <>
      <TopBar variant="title" title="Profile" />
      <Pad>
        <div className="flex flex-col items-center gap-1 pt-6 text-center">
          <Avatar personId="me" size={90} />
          <h1 className="mt-2.5 text-[1.5rem]">{displayName}</h1>
          <div className="text-[0.9rem] text-fg-soft">{handle} · Yola, Adamawa</div>
          <p className="mt-2 max-w-[30ch] text-[0.9rem] text-fg-soft">
            Building community in the North. Here for suya runs, dev meetups, and sunset walks by the Benue.
          </p>
          <div className="mt-3.5 flex gap-[9px]">
            <Button variant="violet" size="sm" full={false}>
              Edit profile
            </Button>
            <Button variant="ghostline" size="sm" full={false}>
              👻 Connect Snapchat
            </Button>
          </div>
          {live && (
            <form action={signOut} className="mt-3">
              <button type="submit" className="text-[0.82rem] font-semibold text-fg-soft underline">
                Sign out
              </button>
            </form>
          )}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <Stat n="12" l="Outings" />
          <Stat n="38" l="People met" />
          <Stat n="4.9" l="Rating" />
        </div>

        <SectionHead title="Interests" right="Edit" />
        <div className="mt-[13px] flex flex-wrap gap-2">
          {ME.interests?.map((i) => (
            <Pill key={i} variant="cat">
              {i}
            </Pill>
          ))}
        </div>

        <SectionHead title="Badges" right="4 of 8" />
        <div className="mt-[13px] grid grid-cols-4 gap-2.5">
          {BADGES.map((b) => (
            <div key={b.l} className={`text-center ${b.on ? "" : "opacity-40"}`}>
              <div className="mx-auto grid h-[54px] w-[54px] place-items-center rounded-2xl border border-line bg-surface text-[25px]">
                {b.e}
              </div>
              <div className="mt-[5px] text-[0.64rem] font-semibold text-fg-soft">{b.l}</div>
            </div>
          ))}
        </div>

        <SectionHead title="Privacy & safety" />
        <div className="rounded-md border border-line bg-surface px-[15px]">
          <SettingRow ic="📍" title="Share live location" sub="Off — only during active outings" type="off" />
          <hr className="h-px border-0 bg-line" />
          <SettingRow ic="👻" title="Show Bitmoji avatar" sub="When Snapchat is connected" type="off" />
          <hr className="h-px border-0 bg-line" />
          <SettingRow ic="🔔" title="Join request alerts" sub="Push + in-app" type="on" />
          <hr className="h-px border-0 bg-line" />
          <SettingRow ic="🛡️" title="Who can request to join" sub="Everyone in my city" type="chev" />
        </div>

        <SectionHead title="Past experiences" />
        <div className="flex flex-col gap-[13px]">
          {PAST.map((p) => (
            <div key={p.t} className="flex items-center gap-3 rounded-md border border-line bg-surface p-[15px] shadow-card">
              <div className="grid h-[50px] w-[50px] flex-none place-items-center rounded-[14px] bg-surface-2 text-[25px]">
                {p.e}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display font-bold">{p.t}</div>
                <div className="text-[0.78rem] text-fg-soft">{p.s}</div>
              </div>
              <span className="rounded-full bg-[color-mix(in_srgb,var(--accent)_25%,transparent)] px-2.5 py-1 text-xs font-semibold text-accent-ink">
                {p.r}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-[18px] px-5 text-center text-[0.76rem] text-fg-faint">
          Profile shows sample history.{" "}
          <span className="inline-block rounded-md bg-surface-2 px-2 py-[3px] text-[0.68rem] font-bold uppercase tracking-wide text-fg-faint">
            Demo data
          </span>
        </p>
      </Pad>
    </>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="rounded-sm border border-line bg-surface px-2 py-3.5 text-center">
      <div className="font-display text-[1.4rem] font-bold tabular-nums">{n}</div>
      <div className="mt-0.5 text-[0.7rem] font-semibold text-fg-soft">{l}</div>
    </div>
  );
}

function SectionHead({ title, right }: { title: string; right?: string }) {
  return (
    <div className="mb-[13px] mt-6 flex items-baseline justify-between">
      <h2 className="text-[1.05rem]">{title}</h2>
      {right && <span className="text-[0.82rem] font-bold text-violet">{right}</span>}
    </div>
  );
}

function SettingRow({
  ic,
  title,
  sub,
  type,
}: {
  ic: string;
  title: string;
  sub: string;
  type: "on" | "off" | "chev";
}) {
  const [on, setOn] = useState(type === "on");
  return (
    <div className="flex items-center gap-[13px] py-[15px]">
      <div className="grid h-[38px] w-[38px] flex-none place-items-center rounded-[11px] bg-surface-2 text-[17px]">
        {ic}
      </div>
      <div className="flex-1">
        <div className="text-[0.95rem] font-semibold">{title}</div>
        <div className="text-[0.77rem] text-fg-soft">{sub}</div>
      </div>
      {type === "chev" ? (
        <span className="text-lg text-fg-faint">›</span>
      ) : (
        <button
          onClick={() => setOn((v) => !v)}
          aria-pressed={on}
          aria-label={title}
          className={`relative h-[27px] w-[46px] flex-none rounded-full transition-colors ${on ? "bg-good" : "bg-surface-2"}`}
        >
          <span
            className="absolute left-[3px] top-[3px] h-[21px] w-[21px] rounded-full bg-white shadow transition-transform"
            style={{ transform: on ? "translateX(19px)" : "none" }}
          />
        </button>
      )}
    </div>
  );
}
