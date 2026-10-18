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
create type activity_status as enum ('draft', 'open', 'filled', 'completed', 'cancelled');
create type activity_visibility as enum ('public', 'unlisted', 'invite_only');
create type participation_status as enum (
  'requested', 'accepted', 'declined', 'confirmed_on_way', 'attended', 'flaked'
);
create type event_status as enum ('pending_review', 'published', 'rejected', 'cancelled');

-- 3. Profiles (linked to Supabase Auth & Snap Kit identity) -----
create table public.profiles (
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
create table public.user_interests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category text not null,
  unique (user_id, category)
);

-- 4. Venues (public places, spatial coordinates for map pins) ---
create table public.venues (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null, -- 'food', 'sports', 'outdoors', 'tech', 'arts', ...
  address text not null,
  city text not null default 'Yola',
  location geography(point, 4326) not null, -- EPSG:4326 GPS coords
  created_at timestamptz default now() not null
);
create index venues_geo_index on public.venues using gist (location);

-- 5. Activities / plans -----------------------------------------
create table public.activities (
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
create index activities_starts_at_index on public.activities (starts_at);
create index activities_category_index on public.activities (category);

-- 6. Participation state machine --------------------------------
create table public.activity_participants (
  id uuid default gen_random_uuid() primary key,
  activity_id uuid references public.activities(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status participation_status default 'requested' not null,
  created_at timestamptz default now() not null,
  unique (activity_id, user_id)
);
create index activity_participants_activity_index on public.activity_participants (activity_id);

-- 7. Organised events (submitted / imported, admin-reviewed) ----
create table public.events (
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
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  activity_id uuid references public.activities(id) on delete cascade not null,
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now() not null,
  unique (activity_id, reviewer_id)
);

-- 9. Safety reports ---------------------------------------------
create table public.reports (
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
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users insert own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Interests: public read, self write
create policy "Interests are viewable by everyone"
  on public.user_interests for select using (true);
create policy "Users manage own interests"
  on public.user_interests for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Venues: public read, any authenticated user may add
create policy "Venues are viewable by everyone"
  on public.venues for select using (true);
create policy "Authenticated users add venues"
  on public.venues for insert with check (auth.role() = 'authenticated');

-- Activities: anyone can view non-cancelled; creators own their rows
create policy "Anyone can view open activities"
  on public.activities for select using (status <> 'cancelled');
create policy "Users create activities"
  on public.activities for insert with check (auth.uid() = creator_id);
create policy "Creators update own activities"
  on public.activities for update using (auth.uid() = creator_id);

-- Participants: visible to the member themselves and the activity creator
create policy "View participants if member or creator"
  on public.activity_participants for select using (
    auth.uid() = user_id
    or auth.uid() in (select creator_id from public.activities where id = activity_id)
  );
create policy "Users request to join"
  on public.activity_participants for insert with check (auth.uid() = user_id);
create policy "Member or creator updates participation"
  on public.activity_participants for update using (
    auth.uid() = user_id
    or auth.uid() in (select creator_id from public.activities where id = activity_id)
  );
create policy "Member leaves (deletes own participation)"
  on public.activity_participants for delete using (auth.uid() = user_id);

-- Events: everyone sees published; submitter sees their own in any state
create policy "Published events are public"
  on public.events for select using (status = 'published' or auth.uid() = submitted_by);
create policy "Authenticated users submit events"
  on public.events for insert with check (auth.uid() = submitted_by);

-- Reviews: public read, author writes for activities they attended
create policy "Reviews are viewable by everyone"
  on public.reviews for select using (true);
create policy "Attendees write reviews"
  on public.reviews for insert with check (auth.uid() = reviewer_id);

-- Reports: a user can file a report and read only their own
create policy "Users file reports"
  on public.reports for insert with check (auth.uid() = reporter_id);
create policy "Reporter reads own reports"
  on public.reports for select using (auth.uid() = reporter_id);
