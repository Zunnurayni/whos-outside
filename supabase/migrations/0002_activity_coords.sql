-- ============================================================
-- Phase 3 — expose venue coordinates as plain numbers
-- Adds generated lat/lng columns to venues, derived from the PostGIS
-- location point, so they come back as numbers in a normal PostgREST
-- join (no WKB parsing on the client). Safe to re-run.
-- ============================================================

alter table public.venues
  add column if not exists lat double precision
    generated always as (st_y(location::geometry)) stored;

alter table public.venues
  add column if not exists lng double precision
    generated always as (st_x(location::geometry)) stored;
