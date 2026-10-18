-- ============================================================
-- Who's Outside? — ONE-PASTE SETUP
-- Paste this entire file into the Supabase SQL Editor and Run.
-- Safe to re-run: types, tables, indexes and policies are all guarded.
-- Combines supabase/migrations/0001_init.sql + supabase/seed.sql
-- ============================================================

-- ============================================================
-- Who's Outside? — initial schema
-- PostGIS spatial discovery + row-level security.
-- Run this in the Supabase SQL editor, or via `supabase db push`.
-- Based on the product spec. See docs/BUILD_GUIDE.md (Phase 2 & 3).
-- ============================================================

-- 1. Extensions -------------------------------------------------
create extension if not exists postgis;
create extension if not exists "uuid-ossp";

-- 2. Enums ------------------------------------------------------
-- Wrapped so re-running the migration is safe (create type has no IF NOT EXISTS).
do $$ begin
  create type activity_status as enum ('draft', 'open', 'filled', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;
do $$ begin
  create type activity_visibility as enum ('public', 'unlisted', 'invite_only');
exception when duplicate_object then null; end $$;
do $$ begin
  create type participation_status as enum (
    'requested', 'accepted', 'declined', 'confirmed_on_way', 'attended', 'flaked'
  );
exception when duplicate_object then null; end $$;
do $$ begin
  create type event_status as enum ('pending_review', 'published', 'rejected', 'cancelled');
exception when duplicate_object then null; end $$;

-- 3. Profiles (linked to Supabase Auth & Snap Kit identity) -----
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  snapchat_id text unique,
  display_name text not null,
  handle text unique,
  bio text,
  bitmoji_avatar_url text,
  city text not null default 'Yola',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Interests each profile declares (used by the matching ranker)
create table if not exists public.user_interests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category text not null,
  unique (user_id, category)
);

-- 4. Venues (public places, spatial coordinates for map pins) ---
create table if not exists public.venues (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null, -- 'food', 'sports', 'outdoors', 'tech', 'arts', ...
  address text not null,
  city text not null default 'Yola',
  location geography(point, 4326) not null, -- EPSG:4326 GPS coords
  created_at timestamptz default now() not null
);
create index if not exists venues_geo_index on public.venues using gist (location);

-- 5. Activities / plans -----------------------------------------
create table if not exists public.activities (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  venue_id uuid references public.venues(id) on delete set null,
  title text not null,
  description text not null,
  category text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  estimated_cost_per_person numeric(10, 2) default 0.00, -- in Naira (₦)
  min_participants int default 3 check (min_participants >= 2),
  max_participants int default 5 check (max_participants >= min_participants),
  visibility activity_visibility default 'public' not null,
  status activity_status default 'open' not null,
  created_at timestamptz default now() not null
);
create index if not exists activities_starts_at_index on public.activities (starts_at);
create index if not exists activities_category_index on public.activities (category);

-- 6. Participation state machine --------------------------------
create table if not exists public.activity_participants (
  id uuid default gen_random_uuid() primary key,
  activity_id uuid references public.activities(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status participation_status default 'requested' not null,
  created_at timestamptz default now() not null,
  unique (activity_id, user_id)
);
create index if not exists activity_participants_activity_index on public.activity_participants (activity_id);

-- 7. Organised events (submitted / imported, admin-reviewed) ----
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  submitted_by uuid references public.profiles(id) on delete set null,
  venue_id uuid references public.venues(id) on delete set null,
  title text not null,
  organiser_name text not null,
  description text,
  category text not null,
  starts_at timestamptz not null,
  ticket_url text,
  source text default 'community', -- 'community' | 'organiser' | 'import' | 'editorial'
  status event_status default 'pending_review' not null,
  created_at timestamptz default now() not null
);

-- 8. Post-activity reviews --------------------------------------
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  activity_id uuid references public.activities(id) on delete cascade not null,
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now() not null,
  unique (activity_id, reviewer_id)
);

-- 9. Safety reports ---------------------------------------------
create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references public.profiles(id) on delete set null,
  reported_user_id uuid references public.profiles(id) on delete set null,
  activity_id uuid references public.activities(id) on delete set null,
  reason text not null,
  details text,
  resolved boolean default false,
  created_at timestamptz default now() not null
);

-- 10. Spatial function: activities within radius ----------------
create or replace function get_nearby_activities(
  user_lat double precision,
  user_lng double precision,
  radius_meters double precision default 10000
)
returns table (
  activity_id uuid,
  title text,
  category text,
  starts_at timestamptz,
  venue_name text,
  distance_meters double precision
)
language sql
stable
as $$
  select
    a.id as activity_id,
    a.title,
    a.category,
    a.starts_at,
    v.name as venue_name,
    st_distance(
      v.location,
      st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography
    ) as distance_meters
  from public.activities a
  join public.venues v on a.venue_id = v.id
  where a.status = 'open'
    and a.starts_at > now()
    and st_dwithin(
      v.location,
      st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
  order by a.starts_at asc;
$$;

-- 11. Auto-create a profile row when a user signs up ------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, city)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'Yola'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 12. Keep updated_at fresh on profiles -------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ============================================================
-- Row-Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.user_interests enable row level security;
alter table public.venues enable row level security;
alter table public.activities enable row level security;
alter table public.activity_participants enable row level security;
alter table public.events enable row level security;
alter table public.reviews enable row level security;
alter table public.reports enable row level security;

-- Profiles: public read, self write
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);
drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
  on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Interests: public read, self write
drop policy if exists "Interests are viewable by everyone" on public.user_interests;
create policy "Interests are viewable by everyone"
  on public.user_interests for select using (true);
drop policy if exists "Users manage own interests" on public.user_interests;
create policy "Users manage own interests"
  on public.user_interests for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Venues: public read, any authenticated user may add
drop policy if exists "Venues are viewable by everyone" on public.venues;
create policy "Venues are viewable by everyone"
  on public.venues for select using (true);
drop policy if exists "Authenticated users add venues" on public.venues;
create policy "Authenticated users add venues"
  on public.venues for insert with check (auth.role() = 'authenticated');

-- Activities: anyone can view non-cancelled; creators own their rows
drop policy if exists "Anyone can view open activities" on public.activities;
create policy "Anyone can view open activities"
  on public.activities for select using (status <> 'cancelled');
drop policy if exists "Users create activities" on public.activities;
create policy "Users create activities"
  on public.activities for insert with check (auth.uid() = creator_id);
drop policy if exists "Creators update own activities" on public.activities;
create policy "Creators update own activities"
  on public.activities for update using (auth.uid() = creator_id);

-- Participants: visible to the member themselves and the activity creator
drop policy if exists "View participants if member or creator" on public.activity_participants;
create policy "View participants if member or creator"
  on public.activity_participants for select using (
    auth.uid() = user_id
    or auth.uid() in (select creator_id from public.activities where id = activity_id)
  );
drop policy if exists "Users request to join" on public.activity_participants;
create policy "Users request to join"
  on public.activity_participants for insert with check (auth.uid() = user_id);
drop policy if exists "Member or creator updates participation" on public.activity_participants;
create policy "Member or creator updates participation"
  on public.activity_participants for update using (
    auth.uid() = user_id
    or auth.uid() in (select creator_id from public.activities where id = activity_id)
  );
drop policy if exists "Member leaves (deletes own participation)" on public.activity_participants;
create policy "Member leaves (deletes own participation)"
  on public.activity_participants for delete using (auth.uid() = user_id);

-- Events: everyone sees published; submitter sees their own in any state
drop policy if exists "Published events are public" on public.events;
create policy "Published events are public"
  on public.events for select using (status = 'published' or auth.uid() = submitted_by);
drop policy if exists "Authenticated users submit events" on public.events;
create policy "Authenticated users submit events"
  on public.events for insert with check (auth.uid() = submitted_by);

-- Reviews: public read, author writes for activities they attended
drop policy if exists "Reviews are viewable by everyone" on public.reviews;
create policy "Reviews are viewable by everyone"
  on public.reviews for select using (true);
drop policy if exists "Attendees write reviews" on public.reviews;
create policy "Attendees write reviews"
  on public.reviews for insert with check (auth.uid() = reviewer_id);

-- Reports: a user can file a report and read only their own
drop policy if exists "Users file reports" on public.reports;
create policy "Users file reports"
  on public.reports for insert with check (auth.uid() = reporter_id);
drop policy if exists "Reporter reads own reports" on public.reports;
create policy "Reporter reads own reports"
  on public.reports for select using (auth.uid() = reporter_id);


-- ==================== SEED DATA ====================
-- ============================================================
-- Who's Outside? — Yola / Adamawa seed data
-- Loads sample venues, events, and a demo activity set so the
-- app has something to show before real users sign up.
--
-- NOTE: activities need a creator_id from auth.users. Because
-- seeding auth users varies by setup, this file seeds venues
-- and events (which don't require auth) plus a reusable function
-- that attaches the sample activities to the FIRST real profile
-- once you have signed up. Run select seed_sample_activities();
-- after creating your first account.
--
-- Coordinates are approximate real locations around Yola/Jimeta.
-- ============================================================

-- ── Venues ──────────────────────────────────────────────────
insert into public.venues (name, category, address, city, location) values
  ('Jimeta Modern Market strip', 'food',     'Jimeta Modern Market, Jimeta',        'Yola', st_setsrid(st_makepoint(12.4600, 9.2730), 4326)),
  ('Pologround Astro Turf',      'sports',   'Pologround, Yola Town',               'Yola', st_setsrid(st_makepoint(12.4430, 9.2060), 4326)),
  ('Benue riverbank, Jimeta',    'outdoors', 'River Benue bank, Jimeta',            'Yola', st_setsrid(st_makepoint(12.4480, 9.2850), 4326)),
  ('BCH Hub Yola',               'tech',     'Yola Bypass, Jimeta',                 'Yola', st_setsrid(st_makepoint(12.4550, 9.2650), 4326)),
  ('Adamawa Arts Council',       'arts',     'Yola Town, near Lamido Palace',       'Yola', st_setsrid(st_makepoint(12.4390, 9.2010), 4326)),
  ('Rooftop lounge, Jimeta',     'nightlife','Atiku Abubakar Way, Jimeta',          'Yola', st_setsrid(st_makepoint(12.4620, 9.2780), 4326)),
  ('Yola IBB Square',            'tech',     'IBB Square, Yola',                    'Yola', st_setsrid(st_makepoint(12.4410, 9.2040), 4326))
on conflict do nothing;

-- ── Organised events (published, public) ────────────────────
insert into public.events (title, organiser_name, description, category, starts_at, source, status, venue_id)
select
  v.title, v.organiser_name, v.description, v.category,
  (now() + v.offset_days * interval '1 day')::timestamptz,
  'organiser', 'published',
  (select id from public.venues where name = v.venue_name limit 1)
from (values
  ('Adamawa Tech & Innovation Fair', '3MTT Adamawa',      'A day of demos, talks and networking for builders across the state.', 'tech',   16, 'Yola IBB Square'),
  ('Jimeta Half Marathon',           'Yola Runners Club', 'Road race starting at the Jimeta bypass, open to all fitness levels.', 'sports', 23, 'Pologround Astro Turf'),
  ('Benue Riverside Live',           'Adamawa Culture',   'Live music and food by the river at golden hour.',                      'music',  29, 'Benue riverbank, Jimeta')
) as v(title, organiser_name, description, category, offset_days, venue_name)
on conflict do nothing;

-- ── Sample activities attached to the first profile ─────────
-- Call this once after you create your first account.
create or replace function public.seed_sample_activities()
returns text
language plpgsql
as $$
declare
  me uuid;
  v_food uuid; v_sport uuid; v_river uuid; v_hub uuid; v_arts uuid; v_roof uuid;
begin
  select id into me from public.profiles order by created_at asc limit 1;
  if me is null then
    return 'No profile found. Sign up first, then run select seed_sample_activities();';
  end if;

  select id into v_food  from public.venues where name = 'Jimeta Modern Market strip' limit 1;
  select id into v_sport from public.venues where name = 'Pologround Astro Turf' limit 1;
  select id into v_river from public.venues where name = 'Benue riverbank, Jimeta' limit 1;
  select id into v_hub   from public.venues where name = 'BCH Hub Yola' limit 1;
  select id into v_arts  from public.venues where name = 'Adamawa Arts Council' limit 1;
  select id into v_roof  from public.venues where name = 'Rooftop lounge, Jimeta' limit 1;

  insert into public.activities
    (creator_id, venue_id, title, description, category, starts_at, estimated_cost_per_person, min_participants, max_participants, status)
  values
    (me, v_food,  'Suya & shawarma run at Jimeta', 'Pulling together a small crew to hit the suya spots behind the market, then shawarma to finish. First timers welcome.', 'food',     now() + interval '6 hours',  3500, 3, 6, 'open'),
    (me, v_sport, '5-a-side at Pologround pitch',  'Casual 5-a-side, splitting the pitch fee between whoever shows. Mixed skill, bring water.',                            'sports',   now() + interval '4 hours',  1000, 6, 10, 'open'),
    (me, v_river, 'Sunset walk along River Benue', 'Easy riverside walk timed for golden hour. Bring a camera, relaxed pace, good for meeting people.',                    'outdoors', now() + interval '2 days',   0,    3, 8, 'open'),
    (me, v_hub,   'Bitcoin Cash dev meetup',       'Open session at the hub. We go over a small build, talk wallets and adoption, then network. Beginners welcome.',         'tech',     now() + interval '3 days',   0,    4, 20, 'open'),
    (me, v_arts,  'Life drawing & chill',          'Bring a sketchbook, we loan pencils. No experience needed. Tea afterward if people are up for it.',                    'arts',     now() + interval '2 days',   1500, 3, 7, 'open'),
    (me, v_roof,  'Afrobeats listening night',     'Trading playlists on a rooftop, everyone gets a turn on the aux. Small drinks tab.',                                  'music',    now() + interval '1 day',    2000, 4, 12, 'open');

  return 'Seeded 6 sample activities for profile ' || me::text;
end;
$$;
