-- ============================================================
-- Who's Outside? — notifications
-- An in-app feed of what's happening on your plans: someone
-- asked to join, you were accepted, a crew member is on their
-- way, a plan is starting soon. Idempotent so it re-runs safely.
-- ============================================================

-- notification kinds
do $$
begin
  if not exists (select 1 from pg_type where typname = 'notification_kind') then
    create type notification_kind as enum (
      'join_request',     -- someone asked to join your plan (to host)
      'request_accepted', -- host accepted you (to member)
      'request_declined', -- host declined you (to member)
      'on_way',           -- a crew member confirmed on their way (to host)
      'crew_joined',      -- someone new joined the crew (to host)
      'starting_soon'     -- a plan you're in starts soon (to everyone in it)
    );
  end if;
end$$;

create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  -- who receives it
  recipient_id uuid references public.profiles(id) on delete cascade not null,
  -- who triggered it (nullable for system notifications like starting_soon)
  actor_id uuid references public.profiles(id) on delete set null,
  activity_id uuid references public.activities(id) on delete cascade,
  kind notification_kind not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz default now() not null
);

create index if not exists notifications_recipient_index
  on public.notifications (recipient_id, created_at desc);
create index if not exists notifications_unread_index
  on public.notifications (recipient_id) where read_at is null;

-- ── RLS: you only ever see and update your own notifications ──
alter table public.notifications enable row level security;

drop policy if exists "See own notifications" on public.notifications;
create policy "See own notifications"
  on public.notifications for select using (auth.uid() = recipient_id);

drop policy if exists "Mark own notifications read" on public.notifications;
create policy "Mark own notifications read"
  on public.notifications for update using (auth.uid() = recipient_id);

-- Inserts happen through SECURITY DEFINER triggers below, so no
-- public insert policy is needed (and we don't want one).

-- ============================================================
-- Triggers — create notifications automatically on participation
-- changes. SECURITY DEFINER so they can insert rows for other
-- users (the host) under RLS.
-- ============================================================

create or replace function public.notify_on_participation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  host_id uuid;
  plan_title text;
  actor_name text;
begin
  select creator_id, title into host_id, plan_title
    from public.activities where id = new.activity_id;
  select coalesce(display_name, handle, 'Someone') into actor_name
    from public.profiles where id = new.user_id;

  -- New participation row
  if tg_op = 'INSERT' then
    if new.status = 'requested' and host_id is not null and host_id <> new.user_id then
      insert into public.notifications (recipient_id, actor_id, activity_id, kind, body)
      values (host_id, new.user_id, new.activity_id, 'join_request',
              actor_name || ' asked to join ' || plan_title);
    elsif new.status = 'accepted' and host_id is not null and host_id <> new.user_id then
      insert into public.notifications (recipient_id, actor_id, activity_id, kind, body)
      values (host_id, new.user_id, new.activity_id, 'crew_joined',
              actor_name || ' joined ' || plan_title);
    end if;
    return new;
  end if;

  -- Status changed on an existing row
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    if new.status = 'accepted' then
      insert into public.notifications (recipient_id, actor_id, activity_id, kind, body)
      values (new.user_id, host_id, new.activity_id, 'request_accepted',
              'You''re in. ' || plan_title);
    elsif new.status = 'declined' then
      insert into public.notifications (recipient_id, actor_id, activity_id, kind, body)
      values (new.user_id, host_id, new.activity_id, 'request_declined',
              'Your request for ' || plan_title || ' wasn''t accepted this time');
    elsif new.status = 'confirmed_on_way' and host_id is not null and host_id <> new.user_id then
      insert into public.notifications (recipient_id, actor_id, activity_id, kind, body)
      values (host_id, new.user_id, new.activity_id, 'on_way',
              actor_name || ' is on the way to ' || plan_title);
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists participation_notify on public.activity_participants;
create trigger participation_notify
  after insert or update on public.activity_participants
  for each row execute function public.notify_on_participation();

-- ── Helper: unread count for the signed-in user ──
create or replace function public.unread_notification_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int from public.notifications
  where recipient_id = auth.uid() and read_at is null;
$$;
