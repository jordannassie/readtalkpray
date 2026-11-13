-- Read Talk Pray tables for the existing Supabase project.
-- This file does not drop, rename, or update Sending Church tables.
-- Run it once in the Supabase SQL editor after reviewing it.
-- Then add yourself as an admin:
--   insert into public.rtp_admins (user_id)
--   select id from auth.users where lower(email) = lower('you@example.com');

create schema if not exists rtp_private;
revoke all on schema rtp_private from public, anon, authenticated;

create or replace function public.rtp_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.rtp_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.rtp_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  city text not null,
  state text,
  country text not null,
  location_type text not null check (location_type in ('public_venue', 'home', 'other')),
  public_location text not null,
  address text,
  latitude double precision not null,
  longitude double precision not null,
  meeting_day text,
  meeting_time text,
  duration text,
  timezone text,
  leader_name text not null,
  leader_photo_url text,
  leader_user_id uuid references auth.users (id) on delete set null,
  status text not null default 'approved' check (status in ('pending', 'approved', 'rejected', 'suspended', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rtp_group_leaders (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.rtp_groups (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  email text,
  phone text,
  photo_url text,
  is_primary boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists rtp_group_leaders_one_primary
  on public.rtp_group_leaders (group_id)
  where is_primary;

create or replace function rtp_private.email_matches_leader(target_group uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.rtp_group_leaders
    where group_id = target_group
      and is_primary
      and email is not null
      and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function rtp_private.email_matches_leader(uuid) from public, anon;
grant usage on schema rtp_private to authenticated;
grant execute on function rtp_private.email_matches_leader(uuid) to authenticated;

create table if not exists public.rtp_group_private (
  group_id uuid primary key references public.rtp_groups (id) on delete cascade,
  address text,
  exact_latitude double precision,
  exact_longitude double precision,
  leader_email text,
  leader_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rtp_group_applications (
  id uuid primary key default gen_random_uuid(),
  leader_name text not null,
  email text,
  phone text not null,
  phone_normalized text generated always as (
    btrim(regexp_replace(btrim(phone), '^[Pp]:', ''))
  ) stored,
  city text not null,
  state text,
  country text not null,
  location_type text not null check (location_type in ('public_venue', 'home', 'other')),
  meeting_location text not null,
  meeting_day text,
  meeting_time text,
  duration text,
  timezone text,
  description text,
  leader_photo_url text,
  latitude double precision,
  longitude double precision,
  exact_latitude double precision,
  exact_longitude double precision,
  user_id uuid references auth.users (id) on delete set null,
  group_name text,
  attended boolean not null default false,
  faith_agreed boolean not null default false,
  commitments_agreed boolean not null default false,
  zoom_agreed boolean not null default false,
  privacy_agreed boolean not null default false,
  review_message text,
  status text not null default 'pending' check (status in ('pending', 'changes_requested', 'approved', 'rejected', 'suspended')),
  group_id uuid references public.rtp_groups (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rtp_join_requests (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.rtp_groups (id) on delete cascade,
  first_name text not null,
  phone text not null,
  phone_normalized text generated always as (
    btrim(regexp_replace(btrim(phone), '^[Pp]:', ''))
  ) stored,
  email text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'coming', 'attended', 'do_not_contact')),
  address_shared boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rtp_join_requests_group_phone_key unique (group_id, phone_normalized)
);

create table if not exists public.rtp_leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  first_name text,
  last_name text,
  phone text not null,
  phone_normalized text generated always as (
    btrim(regexp_replace(btrim(phone), '^[Pp]:', ''))
  ) stored,
  email text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'coming', 'attended', 'do_not_contact')),
  notes text,
  contacted_at timestamptz,
  source text,
  source_file text,
  meta_lead_id text,
  lead_created_at timestamptz,
  imported_by uuid references auth.users (id) on delete set null,
  category text not null default 'join' check (category in ('join', 'start')),
  location text,
  city text,
  group_id uuid references public.rtp_groups (id) on delete set null,
  group_name text,
  group_key text generated always as (coalesce(group_id::text, '')) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rtp_leads_phone_category_group_key unique (phone_normalized, category, group_key)
);

create index if not exists rtp_groups_status_city_idx on public.rtp_groups (status, city);
create index if not exists rtp_join_requests_group_idx on public.rtp_join_requests (group_id, created_at desc);
create index if not exists rtp_applications_status_idx on public.rtp_group_applications (status, created_at desc);
create index if not exists rtp_leads_category_idx on public.rtp_leads (category, created_at desc);

drop trigger if exists rtp_groups_set_updated_at on public.rtp_groups;
create trigger rtp_groups_set_updated_at
  before update on public.rtp_groups
  for each row execute function public.rtp_set_updated_at();

drop trigger if exists rtp_group_private_set_updated_at on public.rtp_group_private;
create trigger rtp_group_private_set_updated_at
  before update on public.rtp_group_private
  for each row execute function public.rtp_set_updated_at();

drop trigger if exists rtp_applications_set_updated_at on public.rtp_group_applications;
create trigger rtp_applications_set_updated_at
  before update on public.rtp_group_applications
  for each row execute function public.rtp_set_updated_at();

drop trigger if exists rtp_join_requests_set_updated_at on public.rtp_join_requests;
create trigger rtp_join_requests_set_updated_at
  before update on public.rtp_join_requests
  for each row execute function public.rtp_set_updated_at();

drop trigger if exists rtp_leads_set_updated_at on public.rtp_leads;
create trigger rtp_leads_set_updated_at
  before update on public.rtp_leads
  for each row execute function public.rtp_set_updated_at();

alter table public.rtp_admins enable row level security;
alter table public.rtp_groups enable row level security;
alter table public.rtp_group_leaders enable row level security;
alter table public.rtp_group_private enable row level security;
alter table public.rtp_group_applications enable row level security;
alter table public.rtp_join_requests enable row level security;
alter table public.rtp_leads enable row level security;

grant usage on schema public to anon, authenticated;

revoke all on public.rtp_admins from anon, authenticated;
revoke all on public.rtp_groups from anon, authenticated;
revoke all on public.rtp_group_leaders from anon, authenticated;
revoke all on public.rtp_group_private from anon, authenticated;
revoke all on public.rtp_group_applications from anon, authenticated;
revoke all on public.rtp_join_requests from anon, authenticated;
revoke all on public.rtp_leads from anon, authenticated;

grant select on public.rtp_admins to authenticated;
grant select on public.rtp_groups to anon, authenticated;
grant insert, update on public.rtp_groups to authenticated;
grant select, update on public.rtp_group_leaders to authenticated;
grant insert on public.rtp_group_leaders to authenticated;
grant select on public.rtp_group_private to authenticated;
grant insert, update on public.rtp_group_private to authenticated;
grant insert on public.rtp_group_applications to anon, authenticated;
grant select, update on public.rtp_group_applications to authenticated;
grant insert on public.rtp_join_requests to anon, authenticated;
grant select, update on public.rtp_join_requests to authenticated;
grant insert on public.rtp_leads to anon, authenticated;
grant select, update on public.rtp_leads to authenticated;

drop policy if exists "admins read their own row" on public.rtp_admins;
create policy "admins read their own row"
  on public.rtp_admins
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "public reads approved groups" on public.rtp_groups;
create policy "public reads approved groups"
  on public.rtp_groups
  for select
  to anon, authenticated
  using (status = 'approved');

drop policy if exists "admins read every group" on public.rtp_groups;
create policy "admins read every group"
  on public.rtp_groups
  for select
  to authenticated
  using (exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()));

drop policy if exists "admins insert groups" on public.rtp_groups;
create policy "admins insert groups"
  on public.rtp_groups
  for insert
  to authenticated
  with check (exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()));

drop policy if exists "admins update groups" on public.rtp_groups;
create policy "admins update groups"
  on public.rtp_groups
  for update
  to authenticated
  using (exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()));

drop policy if exists "leaders claim a group" on public.rtp_groups;
create policy "leaders claim a group"
  on public.rtp_groups
  for update
  to authenticated
  using (
    status = 'approved'
    and leader_user_id is null
    and rtp_private.email_matches_leader(id)
  )
  with check (status = 'approved' and leader_user_id = auth.uid());

drop policy if exists "leaders read their groups" on public.rtp_groups;
create policy "leaders read their groups"
  on public.rtp_groups
  for select
  to authenticated
  using (leader_user_id = auth.uid());

drop policy if exists "leaders update their group" on public.rtp_groups;
create policy "leaders update their group"
  on public.rtp_groups
  for update
  to authenticated
  using (leader_user_id = auth.uid() and status in ('approved', 'paused'))
  with check (leader_user_id = auth.uid() and status in ('approved', 'paused'));

drop policy if exists "admins read leaders" on public.rtp_group_leaders;
create policy "admins read leaders"
  on public.rtp_group_leaders
  for select
  to authenticated
  using (exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()));

drop policy if exists "leaders read their leader row" on public.rtp_group_leaders;
create policy "leaders read their leader row"
  on public.rtp_group_leaders
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.rtp_groups g
      where g.id = group_id and g.leader_user_id = auth.uid()
    )
  );

drop policy if exists "admins insert leaders" on public.rtp_group_leaders;
create policy "admins insert leaders"
  on public.rtp_group_leaders
  for insert
  to authenticated
  with check (exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()));

drop policy if exists "admins update leaders" on public.rtp_group_leaders;
create policy "admins update leaders"
  on public.rtp_group_leaders
  for update
  to authenticated
  using (exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()));

drop policy if exists "leaders claim leader row" on public.rtp_group_leaders;
create policy "leaders claim leader row"
  on public.rtp_group_leaders
  for update
  to authenticated
  using (
    user_id is null
    and is_primary
    and rtp_private.email_matches_leader(group_id)
  )
  with check (user_id = auth.uid());

drop policy if exists "private details for leaders and admins" on public.rtp_group_private;
create policy "private details for leaders and admins"
  on public.rtp_group_private
  for select
  to authenticated
  using (
    exists (select 1 from public.rtp_admins a where a.user_id = auth.uid())
    or exists (
      select 1 from public.rtp_groups g
      where g.id = group_id and g.leader_user_id = auth.uid()
    )
  );

drop policy if exists "admins insert private details" on public.rtp_group_private;
create policy "admins insert private details"
  on public.rtp_group_private
  for insert
  to authenticated
  with check (exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()));

drop policy if exists "admins update private details" on public.rtp_group_private;
create policy "admins update private details"
  on public.rtp_group_private
  for update
  to authenticated
  using (exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()));

drop policy if exists "anyone can apply to start a group" on public.rtp_group_applications;
create policy "anyone can apply to start a group"
  on public.rtp_group_applications
  for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and group_id is null
    and char_length(leader_name) between 1 and 120
    and char_length(city) between 1 and 80
    and char_length(country) between 1 and 80
    and char_length(meeting_location) between 1 and 200
  );

drop policy if exists "admins read applications" on public.rtp_group_applications;
create policy "admins read applications"
  on public.rtp_group_applications
  for select
  to authenticated
  using (exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()));

drop policy if exists "admins update applications" on public.rtp_group_applications;
create policy "admins update applications"
  on public.rtp_group_applications
  for update
  to authenticated
  using (exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()));

drop policy if exists "anyone can ask to join an approved group" on public.rtp_join_requests;
create policy "anyone can ask to join an approved group"
  on public.rtp_join_requests
  for insert
  to anon, authenticated
  with check (
    status = 'new'
    and address_shared = false
    and char_length(first_name) between 1 and 80
    and exists (
      select 1 from public.rtp_groups g
      where g.id = group_id and g.status = 'approved'
    )
  );

drop policy if exists "leaders and admins read join requests" on public.rtp_join_requests;
create policy "leaders and admins read join requests"
  on public.rtp_join_requests
  for select
  to authenticated
  using (
    exists (select 1 from public.rtp_admins a where a.user_id = auth.uid())
    or exists (
      select 1 from public.rtp_groups g
      where g.id = group_id and g.leader_user_id = auth.uid()
    )
  );

drop policy if exists "leaders and admins update join requests" on public.rtp_join_requests;
create policy "leaders and admins update join requests"
  on public.rtp_join_requests
  for update
  to authenticated
  using (
    exists (select 1 from public.rtp_admins a where a.user_id = auth.uid())
    or exists (
      select 1 from public.rtp_groups g
      where g.id = group_id and g.leader_user_id = auth.uid()
    )
  )
  with check (
    exists (select 1 from public.rtp_admins a where a.user_id = auth.uid())
    or exists (
      select 1 from public.rtp_groups g
      where g.id = group_id and g.leader_user_id = auth.uid()
    )
  );

drop policy if exists "public can add leads" on public.rtp_leads;
create policy "public can add leads"
  on public.rtp_leads
  for insert
  to anon, authenticated
  with check (
    status = 'new'
    and category in ('join', 'start')
    and char_length(full_name) between 1 and 200
  );

drop policy if exists "admins read leads" on public.rtp_leads;
create policy "admins read leads"
  on public.rtp_leads
  for select
  to authenticated
  using (exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()));

drop policy if exists "admins update leads" on public.rtp_leads;
create policy "admins update leads"
  on public.rtp_leads
  for update
  to authenticated
  using (exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()));

do $$
begin
  if to_regclass('storage.objects') is not null then
    insert into storage.buckets (id, name, public)
    values ('rtp-photos', 'rtp-photos', true)
    on conflict (id) do nothing;
    execute 'drop policy if exists "rtp application photo upload" on storage.objects';
  end if;
end $$;

alter table public.rtp_group_applications add column if not exists timezone text;
alter table public.rtp_groups add column if not exists timezone text;
alter table public.rtp_group_applications add column if not exists duration text;
alter table public.rtp_groups add column if not exists duration text;
alter table public.rtp_group_applications add column if not exists user_id uuid references auth.users (id) on delete set null;
alter table public.rtp_group_applications add column if not exists group_name text;
alter table public.rtp_group_applications add column if not exists attended boolean not null default false;
alter table public.rtp_group_applications add column if not exists faith_agreed boolean not null default false;
alter table public.rtp_group_applications add column if not exists commitments_agreed boolean not null default false;
alter table public.rtp_group_applications add column if not exists zoom_agreed boolean not null default false;
alter table public.rtp_group_applications add column if not exists privacy_agreed boolean not null default false;
alter table public.rtp_group_applications add column if not exists review_message text;

alter table public.rtp_groups drop constraint if exists rtp_groups_status_check;
alter table public.rtp_groups add constraint rtp_groups_status_check
  check (status in ('pending', 'approved', 'rejected', 'suspended', 'paused'));
alter table public.rtp_group_applications drop constraint if exists rtp_group_applications_status_check;
alter table public.rtp_group_applications add constraint rtp_group_applications_status_check
  check (status in ('pending', 'changes_requested', 'approved', 'rejected', 'suspended'));

create table if not exists public.rtp_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rtp_application_reviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.rtp_group_applications (id) on delete cascade,
  reviewer_id uuid not null references auth.users (id) on delete restrict,
  action text not null check (action in ('note', 'approve', 'reject', 'request_changes', 'suspend', 'reactivate', 'checklist')),
  note text,
  message text,
  checklist jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.rtp_location_changes (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.rtp_groups (id) on delete cascade,
  requested_by uuid references auth.users (id) on delete set null,
  public_location text not null,
  private_address text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id) on delete set null
);

create index if not exists rtp_profiles_user_idx on public.rtp_profiles (user_id);
create index if not exists rtp_application_reviews_application_idx on public.rtp_application_reviews (application_id, created_at desc);
create index if not exists rtp_location_changes_group_idx on public.rtp_location_changes (group_id, status);

do $$
begin
  if not exists (
    select 1 from public.rtp_group_applications
    where email is not null and status in ('pending', 'changes_requested')
    group by lower(email)
    having count(*) > 1
  ) then
    execute 'create unique index if not exists rtp_applications_one_open_email on public.rtp_group_applications (lower(email)) where email is not null and status in (''pending'', ''changes_requested'')';
  end if;
  if not exists (
    select 1 from public.rtp_group_applications
    where user_id is not null and status in ('pending', 'changes_requested')
    group by user_id
    having count(*) > 1
  ) then
    execute 'create unique index if not exists rtp_applications_one_open_user on public.rtp_group_applications (user_id) where user_id is not null and status in (''pending'', ''changes_requested'')';
  end if;
end $$;

create or replace function rtp_private.guard_rtp_group_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin boolean;
begin
  if auth.uid() is null then
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

drop trigger if exists rtp_groups_guard_update on public.rtp_groups;
create trigger rtp_groups_guard_update
  before update on public.rtp_groups
  for each row execute function rtp_private.guard_rtp_group_update();

drop trigger if exists rtp_profiles_set_updated_at on public.rtp_profiles;
create trigger rtp_profiles_set_updated_at
  before update on public.rtp_profiles
  for each row execute function public.rtp_set_updated_at();

alter table public.rtp_profiles enable row level security;
alter table public.rtp_application_reviews enable row level security;
alter table public.rtp_location_changes enable row level security;

revoke all on public.rtp_profiles from anon, authenticated;
revoke all on public.rtp_application_reviews from anon, authenticated;
revoke all on public.rtp_location_changes from anon, authenticated;

grant select, insert, update on public.rtp_profiles to authenticated;
grant select, insert on public.rtp_application_reviews to authenticated;
grant select, insert on public.rtp_location_changes to authenticated;
grant update on public.rtp_location_changes to authenticated;

drop policy if exists "read own profile" on public.rtp_profiles;
create policy "read own profile"
  on public.rtp_profiles for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "admins read profiles" on public.rtp_profiles;
create policy "admins read profiles"
  on public.rtp_profiles for select to authenticated
  using (exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()));

drop policy if exists "insert own profile" on public.rtp_profiles;
create policy "insert own profile"
  on public.rtp_profiles for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "update own profile" on public.rtp_profiles;
create policy "update own profile"
  on public.rtp_profiles for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "admins read reviews" on public.rtp_application_reviews;
create policy "admins read reviews"
  on public.rtp_application_reviews for select to authenticated
  using (exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()));

drop policy if exists "admins insert reviews" on public.rtp_application_reviews;
create policy "admins insert reviews"
  on public.rtp_application_reviews for insert to authenticated
  with check (
    reviewer_id = auth.uid()
    and exists (select 1 from public.rtp_admins a where a.user_id = auth.uid())
  );

drop policy if exists "leaders read location changes" on public.rtp_location_changes;
create policy "leaders read location changes"
  on public.rtp_location_changes for select to authenticated
  using (
    exists (select 1 from public.rtp_groups g where g.id = group_id and g.leader_user_id = auth.uid())
    or exists (select 1 from public.rtp_admins a where a.user_id = auth.uid())
  );

drop policy if exists "leaders request location changes" on public.rtp_location_changes;
create policy "leaders request location changes"
  on public.rtp_location_changes for insert to authenticated
  with check (
    status = 'pending'
    and requested_by = auth.uid()
    and exists (select 1 from public.rtp_groups g where g.id = group_id and g.leader_user_id = auth.uid())
  );

drop policy if exists "admins update location changes" on public.rtp_location_changes;
create policy "admins update location changes"
  on public.rtp_location_changes for update to authenticated
  using (exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()));

drop policy if exists "applicants read own application" on public.rtp_group_applications;
create policy "applicants read own application"
  on public.rtp_group_applications for select to authenticated
  using (
    user_id = auth.uid()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "applicants update an open application" on public.rtp_group_applications;
create policy "applicants update an open application"
  on public.rtp_group_applications for update to authenticated
  using (user_id = auth.uid() and status in ('pending', 'changes_requested'))
  with check (
    user_id = auth.uid()
    and status = 'pending'
    and group_id is null
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "anyone can apply to start a group" on public.rtp_group_applications;
drop policy if exists "signed-in people can apply" on public.rtp_group_applications;
create policy "signed-in people can apply"
  on public.rtp_group_applications for insert to authenticated
  with check (
    status = 'pending'
    and group_id is null
    and user_id = auth.uid()
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and attended
    and faith_agreed
    and commitments_agreed
    and zoom_agreed
    and privacy_agreed
    and char_length(leader_name) between 1 and 120
    and char_length(coalesce(group_name, '')) between 1 and 120
    and char_length(city) between 1 and 80
    and char_length(country) between 1 and 80
    and char_length(meeting_location) between 1 and 200
  );

revoke insert on public.rtp_group_applications from anon;

do $$
begin
  if to_regclass('storage.objects') is not null then
    execute 'drop policy if exists "rtp photos are public" on storage.objects';
    execute 'drop policy if exists "rtp application photo upload" on storage.objects';
    execute 'drop policy if exists "rtp profile photo upload" on storage.objects';
    execute 'drop policy if exists "rtp users insert own photos" on storage.objects';
    execute 'drop policy if exists "rtp users update own photos" on storage.objects';
    execute 'drop policy if exists "rtp users delete own photos" on storage.objects';
    execute 'create policy "rtp photos are public" on storage.objects for select to anon, authenticated using (bucket_id = ''rtp-photos'')';
    execute 'create policy "rtp users insert own photos" on storage.objects for insert to authenticated with check (bucket_id = ''rtp-photos'' and (storage.foldername(name))[1] in (''profiles'', ''applications'') and (storage.foldername(name))[2] = (select auth.uid())::text)';
    execute 'create policy "rtp users update own photos" on storage.objects for update to authenticated using (bucket_id = ''rtp-photos'' and (storage.foldername(name))[1] in (''profiles'', ''applications'') and (storage.foldername(name))[2] = (select auth.uid())::text) with check (bucket_id = ''rtp-photos'' and (storage.foldername(name))[1] in (''profiles'', ''applications'') and (storage.foldername(name))[2] = (select auth.uid())::text)';
    execute 'create policy "rtp users delete own photos" on storage.objects for delete to authenticated using (bucket_id = ''rtp-photos'' and (storage.foldername(name))[1] in (''profiles'', ''applications'') and (storage.foldername(name))[2] = (select auth.uid())::text)';
  end if;
end $$;

notify pgrst, 'reload schema';
