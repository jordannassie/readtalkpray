-- One Bible group per primary account.
-- Paste into project eeeprmtermreavivzswn, primary database.
-- This does not delete applications or groups.
-- If duplicates already exist, the index is skipped and the rows are listed for review.

do $$
declare
  app_dups int;
  group_dups int;
begin
  select count(*) into app_dups from (
    select user_id
    from public.rtp_group_applications
    where user_id is not null
      and status in ('pending', 'changes_requested', 'approved', 'suspended')
    group by user_id
    having count(*) > 1
  ) dups;

  select count(*) into group_dups from (
    select leader_user_id
    from public.rtp_groups
    where leader_user_id is not null
      and status in ('pending', 'approved', 'paused', 'suspended')
    group by leader_user_id
    having count(*) > 1
  ) dups;

  if app_dups = 0 then
    execute 'create unique index if not exists rtp_one_application_per_user on public.rtp_group_applications (user_id) where user_id is not null and status in (''pending'', ''changes_requested'', ''approved'', ''suspended'')';
  else
    raise notice 'Kept % users with more than one application. No rows were deleted.', app_dups;
  end if;

  if group_dups = 0 then
    execute 'create unique index if not exists rtp_one_group_per_leader on public.rtp_groups (leader_user_id) where leader_user_id is not null and status in (''pending'', ''approved'', ''paused'', ''suspended'')';
  else
    raise notice 'Kept % leaders with more than one group. No rows were deleted.', group_dups;
  end if;
end $$;
