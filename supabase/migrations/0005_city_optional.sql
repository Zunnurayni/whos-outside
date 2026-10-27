-- ============================================================
-- Who's Outside? — make city optional and location-neutral
-- The app is worldwide, so we no longer default anyone's city to a
-- single place. City becomes nullable with no default; it's set from
-- geocoding or left blank. Idempotent.
-- ============================================================

alter table public.profiles alter column city drop not null;
alter table public.profiles alter column city drop default;

alter table public.venues alter column city drop not null;
alter table public.venues alter column city drop default;
