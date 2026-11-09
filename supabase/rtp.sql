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
  leader_name text not null,
  leader_photo_url text,
  leader_user_id uuid references auth.users (id) on delete set null,
  status text not null default 'approved' check (status in ('pending', 'approved', 'rejected')),
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
  description text,
  leader_photo_url text,
  latitude double precision,
  longitude double precision,
  exact_latitude double precision,
  exact_longitude double precision,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
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

drop policy if exists "leaders update their group" on public.rtp_groups;
create policy "leaders update their group"
  on public.rtp_groups
  for update
  to authenticated
  using (leader_user_id = auth.uid() and status = 'approved')
  with check (leader_user_id = auth.uid() and status = 'approved');

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
    execute 'drop policy if exists "rtp photos are public" on storage.objects';
    execute 'create policy "rtp photos are public" on storage.objects for select to anon, authenticated using (bucket_id = ''rtp-photos'')';
    execute 'drop policy if exists "rtp application photo upload" on storage.objects';
    execute 'create policy "rtp application photo upload" on storage.objects for insert to anon, authenticated with check (bucket_id = ''rtp-photos'' and (storage.foldername(name))[1] = ''applications'')';
  end if;
end $$;

notify pgrst, 'reload schema';
