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
  ('Yola IBB Square',            'tech',     'IBB Square, Yola',                    'Yola', st_setsrid(st_makepoint(12.4410, 9.2040), 4326)),
  ('Modibbo Adama University',   'tech',     'MAU (MAUTECH) campus, Girei',         'Yola', st_setsrid(st_makepoint(12.4920, 9.3450), 4326)),
  ('American University (AUN)',  'tech',     'AUN campus, Lamido Zubairu Way',      'Yola', st_setsrid(st_makepoint(12.4690, 9.2340), 4326)),
  ('Shoprite Yola Mall',         'food',     'Jimeta, Atiku Abubakar Way',          'Yola', st_setsrid(st_makepoint(12.4640, 9.2700), 4326)),
  ('Jimeta bypass fitness park', 'sports',   'Jimeta bypass, Yola',                 'Yola', st_setsrid(st_makepoint(12.4560, 9.2600), 4326))
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
