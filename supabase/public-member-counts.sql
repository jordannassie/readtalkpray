-- Public aggregate Group Members counts for approved groups only.
-- Safe to run more than once. Does not change saved, baptized, or sent counts.
-- Does not replace the leader save function.
-- Anon can read group_id and group_members for approved groups. Names and phones stay private.

alter table public.rtp_group_impact
  add column if not exists group_members integer not null default 0 check (group_members >= 0);

create or replace view public.rtp_public_member_counts
with (security_invoker = false, security_barrier = true) as
select impact.group_id, impact.group_members
from public.rtp_group_impact as impact
join public.rtp_groups as groups on groups.id = impact.group_id
where groups.status = 'approved'
  and impact.group_members >= 0;

revoke all on public.rtp_public_member_counts from public, anon, authenticated;
grant select on public.rtp_public_member_counts to anon, authenticated;

notify pgrst, 'reload schema';
