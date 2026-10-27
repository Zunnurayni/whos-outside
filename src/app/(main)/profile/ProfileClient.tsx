"use client";

import { useState, useTransition, useEffect } from "react";
import { Sparkles, MapPin, Award, ShieldCheck, Flame, Zap, Share2, Check } from "lucide-react";
import { ME } from "@/lib/data/sample";
import { CATEGORIES } from "@/lib/categories";
import { TopBar } from "@/components/layout/TopBar";
import { Pad } from "@/components/layout/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { signOut, saveInterests } from "@/lib/actions";

const BADGES = [
  { e: "🎉", l: "First Outing", on: true, desc: "Broke the ice" },
  { e: "🔥", l: "5 Plans Hosted", on: true, desc: "Community anchor" },
  { e: "🛡️", l: "100% Show-up", on: true, desc: "Never flaked once" },
  { e: "🍢", l: "Foodie", on: true, desc: "Knows the good spots" },
  { e: "🌙", l: "Night Owl", on: true, desc: "Late rooftop regular" },
  { e: "🤝", l: "Connector", on: false, desc: "Meet 50+ people" },
  { e: "📸", l: "Storyteller", on: false, desc: "Shared on Snapchat" },
  { e: "🗺️", l: "Explorer", on: false, desc: "Visited every zone" },
];

const PAST = [
  { e: "🍢", t: "Street food night out", s: "2 weeks ago · 5 people", r: "⭐ 5.0" },
  { e: "⚽", t: "5-a-side pickup football", s: "Last month · 8 people", r: "⭐ 4.9" },
  { e: "💻", t: "Open build & coffee session", s: "Last month · 11 people", r: "⭐ 5.0" },
];

export function ProfileClient({
  live = false,
  displayName = ME.name,
  handle = ME.handle ?? "@Nurain_Dev",
  initialInterests = [],
  snapLinked = false,
  snapEnabled = false,
}: {
  live?: boolean;
  displayName?: string;
  handle?: string;
  initialInterests?: string[];
  snapLinked?: boolean;
  snapEnabled?: boolean;
}) {
  const { show } = useToast();
  const snapConnected = snapLinked;

  // Show the result of the Snap OAuth round-trip (?snap=linked|error|...).
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("snap");
    if (!s) return;
    const msg: Record<string, string> = {
      linked: "Snapchat linked! Your Bitmoji is now your avatar. 👻",
      error: "Couldn't link Snapchat. Please try again.",
      unavailable: "Snapchat sign-in isn't set up yet.",
      signin: "Sign in first, then link Snapchat.",
    };
    if (msg[s]) show(msg[s], "👻");
    // clean the query so the toast doesn't repeat on refresh
    window.history.replaceState(null, "", "/profile");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onConnectSnap = () => {
    if (!snapEnabled) {
      show("Snapchat sign-in is coming soon. 👻", "👻");
      return;
    }
    // Hand off to the OAuth start route, which redirects to Snapchat.
    window.location.href = "/auth/snap/start";
  };

  return (
    <>
      <TopBar variant="title" title="Social Passport" subtitle="Your outdoor vibe & cred" />
      <Pad className="pb-12">
        {/* Profile Header */}
        <div className="flex flex-col items-center pt-5 text-center">
          <div className="relative">
            <div className="rounded-full p-1 bg-gradient-to-tr from-accent via-violet to-good shadow-md">
              <div className="rounded-full bg-surface p-1">
                <Avatar personId="me" size={84} />
              </div>
            </div>
            <span className="absolute bottom-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-good text-white shadow-sm ring-2 ring-surface">
              <Zap className="h-3.5 w-3.5 fill-current" />
            </span>
          </div>

          <h1 className="mt-3 font-display text-[1.55rem] font-bold text-fg">
            {displayName}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-fg-soft font-medium">
            <span>{handle}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-0.5">
              <MapPin className="h-3 w-3 text-violet" /> Outside right now
            </span>
          </div>

          <p className="mt-2.5 max-w-[32ch] text-[0.88rem] leading-relaxed text-fg-soft">
            {ME.vibe} · Meetups, weekend football, and sunset walks.
          </p>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => show("Profile editing saved!", "✓")}
              className="rounded-xl border border-line bg-surface px-4 py-2 text-xs font-bold text-fg active:scale-95 transition-transform"
            >
              Edit Vibe
            </button>
            <button
              onClick={onConnectSnap}
              disabled={snapConnected}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-95 ${
                snapConnected
                  ? "bg-accent text-accent-ink shadow-sm"
                  : "border border-line bg-surface text-fg hover:bg-surface-2"
              }`}
            >
              <span>👻</span>
              <span>{snapConnected ? "Snap Linked ✓" : "Connect Snapchat"}</span>
            </button>
          </div>

          {live && (
            <form action={signOut} className="mt-3">
              <button type="submit" className="text-[0.8rem] font-semibold text-fg-soft underline">
                Sign out
              </button>
            </form>
          )}
        </div>

        {/* 3 Metric Cards */}
        <div className="mt-6 grid grid-cols-3 gap-2.5">
          <StatBox num="12" label="Outings" />
          <StatBox num="38" label="Met Outside" />
          <StatBox num="100%" label="Show Rate" highlight />
        </div>

        {/* Interests — tap to pick what you're into; powers "For you" ranking */}
        <InterestsPicker initial={initialInterests} />


        {/* Badges / Street Cred */}
        <div className="mt-6">
          <div className="mb-2.5 flex items-baseline justify-between">
            <h2 className="font-display text-[1.05rem] font-bold text-fg">Street Cred & Badges</h2>
            <span className="text-xs font-semibold text-fg-soft">5 of 8 unlocked</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {BADGES.map((b) => (
              <div
                key={b.l}
                className={`flex flex-col items-center rounded-xl border border-line bg-surface p-2 text-center transition-all ${
                  b.on ? "opacity-100 shadow-xs" : "opacity-40"
                }`}
              >
                <span className="text-2xl">{b.e}</span>
                <span className="mt-1 text-[10px] font-bold text-fg leading-tight">
                  {b.l}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy & Safety Settings */}
        <div className="mt-6">
          <div className="mb-2.5">
            <h2 className="font-display text-[1.05rem] font-bold text-fg">Safety & Coordinates</h2>
          </div>
          <div className="divide-y divide-line rounded-2xl border border-line bg-surface px-4">
            <ToggleRow
              icon={MapPin}
              title="Share Live Coordinates"
              subtitle="Only active while on an accepted outing"
              initialState={false}
            />
            <ToggleRow
              icon={ShieldCheck}
              title="Meeting Venue Privacy"
              subtitle="Keep exact spot hidden until crew locks"
              initialState={true}
            />
            <ToggleRow
              icon={Share2}
              title="Snapchat Creative Share"
              subtitle="Allow 1-tap sticker export to stories"
              initialState={true}
            />
          </div>
        </div>

        {/* Past Memories */}
        <div className="mt-6">
          <div className="mb-2.5">
            <h2 className="font-display text-[1.05rem] font-bold text-fg">Past Outings</h2>
          </div>
          <div className="flex flex-col gap-2.5">
            {PAST.map((p) => (
              <div
                key={p.t}
                className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-xs"
              >
                <div className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-surface-2 text-xl">
                  {p.e}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-xs font-bold text-fg leading-tight truncate">
                    {p.t}
                  </div>
                  <div className="mt-0.5 text-[11px] text-fg-soft">{p.s}</div>
                </div>
                <span className="rounded-md bg-accent/25 px-2 py-0.5 text-xs font-extrabold text-accent-ink tabular-nums">
                  {p.r}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Pad>
    </>
  );
}

function StatBox({
  num,
  label,
  highlight = false,
}: {
  num: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-line bg-surface p-3 text-center shadow-xs ${
        highlight ? "ring-1 ring-good/40" : ""
      }`}
    >
      <div
        className={`font-display text-[1.35rem] font-extrabold tabular-nums ${
          highlight ? "text-good" : "text-fg"
        }`}
      >
        {num}
      </div>
      <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-fg-soft">
        {label}
      </div>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  subtitle,
  initialState,
}: {
  icon: any;
  title: string;
  subtitle: string;
  initialState: boolean;
}) {
  const [on, setOn] = useState(initialState);
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-start gap-2.5">
        <Icon className="h-4 w-4 text-violet shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-bold text-fg">{title}</div>
          <div className="text-[11px] text-fg-soft">{subtitle}</div>
        </div>
      </div>
      <button
        onClick={() => setOn((v) => !v)}
        aria-pressed={on}
        aria-label={title}
        className={`relative h-6 w-11 flex-none rounded-full transition-colors ${
          on ? "bg-good" : "bg-surface-2"
        }`}
      >
        <span
          className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform"
          style={{ transform: on ? "translateX(20px)" : "none" }}
        />
      </button>
    </div>
  );
}

function InterestsPicker({ initial }: { initial: string[] }) {
  const { show } = useToast();
  const [selected, setSelected] = useState<string[]>(initial);
  const [pending, startTransition] = useTransition();
  const cats = CATEGORIES.filter((c) => c.id !== "all");

  const dirty =
    selected.length !== initial.length || selected.some((c) => !initial.includes(c));

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const save = () =>
    startTransition(async () => {
      const res = await saveInterests(selected);
      show(res.message === "demo" ? "Interests saved ✨" : res.message, res.ok || res.message === "demo" ? "✨" : "⚠️");
    });

  return (
    <div className="mt-6">
      <div className="mb-2.5 flex items-baseline justify-between">
        <h2 className="font-display text-[1.05rem] font-bold text-fg">Interests & Vibes</h2>
        {dirty && (
          <button
            onClick={save}
            disabled={pending}
            className="text-xs font-bold text-violet hover:underline disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save"}
          </button>
        )}
      </div>
      <p className="mb-3 text-xs text-fg-soft">
        Pick what you&apos;re into — it shapes the plans we surface for you.
      </p>
      <div className="flex flex-wrap gap-2">
        {cats.map((c) => {
          const on = selected.includes(c.id);
          return (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.83rem] font-semibold transition-colors ${
                on
                  ? "border-violet bg-violet text-white"
                  : "border-line bg-surface text-fg-soft"
              }`}
            >
              {c.emoji} {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
