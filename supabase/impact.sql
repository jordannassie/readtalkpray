-- Four ministry counters for an existing Bible group.
-- Safe to run more than once. Does not reset saved, baptized, or sent counts.
-- Replaces only the save function. The old function used its output names
-- (people_saved, people_baptized, people_sent) inside the update, and
-- Postgres rejects that as an ambiguous column. That is why +/- could not save.

create table if not exists public.rtp_group_impact (
  group_id uuid primary key references public.rtp_groups (id) on delete cascade,
  group_members integer not null default 0 check (group_members >= 0),
  people_saved integer not null default 0 check (people_saved >= 0),
  people_baptized integer not null default 0 check (people_baptized >= 0),
  people_sent integer not null default 0 check (people_sent >= 0),
  updated_at timestamptz not null default now()
);

alter table public.rtp_group_impact
  add column if not exists group_members integer not null default 0 check (group_members >= 0);

alter table public.rtp_group_impact enable row level security;

revoke all on public.rtp_group_impact from anon, authenticated;
grant select on public.rtp_group_impact to authenticated;

drop policy if exists "read own group impact" on public.rtp_group_impact;
create policy "read own group impact"
  on public.rtp_group_impact for select to authenticated
  using (
    exists (
      select 1 from public.rtp_groups as g
      where g.id = group_id
        and (
          g.leader_user_id = auth.uid()
          or exists (select 1 from public.rtp_admins as a where a.user_id = auth.uid())
        )
    )
  );

drop function if exists public.rtp_adjust_impact(uuid, text, integer);

create function public.rtp_adjust_impact(target uuid, metric text, delta integer)
returns table (
  group_members integer,
  people_saved integer,
  people_baptized integer,
  people_sent integer
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  allowed boolean;
begin
  if auth.uid() is null then
    raise exception 'not allowed';
  end if;
  if delta not in (-1, 1) or metric not in ('members', 'saved', 'baptized', 'sent') then
    raise exception 'invalid metric';
  end if;

  select exists (
    select 1
    from public.rtp_groups as g
    where g.id = target
      and g.status in ('approved', 'paused')
      and (
        g.leader_user_id = auth.uid()
        or exists (select 1 from public.rtp_admins as a where a.user_id = auth.uid())
      )
  ) into allowed;

  if not allowed then
    raise exception 'not allowed';
  end if;

  insert into public.rtp_group_impact (group_id)
  values (target)
  on conflict (group_id) do nothing;

  if metric = 'members' then
    update public.rtp_group_impact as impact
    set group_members = impact.group_members + delta,
        updated_at = now()
    where impact.group_id = target
      and impact.group_members + delta >= 0;
  elsif metric = 'saved' then
    update public.rtp_group_impact as impact
    set people_saved = impact.people_saved + delta,
        updated_at = now()
    where impact.group_id = target
      and impact.people_saved + delta >= 0;
  elsif metric = 'baptized' then
    update public.rtp_group_impact as impact
    set people_baptized = impact.people_baptized + delta,
        updated_at = now()
    where impact.group_id = target
      and impact.people_baptized + delta >= 0;
  else
    update public.rtp_group_impact as impact
    set people_sent = impact.people_sent + delta,
        updated_at = now()
    where impact.group_id = target
      and impact.people_sent + delta >= 0;
  end if;

  return query
  select impact.group_members, impact.people_saved, impact.people_baptized, impact.people_sent
  from public.rtp_group_impact as impact
  where impact.group_id = target;
end;
$$;

revoke all on function public.rtp_adjust_impact(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.rtp_adjust_impact(uuid, text, integer) to authenticated;

notify pgrst, 'reload schema';
