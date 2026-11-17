-- Owner-only Bible group training checklist.
-- Does not change groups, profiles, applications, or Sending Church data.
-- Safe to run more than once.

create table if not exists public.rtp_checklist (
  user_id uuid primary key references auth.users (id) on delete cascade,
  steps smallint not null default 0 check (steps between 0 and 63),
  updated_at timestamptz not null default now()
);

alter table public.rtp_checklist enable row level security;

revoke all on public.rtp_checklist from anon, authenticated;
grant select, insert, update on public.rtp_checklist to authenticated;

drop policy if exists "read own checklist" on public.rtp_checklist;
create policy "read own checklist"
  on public.rtp_checklist for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "insert own checklist" on public.rtp_checklist;
create policy "insert own checklist"
  on public.rtp_checklist for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "update own checklist" on public.rtp_checklist;
create policy "update own checklist"
  on public.rtp_checklist for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create or replace function public.rtp_delete_checklist()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.rtp_checklist where user_id = old.user_id;
  return old;
end;
$$;

revoke all on function public.rtp_delete_checklist() from public, anon, authenticated;

drop trigger if exists rtp_profiles_delete_checklist on public.rtp_profiles;
create trigger rtp_profiles_delete_checklist
  after delete on public.rtp_profiles
  for each row execute function public.rtp_delete_checklist();
