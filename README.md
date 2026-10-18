<div align="center">

# Who's Outside? 👻

### Find your people. Experience more of life.

A social discovery platform that connects people through activities, places, events, and experiences they want to share. Discover something to do, find compatible people who want to join, form a crew, coordinate the outing, and make memories together.

**Built for Yola / Adamawa first, designed to scale to any city.**

</div>

---

## What this is

Who's Outside? is its own product. Snapchat is a distribution and identity layer, not a dependency: you can discover a public activity from a shared link and join through the website without a Snapchat account. The app owns its activity listings, matching logic, event coordination, group management, and safety features.

The core loop:

> **Discover** an experience → **find** your people → **make** a plan → **go out** → **share** the memory → **discover** the next experience.

This repo is the **Phase 1 foundation**: a polished, mobile-first Progressive Web App with the full navigable interface and realistic Yola sample data. It runs with **zero backend setup**. Phases 2–5 (Supabase backend, maps, matching, Snapchat) are documented and scaffolded so the interface never needs rebuilding as real integrations land.

## Tech stack

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend | Next.js 14 (App Router) + TypeScript | Installable PWA, server + client components, fast to iterate |
| Styling | Tailwind CSS + CSS variable tokens | One design system, light + dark, see [docs/DESIGN_GUIDE.md](docs/DESIGN_GUIDE.md) |
| Backend | Supabase (Postgres + PostGIS, Auth, RLS, Storage, Realtime) | Spatial discovery, row-level security from day one |
| Maps | Mapbox **or** Google Maps Platform | Chosen in Phase 3; stylised placeholder ships now |
| Identity / sharing | Snap Kit (Login, Bitmoji, Creative Kit) | Phase 5; deep-link share stub ships now |
| AI (optional) | Gemini API | Phase 4+; never required for core functionality |

## Quick start

```bash
# 1. Clone and install
git clone https://github.com/Zunnurayni/whos-outside.git
cd whos-outside
npm install

# 2. Run in demo mode (no backend needed — uses Yola sample data)
npm run dev
# open http://localhost:3000
```

That's it. The app is fully navigable with sample data. To connect the real backend, see **[docs/SETUP.md](docs/SETUP.md)**.

## Documentation

| Doc | What's in it |
| --- | --- |
| **[docs/SETUP.md](docs/SETUP.md)** | Step-by-step: clone, env vars, Supabase project, migration, seed, deploy to Vercel |
| **[docs/BUILD_GUIDE.md](docs/BUILD_GUIDE.md)** | The 6 phases, what to build in each, and exactly where to drop real queries |
| **[docs/DESIGN_GUIDE.md](docs/DESIGN_GUIDE.md)** | Design tokens, typography, components, voice, accessibility, dark mode |
| **[docs/UI_UX_CHANGELOG.md](docs/UI_UX_CHANGELOG.md)** | Full breakdown of the Gen Z social discovery UI/UX redesign & features |
| **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** | Folder structure, data model, RLS, the demo-vs-live data layer |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | How to contribute, branch naming, commit style, PR flow |

## Project structure

```
src/
├── app/
│   ├── (auth)/login/          # Entry screen (Supabase Auth + Snap Login in later phases)
│   ├── (main)/                # The app shell: tab bar + screens
│   │   ├── discover/          # Home feed, categories, spotlight, events
│   │   ├── map/               # Stylised map → Mapbox/Google in Phase 3
│   │   ├── activities/[id]/   # Activity detail + join flow
│   │   ├── create/            # Create-a-plan form
│   │   ├── crews/             # My crews, requests, check-in, flake-proofing
│   │   └── profile/           # Identity, interests, badges, privacy
│   └── api/share/snapchat/    # Creative Kit deep-link builder
├── components/                # ui/ layout/ activity/ map/ snap/
├── lib/
│   ├── supabase/              # Browser + server clients, DB types
│   ├── data/                  # Data access layer + Yola sample set
│   └── hooks/                 # useGeolocation, etc.
supabase/
├── migrations/0001_init.sql   # PostGIS schema + RLS
└── seed.sql                   # Yola venues, events, sample activities
```

## Safety is architecture, not an afterthought

- **No public live-location tracking.** The map shows public venues, never users' real-time positions.
- **Consent-based participation.** Express interest freely; joining a private crew needs organiser approval.
- **Snapchat boundaries.** Connecting Snapchat never grants access to private messages, friends lists, or Snap Map location.
- **Meet in public.** Exact meeting pin is revealed to the crew only after the plan locks.
- **Block, report, leave** anytime. 18+ audience to start.
- **Secrets stay server-side.** Only `NEXT_PUBLIC_*` vars reach the browser; RLS enforces access in the database.

## Status

🟢 **Phase 1 complete** — navigable interface, sample data, PWA shell.
🟢 **Phase 2 complete** — Supabase backend wired: live queries, email magic-link + password auth, and create/join/approve/leave/check-in write actions. Runs in demo mode with no env vars, live mode once Supabase keys are set. Set up your project per [docs/SETUP.md](docs/SETUP.md) Track B.
🟢 **Phase 3 complete** — real Mapbox map with activity pins + Yola venue search in Create (geocoded coordinates). Add a free `NEXT_PUBLIC_MAPBOX_TOKEN`; without one the stylised fallback map shows.
⬜ Phase 4 — matching, coordination, notifications.
⬜ Phase 5 — Snap Kit (Login, Bitmoji, Creative Kit).

See [docs/BUILD_GUIDE.md](docs/BUILD_GUIDE.md) for the full roadmap.

## License

MIT — see [LICENSE](LICENSE).

## Maintainer

Built by Nurain ([@Nurain_Dev](https://x.com/Nurain_Dev)) · Yola, Adamawa. Contributions welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).
