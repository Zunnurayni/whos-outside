-- ============================================================
-- Who's Outside? — flexible cost model
-- Plans split money in different real-life ways: evenly, host
-- covers a share, one person (or sponsor) covers it all, or it's
-- free and you bring your own. We keep estimated_cost_per_person
-- as the computed per-head figure so existing reads keep working,
-- and add the breakdown alongside it. Idempotent.
-- ============================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'cost_mode') then
    create type cost_mode as enum ('even', 'host_share', 'sponsored', 'byo');
  end if;
end$$;

alter table public.activities
  add column if not exists cost_mode cost_mode not null default 'even';
alter table public.activities
  add column if not exists total_cost numeric(12, 2) default 0.00;
alter table public.activities
  add column if not exists host_contribution numeric(12, 2) default 0.00;
alter table public.activities
  add column if not exists sponsor_name text;

comment on column public.activities.cost_mode is
  'even = total split across crew; host_share = host covers host_contribution, crew splits remainder; sponsored = host or sponsor covers 100%, crew free; byo = no shared cost';
comment on column public.activities.total_cost is 'Whole cost of the plan in Naira (even, host_share).';
comment on column public.activities.host_contribution is 'Naira the host puts in (host_share mode).';
comment on column public.activities.estimated_cost_per_person is
  'Computed per-head share in Naira. Set at create time from the cost model so existing reads stay correct.';
