# Architecture

How the pieces fit, and the decisions behind them.

---

## The big decision: Who's Outside? owns the product

Snapchat is an **identity and distribution layer**, not a dependency. The app owns its activity listings, matching logic, event coordination, group management, safety, and history. Someone can discover a public activity from a shared link and join through the website without a Snapchat account. We never assume access to Snap Map, friends lists, live location, or Stories.

```
User (mobile / desktop)
        │
   Who's Outside PWA  (Next.js App Router)
        │
   ┌────┴─────────────────────────────┐
   │                                   │
 Supabase                        Snap Kit (Phase 5)
 ├─ Auth + profiles              ├─ Login Kit (identity)
 ├─ PostgreSQL + PostGIS         ├─ Bitmoji (avatar)
 ├─ Row-Level Security           └─ Creative Kit (share deep-links)
 ├─ Storage (media)
 └─ Realtime (participation)     Map provider (Phase 3)
                                 └─ Mapbox / Google Maps + Places
   Gemini API (optional, Phase 4+)
   └─ descriptions, categorisation, moderation assist
```

**Security rule:** secret keys and privileged credentials stay server-side. Only `NEXT_PUBLIC_*` reaches the browser. RLS enforces access in the database so even a leaked anon key can't read what it shouldn't.

---

## The demo-vs-live data layer

The most important architectural choice in this repo: **screens never talk to Supabase directly.** They import from `src/lib/data/*`, which returns a stable view-model type (`ActivityView`, `EventView`, `CrewView` in `src/lib/types.ts`).

- **No env vars →** the data layer returns the Yola sample set. The whole app works with zero setup.
- **Env vars set →** the data layer runs real Supabase queries (wired in Phase 2).

Either way the return type is identical, so swapping the backend in never touches a screen. This is what lets the Phase 1 interface become the production frontend untouched.

```
Screen (DiscoverClient)
   └─ getActivities()            ← src/lib/data/activities.ts
         ├─ demo:  SAMPLE_ACTIVITIES   (src/lib/data/sample.ts)
         └─ live:  supabase.from("activities")...  (Phase 2)
               → both return ActivityView[]
```

---

## Data model

Tables (see `supabase/migrations/0001_init.sql`):

| Table | Purpose |
| --- | --- |
| `profiles` | Identity, display name, handle, bio, Bitmoji URL, city. One row per auth user (auto-created by trigger). |
| `user_interests` | Categories each person likes — feeds the matching ranker. |
| `venues` | Public places with a PostGIS `geography(point)` for map pins + distance. |
| `activities` | User-created plans: title, category, time, cost (₦), min/max, visibility, status. |
| `activity_participants` | Join state machine: requested → accepted → confirmed_on_way → attended / flaked. |
| `events` | Organised events, admin-reviewed (pending_review → published). |
| `reviews` | Post-activity 1–5 ratings. |
| `reports` | Safety reports and moderation outcomes. |

Enums model the real lifecycles (`activity_status`, `participation_status`, `activity_visibility`, `event_status`) instead of free-text flags.

### Spatial discovery
`get_nearby_activities(lat, lng, radius)` uses `ST_DWithin` on a GiST-indexed geography column to answer "what's within N metres of me?" efficiently. This is what the map and the distance filter call.

### Why separate venue from whereabouts
An activity's **public venue** is shown openly; a user's **real-time position** is never public. The schema reflects this: `venues.location` is public map data; there is no table of live user positions. Live location, if ever added, is a separate opt-in feature.

---

## Row-Level Security

RLS is on for every table from the first migration. Highlights:

- **Profiles:** public read, self write.
- **Activities:** anyone sees non-cancelled; only the creator modifies theirs.
- **Participants:** visible only to the member themselves and the activity creator — so a stranger can't enumerate who's attending a private crew.
- **Events:** everyone sees `published`; a submitter sees their own in any state.
- **Reports:** a user can file one and read only their own.

This means even direct API access with the anon key is safe: the database refuses anything the policy doesn't allow.

---

## Routing

Next.js App Router with route groups:

- `(auth)/login` — entry screen, outside the app shell.
- `(main)/*` — wrapped in `AppShell` (tab bar + safe-area). Discover, map, activities/[id], create, crews, profile.
- `api/share/snapchat` — route handler that builds Creative Kit deep-links server-side.

Server Components fetch data; interactive views are `"use client"` children that receive it as props. This keeps data fetching on the server and interactivity on the client without over-fetching.

---

## PWA

`manifest.json` + viewport config make the app installable. `start_url` is `/discover`. Add real `icon-192.png` / `icon-512.png` to `/public` before shipping (placeholders referenced now).

---

## What to read next

- Building a phase: [BUILD_GUIDE.md](BUILD_GUIDE.md)
- Styling anything: [DESIGN_GUIDE.md](DESIGN_GUIDE.md)
- Setting up: [SETUP.md](SETUP.md)
