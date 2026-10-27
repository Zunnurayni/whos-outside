"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, MapPin, Calendar, Clock, Users, Wallet, ShieldCheck } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { TopBar } from "@/components/layout/TopBar";
import { Pad } from "@/components/layout/AppShell";
import { useToast } from "@/components/ui/Toast";
import { VenueSearch } from "@/components/activity/VenueSearch";
import { createActivity } from "@/lib/actions";
import { computeCost, type CostMode } from "@/lib/cost";

const PRESETS = [
  { emoji: "🍢", title: "Suya run at Jimeta Market", cat: "food", cost: 3000, size: 5 },
  { emoji: "⚽", title: "Casual 5-a-side soccer", cat: "sports", cost: 1000, size: 8 },
  { emoji: "🌅", title: "Sunset walk by River Benue", cat: "outdoors", cost: 0, size: 6 },
  { emoji: "🎧", title: "Rooftop aux & chill beats", cat: "music", cost: 1500, size: 6 },
  { emoji: "💻", title: "BCH Hub build & coffee", cat: "tech", cost: 0, size: 8 },
];

// Turn the "Today / Tomorrow / weekend" select + a time string into an ISO date.
function toIso(dateChoice: string, time: string): string {
  const d = new Date();
  if (dateChoice === "Tomorrow") d.setDate(d.getDate() + 1);
  else if (dateChoice.startsWith("This")) d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  const m = time.trim().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  let hours = 19;
  let mins = 0;
  if (m) {
    hours = parseInt(m[1], 10);
    mins = m[2] ? parseInt(m[2], 10) : 0;
    const ap = m[3]?.toLowerCase();
    if (ap === "pm" && hours < 12) hours += 12;
    if (ap === "am" && hours === 12) hours = 0;
  }
  d.setHours(hours, mins, 0, 0);
  return d.toISOString();
}

export function CreateClient({ mapboxToken = "" }: { mapboxToken?: string }) {
  const router = useRouter();
  const { show } = useToast();
  const [cat, setCat] = useState("food");
  const [group, setGroup] = useState(5);
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [cost, setCost] = useState(""); // used as "total cost" for even/host_share
  const [costMode, setCostMode] = useState<CostMode>("even");
  const [hostAmount, setHostAmount] = useState(""); // host's contribution (host_share)
  const [sponsorName, setSponsorName] = useState(""); // sponsored mode
  const [time, setTime] = useState("7:30 PM");
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [pending, startTransition] = useTransition();

  const applyPreset = (p: typeof PRESETS[0]) => {
    setTitle(p.title);
    setCat(p.cat);
    setCost(p.cost > 0 ? String(p.cost) : "");
    setGroup(p.size);
    show(`Loaded "${p.title}" preset ⚡`, "✨");
  };

  const val = (id: string) =>
    (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null)
      ?.value ?? "";

  const post = () => {
    if (!title.trim()) {
      show("Give your plan a title first ✏️", "⚠️");
      return;
    }
    const joinSel = val("c-join");
    const totalCost = Number((cost || "0").replace(/[^\d.]/g, "")) || 0;
    const hostContribution = Number((hostAmount || "0").replace(/[^\d.]/g, "")) || 0;
    const breakdown = computeCost({
      mode: costMode,
      totalCost,
      hostContribution,
      crewSize: group,
      sponsorName,
    });
    const payload = {
      title: title.trim(),
      description: val("c-desc"),
      category: cat,
      venueName: venue,
      startsAt: toIso(val("c-date") || "Today", time || "7:30 PM"),
      cost: Math.round(breakdown.perPerson), // computed per-head, keeps existing reads working
      costMode,
      totalCost,
      hostContribution: costMode === "host_share" ? hostContribution : 0,
      sponsorName: costMode === "sponsored" ? sponsorName.trim() || null : null,
      maxParticipants: group,
      minParticipants: Math.min(3, group),
      joinRule: joinSel.startsWith("Invite") ? "invite" : joinSel.startsWith("Approve") ? "approve" : "open",
      lat: coords.lat,
      lng: coords.lng,
    };
    startTransition(async () => {
      const res = await createActivity(payload);
      if (res.message === "demo") {
        show("Plan dropped! Your crew radar is live 👻", "🎉");
      } else if (res.ok) {
        show(res.message, "🎉");
      } else {
        show(res.message, "⚠️");
        return;
      }
      setTimeout(() => router.push("/discover"), 800);
    });
  };

  const inputClass =
    "w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-[0.95rem] text-fg placeholder:text-fg-faint focus:border-violet focus:outline-none focus:ring-1 focus:ring-violet transition-colors";
  const labelClass = "mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-bold text-fg-soft";

  // Live cost breakdown shown under the cost section as the host types.
  const breakdown = computeCost({
    mode: costMode,
    totalCost: Number((cost || "0").replace(/[^\d.]/g, "")) || 0,
    hostContribution: Number((hostAmount || "0").replace(/[^\d.]/g, "")) || 0,
    crewSize: group,
    sponsorName,
  });

  const COST_MODES: { id: CostMode; label: string }[] = [
    { id: "even", label: "Split evenly" },
    { id: "host_share", label: "I cover a share" },
    { id: "sponsored", label: "On me / sponsored" },
    { id: "byo", label: "Free, bring your own" },
  ];

  return (
    <>
      <TopBar variant="title" title="Drop a Plan" />
      <Pad className="pb-10">
        <div className="pt-4 pb-2">
          <h1 className="font-display text-[1.65rem] font-bold text-fg leading-tight">
            Who wants to pull up? 👻
          </h1>
          <p className="mt-1 text-[0.88rem] text-fg-soft">
            Drop an activity in Yola. People nearby request to join.
          </p>
        </div>

        {/* 1-Tap Quick Vibe Presets */}
        <div className="mt-3">
          <span className="flex items-center gap-1.5 text-[0.74rem] font-bold uppercase tracking-wider text-violet">
            <Sparkles className="h-3.5 w-3.5" /> Quick 1-Tap Presets
          </span>
          <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
            {PRESETS.map((p) => (
              <button
                key={p.title}
                onClick={() => applyPreset(p)}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-fg transition-all active:scale-95 hover:border-violet/50 hover:bg-surface-2"
              >
                <span>{p.emoji}</span>
                <span>{p.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Plan Title */}
        <div className="mt-5">
          <label className={labelClass} htmlFor="c-title">
            What&apos;s the outing?
          </label>
          <input
            id="c-title"
            className={inputClass}
            placeholder="e.g. Suya run at Jimeta market"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Category Selector */}
        <div className="mt-4">
          <span className={labelClass}>Category</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter((c) => c.id !== "all").map((c) => {
              const active = cat === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all active:scale-95 ${
                    active
                      ? "border-violet bg-violet text-white shadow-xs"
                      : "border-line bg-surface text-fg-soft hover:text-fg"
                  }`}
                >
                  <span>{c.emoji}</span>
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div className="mt-4">
          <label className={labelClass} htmlFor="c-desc">
            Describe it
          </label>
          <textarea
            id="c-desc"
            className={`${inputClass} min-h-[84px] resize-y`}
            placeholder="Pace, who it's for, what to bring, where you'll meet..."
          />
        </div>

        {/* Public Venue */}
        <div className="mt-4">
          <label className={labelClass} htmlFor="c-venue">
            <MapPin className="h-3.5 w-3.5 text-violet" />
            Public Meeting Venue
          </label>
          <VenueSearch
            token={mapboxToken}
            value={venue}
            onChange={setVenue}
            onPick={({ lat, lng }) => setCoords({ lat, lng })}
            className={inputClass}
          />
          <div className="mt-1.5 flex items-center gap-1.5 text-[0.74rem] text-fg-faint">
            <ShieldCheck className="h-3.5 w-3.5 text-good" />
            Only public spots are shown, never your home or private coordinates.
          </div>
        </div>

        {/* Date & Time */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="c-date">
              <Calendar className="h-3.5 w-3.5 text-violet" />
              Day
            </label>
            <select id="c-date" className={inputClass}>
              <option>Today</option>
              <option>Tomorrow</option>
              <option>This Friday</option>
              <option>This Saturday</option>
              <option>This Sunday</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="c-time">
              <Clock className="h-3.5 w-3.5 text-violet" />
              Start Time
            </label>
            <input
              id="c-time"
              className={inputClass}
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        {/* Crew Limit */}
        <div className="mt-4">
          <span className={labelClass}>
            <Users className="h-3.5 w-3.5 text-violet" />
            Crew Limit
          </span>
          <div className="flex items-center justify-between rounded-xl border border-line bg-surface px-3 py-2">
            <button
              onClick={() => setGroup((g) => Math.max(2, g - 1))}
              className="grid h-8 w-8 place-items-center rounded-lg bg-surface-2 text-lg font-bold text-fg active:scale-90"
              aria-label="Fewer"
            >
              −
            </button>
            <span className="font-display text-[1.1rem] font-bold text-fg tabular-nums">
              {group} people
            </span>
            <button
              onClick={() => setGroup((g) => Math.min(20, g + 1))}
              className="grid h-8 w-8 place-items-center rounded-lg bg-surface-2 text-lg font-bold text-fg active:scale-90"
              aria-label="More"
            >
              +
            </button>
          </div>
        </div>

        {/* Who pays */}
        <div className="mt-4">
          <span className={labelClass}>
            <Wallet className="h-3.5 w-3.5 text-violet" />
            Who pays?
          </span>
          <div className="grid grid-cols-2 gap-2">
            {COST_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setCostMode(m.id)}
                className={`rounded-xl border px-3 py-2.5 text-[0.82rem] font-semibold transition-colors ${
                  costMode === m.id
                    ? "border-violet bg-violet/10 text-violet"
                    : "border-line bg-surface text-fg-soft"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* mode-specific inputs */}
          {(costMode === "even" || costMode === "host_share") && (
            <div className="mt-3">
              <label className="mb-1.5 block text-[0.78rem] font-bold text-fg-soft" htmlFor="c-cost">
                Total cost of the plan (₦)
              </label>
              <input
                id="c-cost"
                inputMode="numeric"
                className={inputClass}
                placeholder="e.g. 5000"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
          )}

          {costMode === "host_share" && (
            <div className="mt-3">
              <label className="mb-1.5 block text-[0.78rem] font-bold text-fg-soft" htmlFor="c-hostamt">
                How much are you putting in? (₦)
              </label>
              <input
                id="c-hostamt"
                inputMode="numeric"
                className={inputClass}
                placeholder="e.g. 50000"
                value={hostAmount}
                onChange={(e) => setHostAmount(e.target.value)}
              />
            </div>
          )}

          {costMode === "sponsored" && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[0.78rem] font-bold text-fg-soft" htmlFor="c-cost">
                  Total cost (₦, optional)
                </label>
                <input
                  id="c-cost"
                  inputMode="numeric"
                  className={inputClass}
                  placeholder="optional"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[0.78rem] font-bold text-fg-soft" htmlFor="c-sponsor">
                  Sponsor name (optional)
                </label>
                <input
                  id="c-sponsor"
                  className={inputClass}
                  placeholder="leave blank = you"
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* live breakdown */}
          <div className="mt-3 rounded-xl border border-violet/30 bg-violet/5 px-3.5 py-3">
            <div className="flex items-center gap-2">
              <span className="text-[1.05rem]">💸</span>
              <span className="font-display text-[1.05rem] font-bold text-fg">
                {breakdown.memberLine}
              </span>
            </div>
            <p className="mt-1 text-[0.78rem] text-fg-soft">{breakdown.hostLine}</p>
          </div>
        </div>

        {/* Who can join */}
        <div className="mt-4">
          <label className={labelClass} htmlFor="c-join">
            Who can join?
          </label>
          <select id="c-join" className={inputClass}>
            <option>Anyone can request</option>
            <option>Approve each request</option>
            <option>Invite only (share a link)</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className="mt-7">
          <button
            onClick={post}
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-4 font-display text-[1.05rem] font-extrabold text-accent-ink shadow-lg shadow-accent/20 active:scale-98 transition-transform disabled:opacity-60"
          >
            <span>{pending ? "Posting…" : "Post Plan to Radar 👻"}</span>
          </button>
        </div>
      </Pad>
    </>
  );
}
