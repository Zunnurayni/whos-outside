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

## Phase 2 — Real backend (Supabase) ✅ (code shipped)

Connect the database so every action persists. Refreshing the browser must not erase a created activity or an accepted join request.

**Status: the code is done and in the repo.** The app runs in two modes with no code change: demo (no env vars → Yola sample data) and live (env vars set → real Supabase). What you do now is the Supabase setup in [SETUP.md](SETUP.md) Track B, then add your keys to `.env.local`. The rest of this section documents what was built and where.

### 2.1 Run the schema
In `supabase/migrations/0001_init.sql`. Follow [SETUP.md](SETUP.md) Track B.

### 2.2 Live queries — DONE
`src/lib/data/activities.ts` now runs real queries with a sample fallback on any error. The row→view mapping lives in `src/lib/data/map-row.ts` (derives the day/time/emoji/status/map-position from DB columns). Profiles resolve through `src/lib/data/profiles.ts`. Original worked example kept below for reference:

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

### 2.3 Auth — DONE (email magic link)
- `src/app/(auth)/login/page.tsx` shows a working email magic-link form in live mode (`EmailLoginForm.tsx`), and the browse-first entry screen in demo mode.
- `src/app/(auth)/auth/callback/route.ts` exchanges the one-time code for a session.
- `src/lib/auth.ts` gives `getCurrentUser()` and `isBackendLive()`; the profile screen has a Sign out action in live mode.
- The `on_auth_user_created` trigger (in the migration) auto-creates the profile row on signup.
- `src/middleware.ts` refreshes the session each request. To gate pages behind auth, add a redirect there — left open so people can browse before signing in, as the login screen offers.

### 2.4 Writes — DONE
All in `src/lib/actions.ts` as Server Actions (auth-checked, RLS-enforced, with `revalidatePath`):
- **Create activity:** `createActivity()` — upserts the venue, inserts the activity, joins the creator. Wired into `CreateClient`.
- **Join:** `requestToJoin()` — inserts a `requested` participant. Wired into the activity detail CTA (optimistic).
- **Approve / decline:** `respondToRequest()` — organiser updates participant status. Wired into the Crews request rows.
- **Leave:** `leaveActivity()` — deletes own participant row.
- **Check-in:** `confirmOnWay()` — flips status to `confirmed_on_way`. Wired into the Crews check-in button.

Every action returns `{ ok, message }`; when there is no backend it returns `message: "demo"` and the client shows the original demo toast, so the app still demos perfectly with no env vars.

**Acceptance:** with Supabase connected, create a plan and refresh — it persists. Join from a second account — the organiser sees the request in Crews and can approve it.

### 2.5 Known Phase 2 follow-ups (small, intentional)
- Crew avatars on the detail screen show initials from real profiles for the host; other crew members fall back to a neutral initial until the detail page fetches all crew profiles (one extra query). Fine for launch, trivial to extend.
- The Crews screen still reads `SAMPLE_CREWS` for its layout; the full crews-from-DB feed (with conversations and the check-in scheduler) is Phase 4. The approve/decline/check-in buttons already call the real actions.
- New activities get a placeholder Yola-centre map point until Phase 3 geocodes the venue.

---

## Phase 3 — Places & event discovery (maps) ✅ (Mapbox code shipped)

Real map + venue search. **Status: built with Mapbox.** Add a free `NEXT_PUBLIC_MAPBOX_TOKEN` to `.env.local` and the Explore screen renders a live Yola map; without one it shows the stylised fallback. Nothing else to change.

### 3.1 Provider — Mapbox
Chosen for brand-matching styling and a generous free tier (50k map loads/month). Token: `NEXT_PUBLIC_MAPBOX_TOKEN`. It's a public client key — restrict it by URL in the Mapbox dashboard.

### 3.2 The map — DONE
`src/components/map/MapboxMap.tsx` is a real Mapbox GL map (dark/light auto, branded pins, click-to-focus, fly-to, fit-bounds). `src/app/(main)/map/MapClient.tsx` renders it when a token exists and falls back to the stylised `StylisedCanvas` otherwise. Pin styles live in `globals.css` (`.wo-pin`) because markers sit outside the React tree.

Coordinates flow through the data layer: migration `0002_activity_coords.sql` adds generated `lat`/`lng` columns to `venues`; the activities query selects them; `ActivityView` now carries `lat`/`lng`; sample data has real Yola coords so the map works in demo mode too.

### 3.3 Venue search — DONE
`src/components/activity/VenueSearch.tsx` + `src/lib/geocode.ts` autocomplete real Yola places via Mapbox geocoding (biased to Yola, country=NG). Picking a result captures `lat`/`lng`; `createActivity` stores the real PostGIS point instead of the Yola-centre placeholder. No token → plain text input, coords fall back to Yola centre.

### 3.4 Admin review queue — remaining
Still to build: an admin route listing `events` with `status = 'pending_review'` to publish or reject. Validate external event data before publishing. (Deferred; not needed for the core map experience.)

### Run the new migration
Paste `supabase/migrations/0002_activity_coords.sql` (or re-run the combined `supabase/setup.sql`) in the SQL Editor so `venues.lat/lng` exist.

**Acceptance:** with a Mapbox token, activities appear as real pins on a Yola map; creating a plan with venue search drops the pin at the real location.

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
