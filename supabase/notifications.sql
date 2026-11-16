-- Read Talk Pray notifications.
-- Paste this into the PRIMARY database SQL editor:
-- https://supabase.com/dashboard/project/eeeprmtermreavivzswn/sql/new
-- Database dropdown: the primary database.
-- Does not change Sending Church tables, existing rows, or RLS on other tables.

create schema if not exists rtp_private;
revoke all on schema rtp_private from public, anon, authenticated;

create table if not exists public.rtp_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('join', 'approved', 'changes_requested', 'suspended')),
  title text not null,
  body text not null,
  group_id uuid references public.rtp_groups (id) on delete cascade,
  join_request_id uuid references public.rtp_join_requests (id) on delete cascade,
  application_id uuid references public.rtp_group_applications (id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists rtp_notifications_join_request_key
  on public.rtp_notifications (join_request_id)
  where join_request_id is not null;

create index if not exists rtp_notifications_recipient_idx
  on public.rtp_notifications (recipient_id, created_at desc);

alter table public.rtp_notifications enable row level security;
revoke all on public.rtp_notifications from anon, authenticated;
grant select, update on public.rtp_notifications to authenticated;

drop policy if exists "recipients read own notifications" on public.rtp_notifications;
create policy "recipients read own notifications"
  on public.rtp_notifications
  for select
  to authenticated
  using (recipient_id = auth.uid());

drop policy if exists "recipients mark own notifications read" on public.rtp_notifications;
create policy "recipients mark own notifications read"
  on public.rtp_notifications
  for update
  to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

create or replace function rtp_private.guard_notification_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.recipient_id is distinct from old.recipient_id
    or new.kind is distinct from old.kind
    or new.title is distinct from old.title
    or new.body is distinct from old.body
    or new.group_id is distinct from old.group_id
    or new.join_request_id is distinct from old.join_request_id
    or new.application_id is distinct from old.application_id
    or new.created_at is distinct from old.created_at
  then
    raise exception 'notification content is read only';
  end if;
  if old.read_at is not null then
    new.read_at := old.read_at;
  end if;
  return new;
end;
$$;

drop trigger if exists rtp_notifications_guard_update on public.rtp_notifications;
create trigger rtp_notifications_guard_update
  before update on public.rtp_notifications
  for each row execute function rtp_private.guard_notification_update();

create or replace function rtp_private.notify_join()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  leader uuid;
  group_name text;
begin
  select g.leader_user_id, g.name into leader, group_name
  from public.rtp_groups g
  where g.id = new.group_id;
  if leader is null then
    return new;
  end if;
  insert into public.rtp_notifications (recipient_id, kind, title, body, group_id, join_request_id)
  values (
    leader,
    'join',
    'Someone wants to join!',
    new.first_name || ' is interested in ' || coalesce(group_name, 'your group') || '.',
    new.group_id,
    new.id
  )
  on conflict (join_request_id) where join_request_id is not null do nothing;
  return new;
end;
$$;

drop trigger if exists rtp_join_requests_notify on public.rtp_join_requests;
create trigger rtp_join_requests_notify
  after insert on public.rtp_join_requests
  for each row execute function rtp_private.notify_join();

create or replace function rtp_private.notify_application_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  label text;
  notice_title text;
  notice_body text;
begin
  if new.user_id is null or new.status is not distinct from old.status then
    return new;
  end if;
  if new.status not in ('approved', 'changes_requested', 'suspended') then
    return new;
  end if;
  select g.name into label from public.rtp_groups g where g.id = new.group_id;
  label := coalesce(nullif(btrim(label), ''), 'Your group');
  if new.status = 'approved' then
    notice_title := 'Your group is approved';
    notice_body := label || ' is approved.';
  elsif new.status = 'changes_requested' then
    notice_title := 'Changes requested';
    notice_body := 'An admin asked for changes to ' || label || '.';
  else
    notice_title := 'Group suspended';
    notice_body := label || ' is suspended.';
  end if;
  insert into public.rtp_notifications (recipient_id, kind, title, body, group_id, application_id)
  values (new.user_id, new.status, notice_title, notice_body, new.group_id, new.id);
  return new;
end;
$$;

drop trigger if exists rtp_applications_notify_status on public.rtp_group_applications;
create trigger rtp_applications_notify_status
  after update of status on public.rtp_group_applications
  for each row execute function rtp_private.notify_application_status();

revoke all on function rtp_private.guard_notification_update() from public, anon, authenticated;
revoke all on function rtp_private.notify_join() from public, anon, authenticated;
revoke all on function rtp_private.notify_application_status() from public, anon, authenticated;

alter table public.rtp_notifications replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'rtp_notifications'
  ) then
    alter publication supabase_realtime add table public.rtp_notifications;
  end if;
end $$;
