-- Public Group Members counts for approved groups only.
-- Paste into project eeeprmtermreavivzswn, primary database:
-- https://supabase.com/dashboard/project/eeeprmtermreavivzswn/sql/new
-- Safe to run more than once. Does not change saved, baptized, or sent counts.
-- Does not replace rtp_adjust_impact. Does not grant anon access to the impact table.

alter table public.rtp_group_impact
  add column if not exists group_members integer not null default 0 check (group_members >= 0);

create or replace view public.rtp_public_member_counts
with (security_invoker = false, security_barrier = true) as
select
  groups.id as group_id,
  coalesce(impact.group_members, 0) as group_members
from public.rtp_groups as groups
left join public.rtp_group_impact as impact on impact.group_id = groups.id
where groups.status = 'approved'
  and coalesce(impact.group_members, 0) >= 0;

alter view public.rtp_public_member_counts set (security_invoker = false, security_barrier = true);

revoke all on public.rtp_public_member_counts from public, anon, authenticated;
grant select on public.rtp_public_member_counts to anon, authenticated;

notify pgrst, 'reload schema';
