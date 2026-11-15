-- Demo Mode switch for Read Talk Pray.
-- Paste this into the SQL editor for project eeeprmtermreavivzswn.
-- The Database dropdown must be the primary database, the one that already has public.rtp_groups.
-- Safe to run more than once. It does not delete groups, accounts, or applications.

create table if not exists public.rtp_settings (
  key text primary key,
  enabled boolean not null,
  updated_at timestamptz not null default now()
);

insert into public.rtp_settings (key, enabled)
values ('show_demo_groups', true)
on conflict (key) do nothing;

alter table public.rtp_settings enable row level security;

revoke all on public.rtp_settings from anon, authenticated;
grant select on public.rtp_settings to anon, authenticated;
grant insert, update on public.rtp_settings to authenticated;

drop policy if exists "anyone can read demo setting" on public.rtp_settings;
create policy "anyone can read demo setting"
  on public.rtp_settings for select
  to anon, authenticated
  using (key = 'show_demo_groups');

drop policy if exists "admins change demo setting" on public.rtp_settings;
create policy "admins change demo setting"
  on public.rtp_settings for update
  to authenticated
  using (key = 'show_demo_groups' and exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()))
  with check (key = 'show_demo_groups' and exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()));

drop policy if exists "admins insert demo setting" on public.rtp_settings;
create policy "admins insert demo setting"
  on public.rtp_settings for insert
  to authenticated
  with check (key = 'show_demo_groups' and exists (select 1 from public.rtp_admins a where a.user_id = auth.uid()));

notify pgrst, 'reload schema';
