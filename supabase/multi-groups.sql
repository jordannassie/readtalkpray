-- Multiple groups per account, and one optional co-leader per group.
-- Safe to run more than once. Does not delete groups, applications, or Sending Church data.
-- Does not weaken existing row security. Frisco Bible Group and other rows stay in place.

drop index if exists public.rtp_applications_one_open_email;
drop index if exists public.rtp_applications_one_open_user;

alter table public.rtp_groups add column if not exists co_leader_name text;
alter table public.rtp_groups add column if not exists co_leader_photo_url text;

create table if not exists public.rtp_co_leader_invites (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.rtp_group_applications (id) on delete cascade,
  group_id uuid references public.rtp_groups (id) on delete cascade,
  invited_by uuid not null references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  group_name text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  approved boolean not null default false,
  accepted_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rtp_co_leader_invites_name_len check (char_length(name) between 1 and 120),
  constraint rtp_co_leader_invites_email_len check (char_length(email) between 3 and 200)
);

create unique index if not exists rtp_co_leader_one_open
  on public.rtp_co_leader_invites (application_id)
  where application_id is not null and status in ('pending', 'accepted');

create unique index if not exists rtp_group_leaders_one_user
  on public.rtp_group_leaders (group_id, user_id)
  where user_id is not null;

create unique index if not exists rtp_group_leaders_one_email
  on public.rtp_group_leaders (group_id, lower(email))
  where email is not null;

create or replace function rtp_private.limit_group_leaders()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  total integer;
begin
  select count(*) into total
  from public.rtp_group_leaders
  where group_id = new.group_id
    and id is distinct from new.id;
  if total >= 2 then
    raise exception 'A group can have at most two leaders.';
  end if;
  return new;
end;
$$;

revoke all on function rtp_private.limit_group_leaders() from public, anon, authenticated;

drop trigger if exists rtp_group_leaders_limit on public.rtp_group_leaders;
create trigger rtp_group_leaders_limit
  before insert or update of group_id on public.rtp_group_leaders
  for each row execute function rtp_private.limit_group_leaders();

create or replace function rtp_private.member_of_group(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.rtp_groups g
    where g.id = target and g.leader_user_id = auth.uid()
  ) or exists (
    select 1 from public.rtp_group_leaders l
    where l.group_id = target and l.user_id = auth.uid()
  );
$$;

revoke all on function rtp_private.member_of_group(uuid) from public, anon;
grant execute on function rtp_private.member_of_group(uuid) to authenticated;

create or replace function rtp_private.guard_rtp_group_update()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  is_admin boolean;
begin
  if auth.uid() is null then
    return new;
  end if;
  if current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;
  select exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()) into is_admin;
  if is_admin then
    return new;
  end if;
  new.public_location := old.public_location;
  new.address := old.address;
  new.latitude := old.latitude;
  new.longitude := old.longitude;
  new.location_type := old.location_type;
  new.city := old.city;
  new.state := old.state;
  new.country := old.country;
  new.co_leader_name := old.co_leader_name;
  new.co_leader_photo_url := old.co_leader_photo_url;
  if old.leader_user_id is null and new.leader_user_id = auth.uid() then
    new.leader_user_id := new.leader_user_id;
  else
    new.leader_user_id := old.leader_user_id;
  end if;
  if new.status is distinct from old.status
    and not (
      (old.status = 'approved' and new.status = 'paused')
      or (old.status = 'paused' and new.status = 'approved')
    ) then
    new.status := old.status;
  end if;
  return new;
end;
$$;

revoke all on function rtp_private.guard_rtp_group_update() from public, anon, authenticated;

create or replace function rtp_private.guard_co_leader_invite()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  is_admin boolean;
begin
  if auth.uid() is null then
    return new;
  end if;
  if current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;
  select exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()) into is_admin;
  if is_admin then
    return new;
  end if;
  new.application_id := old.application_id;
  new.group_id := old.group_id;
  new.invited_by := old.invited_by;
  new.email := old.email;
  new.name := old.name;
  new.group_name := old.group_name;
  new.approved := old.approved;
  if new.status = 'accepted' and old.status = 'pending' then
    new.accepted_by := auth.uid();
  elsif new.status = 'cancelled' and old.approved = false then
    new.accepted_by := old.accepted_by;
  else
    new.status := old.status;
    new.accepted_by := old.accepted_by;
  end if;
  return new;
end;
$$;

revoke all on function rtp_private.guard_co_leader_invite() from public, anon, authenticated;

drop trigger if exists rtp_co_leader_invites_guard on public.rtp_co_leader_invites;
create trigger rtp_co_leader_invites_guard
  before update on public.rtp_co_leader_invites
  for each row execute function rtp_private.guard_co_leader_invite();

create or replace function rtp_private.withdraw_co_leader(invite uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.rtp_co_leader_invites%rowtype;
  caller uuid := auth.uid();
  allowed boolean := false;
begin
  if caller is null then
    raise exception 'Sign in first.';
  end if;
  select * into row from public.rtp_co_leader_invites where id = invite;
  if not found then
    raise exception 'Invitation was not found.';
  end if;
  if exists (select 1 from public.rtp_admins a where a.user_id = caller) then
    allowed := true;
  elsif row.invited_by = caller then
    allowed := true;
  elsif exists (
    select 1 from public.rtp_group_applications app
    where app.id = row.application_id and app.user_id = caller
  ) then
    allowed := true;
  elsif exists (
    select 1 from public.rtp_groups g
    where g.id = row.group_id and g.leader_user_id = caller
  ) then
    allowed := true;
  end if;
  if not allowed then
    raise exception 'Only the primary leader or an admin can remove a co-leader.';
  end if;
  update public.rtp_co_leader_invites
  set status = 'cancelled', updated_at = now()
  where id = invite;
  if row.group_id is not null then
    delete from public.rtp_group_leaders
    where group_id = row.group_id
      and is_primary = false
      and lower(coalesce(email, '')) = lower(row.email);
    update public.rtp_groups
    set co_leader_name = null, co_leader_photo_url = null
    where id = row.group_id;
  end if;
end;
$$;

revoke all on function rtp_private.withdraw_co_leader(uuid) from public, anon, authenticated;
grant execute on function rtp_private.withdraw_co_leader(uuid) to authenticated;

create or replace function public.rtp_withdraw_co_leader(invite uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  perform rtp_private.withdraw_co_leader(invite);
end;
$$;

revoke all on function public.rtp_withdraw_co_leader(uuid) from public, anon;
grant execute on function public.rtp_withdraw_co_leader(uuid) to authenticated;

alter table public.rtp_co_leader_invites enable row level security;
revoke all on public.rtp_co_leader_invites from anon, authenticated;
grant select, insert, update on public.rtp_co_leader_invites to authenticated;

drop policy if exists "leaders read their groups" on public.rtp_groups;
create policy "leaders read their groups"
  on public.rtp_groups
  for select
  to authenticated
  using (rtp_private.member_of_group(id));

drop policy if exists "leaders update their group" on public.rtp_groups;
create policy "leaders update their group"
  on public.rtp_groups
  for update
  to authenticated
  using (rtp_private.member_of_group(id) and status in ('approved', 'paused'))
  with check (rtp_private.member_of_group(id) and status in ('approved', 'paused'));

drop policy if exists "private details for leaders and admins" on public.rtp_group_private;
create policy "private details for leaders and admins"
  on public.rtp_group_private
  for select
  to authenticated
  using (
    exists (select 1 from public.rtp_admins a where a.user_id = auth.uid())
    or rtp_private.member_of_group(group_id)
  );

drop policy if exists "leaders and admins read join requests" on public.rtp_join_requests;
create policy "leaders and admins read join requests"
  on public.rtp_join_requests
  for select
  to authenticated
  using (
    exists (select 1 from public.rtp_admins a where a.user_id = auth.uid())
    or rtp_private.member_of_group(group_id)
  );

drop policy if exists "leaders and admins update join requests" on public.rtp_join_requests;
create policy "leaders and admins update join requests"
  on public.rtp_join_requests
  for update
  to authenticated
  using (
    exists (select 1 from public.rtp_admins a where a.user_id = auth.uid())
    or rtp_private.member_of_group(group_id)
  )
  with check (
    exists (select 1 from public.rtp_admins a where a.user_id = auth.uid())
    or rtp_private.member_of_group(group_id)
  );

drop policy if exists "leaders read location changes" on public.rtp_location_changes;
create policy "leaders read location changes"
  on public.rtp_location_changes for select to authenticated
  using (
    rtp_private.member_of_group(group_id)
    or exists (select 1 from public.rtp_admins a where a.user_id = auth.uid())
  );

drop policy if exists "leaders request location changes" on public.rtp_location_changes;
create policy "leaders request location changes"
  on public.rtp_location_changes for insert to authenticated
  with check (
    status = 'pending'
    and requested_by = auth.uid()
    and rtp_private.member_of_group(group_id)
  );

drop policy if exists "primary reads co-leader invites" on public.rtp_co_leader_invites;
create policy "primary reads co-leader invites"
  on public.rtp_co_leader_invites
  for select
  to authenticated
  using (
    invited_by = auth.uid()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    or exists (select 1 from public.rtp_admins a where a.user_id = auth.uid())
  );

drop policy if exists "primary invites a co-leader" on public.rtp_co_leader_invites;
create policy "primary invites a co-leader"
  on public.rtp_co_leader_invites
  for insert
  to authenticated
  with check (
    invited_by = auth.uid()
    and status = 'pending'
    and approved = false
    and accepted_by is null
    and lower(email) <> lower(coalesce(auth.jwt() ->> 'email', ''))
    and exists (
      select 1 from public.rtp_group_applications app
      where app.id = application_id and app.user_id = auth.uid()
    )
  );

drop policy if exists "primary cancels a co-leader invite" on public.rtp_co_leader_invites;
create policy "primary cancels a co-leader invite"
  on public.rtp_co_leader_invites
  for update
  to authenticated
  using (invited_by = auth.uid() and approved = false and status in ('pending', 'accepted'))
  with check (invited_by = auth.uid() and approved = false and status = 'cancelled');

drop policy if exists "invitee answers a co-leader invite" on public.rtp_co_leader_invites;
create policy "invitee answers a co-leader invite"
  on public.rtp_co_leader_invites
  for update
  to authenticated
  using (
    status = 'pending'
    and approved = false
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  with check (
    approved = false
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and status in ('accepted', 'declined')
    and (status = 'declined' or accepted_by = auth.uid())
  );

drop policy if exists "admins update co-leader invites" on public.rtp_co_leader_invites;
create policy "admins update co-leader invites"
  on public.rtp_co_leader_invites
  for update
  to authenticated
  using (exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()));

grant delete on public.rtp_group_leaders to authenticated;

drop policy if exists "admins delete a co-leader" on public.rtp_group_leaders;
create policy "admins delete a co-leader"
  on public.rtp_group_leaders
  for delete
  to authenticated
  using (
    is_primary = false
    and exists (select 1 from public.rtp_admins a where a.user_id = auth.uid())
  );
