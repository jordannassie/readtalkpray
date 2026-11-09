-- Run in the Supabase SQL editor for eeeprmtermreavivzswn.
-- Creates the lead tables, keeps Row Level Security on, and does not
-- let anyone add themselves to sending_lead_admins.
-- /csv has no login, so the anon key may read, add, and update leads.
-- It cannot delete them.

create table if not exists public.sending_lead_admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.sending_lead_admins enable row level security;

grant select on public.sending_lead_admins to authenticated;

drop policy if exists "lead admins read their own row" on public.sending_lead_admins;
create policy "lead admins read their own row"
  on public.sending_lead_admins
  for select
  to authenticated
  using (user_id = auth.uid());

create table if not exists public.sending_leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sending_leads_phone_normalized_key unique (phone_normalized)
);

create or replace function public.sending_leads_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sending_leads_set_updated_at on public.sending_leads;
create trigger sending_leads_set_updated_at
  before update on public.sending_leads
  for each row
  execute function public.sending_leads_set_updated_at();

alter table public.sending_leads enable row level security;

grant select, insert, update on public.sending_leads to anon, authenticated;

drop policy if exists "csv page can read leads" on public.sending_leads;
create policy "csv page can read leads"
  on public.sending_leads
  for select
  to anon, authenticated
  using (true);

drop policy if exists "csv page can add leads" on public.sending_leads;
create policy "csv page can add leads"
  on public.sending_leads
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "csv page can update leads" on public.sending_leads;
create policy "csv page can update leads"
  on public.sending_leads
  for update
  to anon, authenticated
  using (true)
  with check (true);

-- Existing databases: drop the 10-digit checks and keep the CSV phone,
-- including a leading +, after removing only a leading "p:" and surrounding whitespace.
alter table public.sending_leads alter column imported_by drop not null;
alter table public.sending_leads drop constraint if exists sending_leads_valid_us_phone;
alter table public.sending_leads drop constraint if exists sending_leads_phone_normalized_check;
alter table public.sending_leads drop constraint if exists sending_leads_phone_normalized_key;
alter table public.sending_leads drop column if exists phone_normalized;
alter table public.sending_leads
  add column phone_normalized text generated always as (
    btrim(regexp_replace(btrim(phone), '^[Pp]:', ''))
  ) stored;
alter table public.sending_leads
  add constraint sending_leads_phone_normalized_key unique (phone_normalized);

alter table public.sending_leads add column if not exists first_name text;
alter table public.sending_leads add column if not exists last_name text;

-- Join leads are Sunday guests. Start leads want to begin a Bible study church.
-- The same phone may exist once in each category. Existing rows stay join.
alter table public.sending_leads add column if not exists category text not null default 'join';
alter table public.sending_leads drop constraint if exists sending_leads_category_check;
alter table public.sending_leads
  add constraint sending_leads_category_check check (category in ('join', 'start'));
alter table public.sending_leads add column if not exists location text;

alter table public.sending_leads drop constraint if exists sending_leads_phone_normalized_key;
alter table public.sending_leads drop constraint if exists sending_leads_phone_category_key;
alter table public.sending_leads
  add constraint sending_leads_phone_category_key unique (phone_normalized, category);

notify pgrst, 'reload schema';
