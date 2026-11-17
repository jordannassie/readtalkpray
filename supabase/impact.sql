-- Group ministry counters. Does not change existing group rows or Sending Church data.
-- Safe to run more than once. Counts stay when a group is paused or edited.

create table if not exists public.rtp_group_impact (
  group_id uuid primary key references public.rtp_groups (id) on delete cascade,
  people_saved integer not null default 0 check (people_saved >= 0),
  people_baptized integer not null default 0 check (people_baptized >= 0),
  people_sent integer not null default 0 check (people_sent >= 0),
  updated_at timestamptz not null default now()
);

alter table public.rtp_group_impact enable row level security;

revoke all on public.rtp_group_impact from anon, authenticated;
grant select on public.rtp_group_impact to authenticated;

drop policy if exists "read own group impact" on public.rtp_group_impact;
create policy "read own group impact"
  on public.rtp_group_impact for select to authenticated
  using (
    exists (
      select 1 from public.rtp_groups g
      where g.id = group_id
        and (
          g.leader_user_id = auth.uid()
          or exists (select 1 from public.rtp_admins a where a.user_id = auth.uid())
        )
    )
  );

create or replace function public.rtp_adjust_impact(target uuid, metric text, delta integer)
returns table (people_saved integer, people_baptized integer, people_sent integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed boolean;
begin
  if auth.uid() is null then
    raise exception 'not allowed';
  end if;
  if delta not in (-1, 1) or metric not in ('saved', 'baptized', 'sent') then
    raise exception 'invalid';
  end if;

  select exists (
    select 1
    from public.rtp_groups g
    where g.id = target
      and g.status in ('approved', 'paused')
      and (
        g.leader_user_id = auth.uid()
        or exists (select 1 from public.rtp_admins a where a.user_id = auth.uid())
      )
  ) into allowed;

  if not allowed then
    raise exception 'not allowed';
  end if;

  insert into public.rtp_group_impact (group_id)
  values (target)
  on conflict (group_id) do nothing;

  if metric = 'saved' then
    update public.rtp_group_impact
    set people_saved = people_saved + delta, updated_at = now()
    where group_id = target and people_saved + delta >= 0;
  elsif metric = 'baptized' then
    update public.rtp_group_impact
    set people_baptized = people_baptized + delta, updated_at = now()
    where group_id = target and people_baptized + delta >= 0;
  else
    update public.rtp_group_impact
    set people_sent = people_sent + delta, updated_at = now()
    where group_id = target and people_sent + delta >= 0;
  end if;

  return query
  select i.people_saved, i.people_baptized, i.people_sent
  from public.rtp_group_impact i
  where i.group_id = target;
end;
$$;

revoke all on function public.rtp_adjust_impact(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.rtp_adjust_impact(uuid, text, integer) to authenticated;
