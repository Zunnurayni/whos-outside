"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, MapPin, Plus, Flame, Calendar, Check, Compass } from "lucide-react";
import type { ActivityView, EventView } from "@/lib/types";
import { categoryLabel, formatNaira, spotsLeft } from "@/lib/categories";
import { personById } from "@/lib/data/sample";
import { TopBar } from "@/components/layout/TopBar";
import { Pad } from "@/components/layout/AppShell";
import { ActivityCard } from "@/components/activity/ActivityCard";
import { CategoryChips } from "@/components/activity/CategoryChips";
import { OutsidePulseBar } from "@/components/activity/OutsidePulseBar";
import { AvatarStack } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { partitionByRadius, distanceKm } from "@/lib/rank";

const RADIUS_KM = 10;

type VibeFilter = "all" | "tonight" | "free" | "urgent";

export function DiscoverClient({
  activities,
  events,
  currentUserId = "me",
  personalised = false,
  unreadCount = 0,
  live = false,
}: {
  activities: ActivityView[];
  events: EventView[];
  currentUserId?: string;
  personalised?: boolean;
  unreadCount?: number;
  live?: boolean;
}) {
  const { show } = useToast();
  const [cat, setCat] = useState<string>("all");
  const [vibe, setVibe] = useState<VibeFilter>("all");
  const [interestedEvents, setInterestedEvents] = useState<Record<string, boolean>>({});

  // Ask for location once on open so the feed can centre on where you are.
  const geo = useGeolocation();
  useEffect(() => {
    geo.request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const located = geo.hasFix;
  const userLngLat: [number, number] | null =
    located && geo.lng != null && geo.lat != null ? [geo.lng, geo.lat] : null;

  // Spotlight = the top-ranked plan (a1 in demo mode, best-for-you when live)
  const feat = activities.find((a) => a.id === "a1") ?? activities[0];
  const featHost = feat ? personById(feat.hostId) : null;

  // Filter by the active category + vibe chips first.
  const chipFiltered = activities.filter((a) => {
    const matchesCat = cat === "all" || a.category === cat;
    if (!matchesCat) return false;

    if (vibe === "tonight") return a.day.toLowerCase().includes("today");
    if (vibe === "free") return a.cost === 0;
    if (vibe === "urgent") return spotsLeft(a) <= 2;

    return true;
  });

  // Then split by distance. `near` = within radius (nearest first); `far` =
  // everything else, used as the "top plans anywhere" fallback. In demo mode
  // (no live backend) we don't radius-filter, so the sample plans always show
  // wherever the viewer is; the real filter kicks in once plans are live.
  const radiusOrigin = live ? userLngLat : null;
  const { near, far } = partitionByRadius(chipFiltered, radiusOrigin, RADIUS_KM);
  // What the list actually shows: nearby plans when there are any, otherwise
  // we fall back to the wider set so the screen is never needlessly empty.
  const showingFallback = radiusOrigin != null && near.length === 0 && far.length > 0;
  const filteredList = near.length > 0 ? near : far;

  const toggleInterest = (id: string, title: string) => {
    setInterestedEvents((prev) => {
      const next = !prev[id];
      if (next) {
        show(`Marked interested in "${title}" ⭐ Added to your radar!`, "🎉");
      }
      return { ...prev, [id]: next };
    });
  };

  return (
    <>
      <TopBar variant="home" unreadCount={unreadCount} />

      {/* Hero Greeting & Quick Action */}
      <Pad className="pt-4 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-[1.65rem] font-bold tracking-tight text-fg leading-tight">
              Who&apos;s outside? 👻
            </h1>
            <p className="mt-1 text-[0.88rem] text-fg-soft">
              Find your crowd. Connect in real life.
            </p>
          </div>
          <Link
            href="/create"
            className="flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-[0.78rem] font-bold text-accent-ink shadow-sm transition-transform active:scale-95"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Drop Plan</span>
          </Link>
        </div>

        {/* Location & Radius Indicator */}
        <div className="mt-2.5 flex items-center gap-2 text-[0.78rem] text-fg-soft">
          <span className="flex items-center gap-1 font-semibold text-fg">
            <MapPin className="h-3.5 w-3.5 text-violet" />
            {located ? "Your location" : geo.loading ? "Finding you…" : "Near you"}
          </span>
          <span aria-hidden="true">·</span>
          <span>{located ? `Within ${RADIUS_KM}km` : `${RADIUS_KM}km radius`}</span>
          <span aria-hidden="true">·</span>
          <Link href="/map" className="font-semibold text-violet hover:underline">
            View radar →
          </Link>
        </div>
      </Pad>

      {/* Live "Who's Out Right Now" Story Pulse Bar */}
      <OutsidePulseBar />

      {/* Quick Vibe Segmented Filter */}
      <div className="px-4 pt-1">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setVibe("all")}
            className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-[0.8rem] font-bold transition-all active:scale-95 ${
              vibe === "all"
                ? "bg-fg text-bg shadow-sm"
                : "bg-surface-2 text-fg-soft hover:text-fg"
            }`}
          >
            All Plans
          </button>
          <button
            onClick={() => setVibe("tonight")}
            className={`flex items-center gap-1 whitespace-nowrap rounded-xl px-3 py-1.5 text-[0.8rem] font-bold transition-all active:scale-95 ${
              vibe === "tonight"
                ? "bg-violet text-white shadow-sm"
                : "bg-surface-2 text-fg-soft hover:text-fg"
            }`}
          >
            <span>🌙</span> Tonight
          </button>
          <button
            onClick={() => setVibe("urgent")}
            className={`flex items-center gap-1 whitespace-nowrap rounded-xl px-3 py-1.5 text-[0.8rem] font-bold transition-all active:scale-95 ${
              vibe === "urgent"
                ? "bg-accent text-accent-ink shadow-sm"
                : "bg-surface-2 text-fg-soft hover:text-fg"
            }`}
          >
            <Flame className="h-3.5 w-3.5 fill-current" /> Filling Fast
          </button>
          <button
            onClick={() => setVibe("free")}
            className={`flex items-center gap-1 whitespace-nowrap rounded-xl px-3 py-1.5 text-[0.8rem] font-bold transition-all active:scale-95 ${
              vibe === "free"
                ? "bg-good text-white shadow-sm"
                : "bg-surface-2 text-fg-soft hover:text-fg"
            }`}
          >
            <span>💸</span> Free Outings
          </button>
        </div>
      </div>

      {/* Category Horizontal Chips */}
      <CategoryChips active={cat} onChange={setCat} />

      <Pad className="pt-2">
        {/* Spotlight Hero (when showing all categories) */}
        {cat === "all" && vibe === "all" && feat && (
          <div className="mb-6 mt-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[0.74rem] font-bold uppercase tracking-wider text-violet">
                <Sparkles className="h-3.5 w-3.5" /> Tonight&apos;s Hot Plan
              </span>
              <span className="text-[0.76rem] font-semibold text-fg-soft">
                {spotsLeft(feat)} spots left
              </span>
            </div>

            <Link
              href={`/activities/${feat.id}`}
              className="group relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-2xl p-5 text-white shadow-card transition-all duration-300 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #1c182d 0%, #352668 50%, #6c4cf0 100%)",
              }}
            >
              {/* Atmospheric Glow Rings */}
              <div
                className="pointer-events-none absolute inset-0 opacity-40 transition-opacity group-hover:opacity-60"
                style={{
                  background:
                    "radial-gradient(circle at 85% 15%, rgba(255, 212, 0, 0.45), transparent 45%), radial-gradient(circle at 10% 85%, rgba(255, 255, 255, 0.2), transparent 40%)",
                }}
              />

              {/* Spotlight Header */}
              <div className="relative flex items-center justify-between">
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-accent-ink shadow-sm">
                  🔥 Filling Fast
                </span>
                <span className="rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white/95">
                  {categoryLabel(feat.category)}
                </span>
              </div>

              {/* Spotlight Content */}
              <div className="relative mt-8">
                <div className="text-[0.8rem] font-semibold text-white/80">
                  {feat.area} · Hosted by {featHost?.name}
                </div>
                <h2 className="mt-1 font-display text-[1.45rem] font-bold leading-tight text-white group-hover:text-accent transition-colors">
                  {feat.title}
                </h2>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-[0.85rem] text-white/90">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {feat.day}, {feat.time}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-bold text-accent">
                    {feat.cost === 0 ? "Free" : formatNaira(feat.cost)}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3">
                  <div className="flex items-center gap-2">
                    <AvatarStack ids={feat.crew} size={28} />
                    <span className="text-xs text-white/80 font-medium">
                      {feat.crew.length} pulling up
                    </span>
                  </div>
                  <span className="rounded-xl bg-white/20 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-white transition-colors group-hover:bg-accent group-hover:text-accent-ink">
                    Join Crew →
                  </span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Section Header */}
        <div className="mb-3 mt-4 flex items-baseline justify-between">
          <h2 className="font-display text-[1.18rem] font-bold text-fg">
            {cat === "all"
              ? vibe === "all"
                ? personalised
                  ? "For You"
                  : "Happening Near You"
                : `${vibe.charAt(0).toUpperCase() + vibe.slice(1)} Plans`
              : `${categoryLabel(cat as any)} near you`}
          </h2>
          <span className="text-[0.82rem] font-bold text-violet">
            {filteredList.length} active
          </span>
        </div>
        {personalised && cat === "all" && vibe === "all" && !showingFallback && (
          <p className="-mt-2 mb-3 text-xs text-fg-soft">
            Ranked by your interests, how soon they start, and distance.
          </p>
        )}

        {/* Fallback banner: nothing within radius, so we show the wider set */}
        {showingFallback && (
          <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-violet/30 bg-violet/5 px-3.5 py-3">
            <Compass className="mt-0.5 h-4 w-4 shrink-0 text-violet" />
            <p className="text-[0.82rem] text-fg-soft">
              <span className="font-semibold text-fg">Nothing within {RADIUS_KM}km yet.</span>{" "}
              Showing top plans further out.{" "}
              <Link href="/create" className="font-semibold text-violet hover:underline">
                Start one near you →
              </Link>
            </p>
          </div>
        )}

        {/* Activities List */}
        {filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
            <span className="text-4xl">📍</span>
            <h3 className="mt-3 font-display text-base font-bold text-fg">
              {located ? "Nobody's outside near you yet" : "No plans matching this vibe yet"}
            </h3>
            <p className="mt-1 max-w-[28ch] text-xs text-fg-soft">
              {located
                ? "Be the one who gets people out. Drop a plan and your crew pulls up."
                : "Be the first to start the wave right now!"}
            </p>
            <Link
              href="/create"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-ink"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              Start a plan
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {filteredList.map((a) => {
              const dist =
                userLngLat && a.lng != null && a.lat != null
                  ? distanceKm(userLngLat, [a.lng, a.lat])
                  : null;
              return (
                <ActivityCard
                  key={a.id}
                  activity={a}
                  joined={a.crew.includes(currentUserId)}
                  distanceKm={dist}
                />
              );
            })}
          </div>
        )}

        {/* Organised Events Feed */}
        {cat === "all" && vibe === "all" && (
          <div className="mt-8">
            <div className="mb-3 flex items-baseline justify-between">
              <div>
                <h2 className="font-display text-[1.18rem] font-bold text-fg">
                  Organised Events
                </h2>
                <p className="text-[0.76rem] text-fg-soft">
                  Verified community meetups near you
                </p>
              </div>
              <Link href="/map" className="text-[0.82rem] font-bold text-violet hover:underline">
                On map ›
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {events.map((e) => {
                const isInterested = Boolean(interestedEvents[e.id]);
                const count = e.interested + (isInterested ? 1 : 0);

                return (
                  <div
                    key={e.id}
                    className="flex w-full flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-surface-2 text-2xl">
                        {e.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-display text-[1.02rem] font-bold text-fg leading-tight">
                          {e.title}
                        </div>
                        <div className="mt-0.5 text-[0.78rem] text-fg-soft">
                          Organised by <strong className="font-semibold text-fg">{e.org}</strong>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-fg-soft">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-violet" /> {e.day}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-violet" /> {e.venue}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-line/60 pt-2.5">
                      <span className="text-[0.78rem] font-semibold text-fg-soft tabular-nums">
                        ⭐ {count} people interested
                      </span>
                      <button
                        onClick={() => toggleInterest(e.id, e.title)}
                        className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                          isInterested
                            ? "bg-good text-white shadow-sm"
                            : "bg-surface-2 text-fg hover:bg-surface-2/80"
                        }`}
                      >
                        {isInterested ? (
                          <>
                            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                            Interested
                          </>
                        ) : (
                          "I'm interested"
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8 mb-4 text-center">
          <p className="text-[0.74rem] text-fg-faint">
            Showing sample plans. Real plans appear here once people start posting.
          </p>
        </div>
      </Pad>
    </>
  );
}
