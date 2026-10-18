# Build guide

The product ships in six phases. Build each phase, test it with real people, and don't let a generated UI masquerade as a working backend. This guide says what to build in each phase and **exactly where in this codebase** to make the change.

The golden rule: **the interface never gets rebuilt.** Screens read from `src/lib/data/*`. Swapping sample data for live Supabase queries happens in that one layer, so no screen changes when the backend arrives.

---

## Phase 1 — Product foundation ✅ (shipped in this repo)

A polished, responsive, navigable app with realistic Yola sample data.

- [x] Home / Discover feed with categories, spotlight, events
- [x] Explore map with sample pins (stylised)
- [x] Activity creation form
- [x] Activity detail + join flow
- [x] Profiles, interests, badges, privacy toggles
- [x] My Crews with requests, check-in, flake-proofing states
- [x] Responsive nav, empty states, loading-safe, dark mode
- [x] Clearly-flagged demo data, no fake "live" integrations

**Where it lives:** `src/app/(main)/*`, `src/components/*`, `src/lib/data/sample.ts`.

---

## Phase 2 — Real backend (Supabase)

Connect the database so every action persists. Refreshing the browser must not erase a created activity or an accepted join request.

### 2.1 Run the schema
Already written in `supabase/migrations/0001_init.sql`. Follow [SETUP.md](SETUP.md) Track B.

### 2.2 Turn on live queries
Open `src/lib/data/activities.ts`. Each function has a commented live-mode block. Replace the sample return with the real query. Worked example for `getActivities()`:

```ts
import { createClient } from "@/lib/supabase/server";

export async function getActivities(): Promise<ActivityView[]> {
  const supabase = createClient();
  if (!supabase) return SAMPLE_ACTIVITIES; // demo fallback stays

  const { data, error } = await supabase
    .from("activities")
    .select(`
      id, title, description, category, starts_at, estimated_cost_per_person,
      min_participants, max_participants, status,
      venues ( name, city ),
      activity_participants ( user_id ),
      creator:profiles!activities_creator_id_fkey ( id, display_name )
    `)
    .eq("status", "open")
    .order("starts_at");

  if (error || !data) return [];
  return data.map(mapRowToView); // write mapRowToView to match ActivityView
}
```

Because `ActivityView` is the contract, the Discover/Map/Detail screens keep working unchanged.

### 2.3 Auth
- Wire `src/app/(auth)/login/page.tsx` to Supabase Auth (email magic link is simplest to start).
- The `on_auth_user_created` trigger already creates a profile row on signup.
- Gate protected actions (create, join) in `src/middleware.ts` by redirecting unauthenticated users.

### 2.4 Writes
- **Create activity:** `POST` from `CreateClient` → a Server Action that `insert`s into `activities` (+ a `venues` upsert).
- **Join:** insert into `activity_participants` with status `requested`.
- **Approve/decline:** organiser updates participant `status` (RLS already allows creator updates).
- **Leave:** delete own participant row.

**Acceptance:** create a plan, refresh — it's still there. Join a plan from a second account — the organiser sees the request.

---

## Phase 3 — Places & event discovery (maps)

Replace the stylised map with a real one and add venue search.

### 3.1 Pick a provider
Mapbox GL JS or Google Maps Platform. Compare pricing, Nigeria coverage, and terms. Put the token in `.env.local` (`NEXT_PUBLIC_MAPBOX_TOKEN` or `NEXT_PUBLIC_GOOGLE_MAPS_KEY`).

### 3.2 Swap the canvas
In `src/app/(main)/map/MapClient.tsx`, replace the `.map-canvas` block with the provider's map component. Keep the pin → floating-card interaction; only the rendering changes. Feed pins from the spatial RPC:

```ts
const { data } = await supabase.rpc("get_nearby_activities", {
  user_lat: lat, user_lng: lng, radius_meters: 10000,
});
```

`useGeolocation` (in `src/lib/hooks`) already provides `lat`/`lng` with a manual Yola fallback.

### 3.3 Venue search on create
Wire the venue input in `CreateClient` to the provider's Places/geocoding API, store the chosen venue in `venues` with a PostGIS point.

### 3.4 Admin review queue
Build an admin route that lists `events` with `status = 'pending_review'` and lets an admin publish or reject. Validate external event data before publishing.

**Acceptance:** activities appear as real pins; distance filtering works; a submitted event waits for review before showing publicly.

---

## Phase 4 — Matching & coordination

The part that makes this more than a directory.

### 4.1 Rules-based ranking (not AI)
Build a ranker (a SQL view or a server function):
1. Filter out cancelled / full / expired / incompatible activities.
2. Match category against the user's `user_interests`.
3. Compare availability with `starts_at`.
4. Apply city, travel radius, budget.
5. Rank by shared interests, time relevance, distance, popularity.

Present it as a **relevance ranking**, never a validated compatibility score.

### 4.2 Coordination
- Confirmed participant list on the activity.
- An activity-specific conversation (or an agreed external link) once a crew locks.
- Notifications for acceptance, cancellation, changes (Supabase Realtime + a notifications table).
- Leave + report flows writing to `reports`.

### 4.3 Flake-proofing state machine
From the spec:
```
[Created] → [Requests received] → organiser accepts 3–5
   → (45 min before starts_at) [Check-in phase]
      → < min confirm "On my way" → [Auto-cancelled]
      → ≥ min confirm → [Crew locked] → exact meeting pin revealed
```
Implement check-in with a scheduled Supabase Edge Function that flips statuses and sends push alerts.

**Acceptance:** a plan with too few confirmations auto-cancels at check-in; a full one locks and reveals the pin.

---

## Phase 5 — Snapchat (Snap Kit)

Only after the core works. Snapchat is identity + distribution, never a dependency.

1. Register the app at <https://devportal.snap.com>.
2. Configure the dev environment and approved permissions.
3. **Login Kit** — Snapchat sign-in + approved identity fields (display name, Bitmoji).
4. **Bitmoji** — optional avatar display. `src/components/snap/BitmojiAvatar.tsx` should fall back to initials when not linked.
5. **Creative Kit** — the share stub in `src/components/snap/SnapShareButton.tsx` and `src/app/api/share/snapchat/route.ts` already build the deep-link; upgrade to the official SDK + dynamic OpenGraph/sticker.
6. Deep-link every shareable card back to the right `/activities/[id]`.
7. Test on supported devices; complete Snap's production review.

Verify current SDK support and approval conditions for your web/mobile stack before committing — the docs change.

**Do not** assume access to Snap Map, friends lists, live location, or Stories ingestion. None of those are available to third-party apps.

---

## Phase 6 — Test with real people

Start with a small, controlled Yola community. Measure **successful experiences per active user**, not downloads or scroll time:
- How many create or join an activity.
- How many join requests become confirmed plans.
- How many confirmed outings actually happen.
- How many users return for another activity.
- Whether users feel safe meeting new people.

---

## Deliberately out of v1

| Feature | Decision | Reason |
| --- | --- | --- |
| Live Snap Map friends | Defer | No public API for that data |
| Auto event ingestion from many providers | Defer | Licensing + data-quality cost |
| AI personality matching | Defer | Shared interests are enough to start |
| Live location during outings | Defer | Privacy / safety risk |
| In-app voice/video | Defer | Existing channels serve early users |
| Payments / ticketing | Defer | Discovery first, transactions later |
| Heavy gamification | Keep light | Reward real experiences, not scrolling |

---

## A note on the font `<link>` warning

`npm run build` prints one ESLint warning about loading fonts via `<link>` in the layout instead of `next/font`. This is intentional: it keeps the build working on restricted networks and is the standard App Router pattern. To silence it and gain self-hosting, move to `next/font/google` (needs network at build) or self-host the two faces as `@font-face` data URIs. Either is fine; the warning is harmless.
