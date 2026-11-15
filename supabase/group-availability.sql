-- Lets a public group link say "paused" without exposing the address or leader contact.
-- Paste into project eeeprmtermreavivzswn, primary database.
-- Safe to run more than once. It does not change group rows.

create or replace function public.rtp_public_group_state(target uuid)
returns text
language sql
security definer
set search_path = public
as $$
  select case
    when status = 'approved' then 'live'
    when status = 'paused' then 'paused'
    else 'hidden'
  end
  from public.rtp_groups
  where id = target;
$$;

revoke all on function public.rtp_public_group_state(uuid) from public, anon, authenticated;
grant execute on function public.rtp_public_group_state(uuid) to anon, authenticated;
