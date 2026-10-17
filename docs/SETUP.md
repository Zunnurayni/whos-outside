# Setup guide

From zero to a running app, step by step. Two tracks: **demo mode** (no backend, 2 minutes) and **full backend** (Supabase, ~20 minutes).

---

## Prerequisites

- **Node.js 18.18+** (check with `node --version`). Install from [nodejs.org](https://nodejs.org) or via `nvm`.
- **Git**.
- A **GitHub account** (to clone / contribute).
- For full backend: a free **[Supabase](https://supabase.com)** account.
- For deploy: a free **[Vercel](https://vercel.com)** account (optional).

---

## Track A — Demo mode (no backend)

The app ships with Yola sample data and runs with no configuration.

```bash
git clone https://github.com/Zunnurayni/whos-outside.git
cd whos-outside
npm install
npm run dev
```

Open <http://localhost:3000>. You'll land on Discover. Everything is navigable: filter by category, open an activity, request to join, create a plan, manage crews, view the profile. Data is the Yola sample set and does not persist. This is **Phase 1**.

To make the app persist real data, continue to Track B.

---

## Track B — Full backend (Supabase)

### Step 1 — Create a Supabase project

1. Go to <https://supabase.com/dashboard> and click **New project**.
2. Name it `whos-outside`, choose a region close to your users (for Nigeria, `West EU (London)` or `Central EU (Frankfurt)` are usually lowest latency until an Africa region fits better), set a database password, and create it.
3. Wait for provisioning (~2 minutes).

### Step 2 — Run the migration

The schema (tables, PostGIS, RLS, triggers) lives in `supabase/migrations/0001_init.sql`.

**Easiest path — SQL editor:**
1. In your Supabase dashboard → **SQL Editor** → **New query**.
2. Paste the entire contents of `supabase/migrations/0001_init.sql`.
3. Click **Run**. You should see "Success. No rows returned."

**CLI path (optional, for repeatable deploys):**
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

### Step 3 — Seed Yola sample venues and events

1. SQL Editor → New query → paste `supabase/seed.sql` → **Run**. This loads venues and published events.
2. Sample *activities* need a real user, so run them after you sign up (Step 6).

### Step 4 — Get your API keys

In Supabase dashboard → **Project Settings** → **API**, copy:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** secret → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ server-only, never expose)

### Step 5 — Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the three values above plus:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> As soon as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set, the app switches from demo data to live mode. Until you wire the live queries in `src/lib/data/activities.ts` (Phase 2), you'll see an empty feed — that's expected. Follow [BUILD_GUIDE.md](BUILD_GUIDE.md) Phase 2 to turn the queries on.

### Step 6 — Run, sign up, seed activities

```bash
npm run dev
```
Create your first account (the `handle_new_user` trigger auto-creates your profile). Then in the Supabase SQL Editor run:
```sql
select seed_sample_activities();
```
This attaches the six sample Yola activities to your profile so the feed has content.

### Step 7 — Enable email auth (if needed)

Supabase dashboard → **Authentication** → **Providers** → make sure **Email** is enabled. For production, configure your SMTP and redirect URLs.

---

## Deploy to Vercel

1. Push your repo to GitHub (see below).
2. Go to <https://vercel.com/new>, import the repo.
3. Add the same environment variables from `.env.local` in Vercel → **Settings** → **Environment Variables** (set `NEXT_PUBLIC_APP_URL` to your Vercel domain).
4. Deploy. Vercel auto-detects Next.js.

> **Supabase redirect URLs:** in Supabase → Authentication → URL Configuration, add your Vercel domain to the allowed redirect URLs.

---

## Pushing to GitHub (first time)

```bash
git init
git add .
git commit -m "Initial commit: Who's Outside? Phase 1 foundation"
git branch -M main
# create the repo on github.com first (or use: gh repo create whos-outside --public --source=. --push)
git remote add origin https://github.com/Zunnurayni/whos-outside.git
git push -u origin main
```

---

## Common issues

| Symptom | Fix |
| --- | --- |
| `Failed to fetch font` on build behind a firewall | Fonts load via `<link>`; if blocked, self-host via `@font-face` (see DESIGN_GUIDE) |
| Empty feed after setting env vars | Expected until Phase 2 queries are enabled; see BUILD_GUIDE Phase 2 |
| `permission denied for table` | RLS is on; you must be signed in, and policies only allow what the spec permits |
| PostGIS functions missing | Re-run the migration; `create extension postgis` must succeed first |
| Port 3000 in use | `npm run dev -- -p 3001` |

---

Next: **[BUILD_GUIDE.md](BUILD_GUIDE.md)** for the phased roadmap, or **[DESIGN_GUIDE.md](DESIGN_GUIDE.md)** for the design system.
