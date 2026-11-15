-- Friendly public links for Bible groups. Internal ids stay the same.
-- Paste into project eeeprmtermreavivzswn, primary database.
-- Safe to run more than once. It does not delete groups.

alter table public.rtp_groups add column if not exists slug text;

create unique index if not exists rtp_groups_slug_unique on public.rtp_groups (slug);

do $$
declare
  row record;
  base text;
  candidate text;
  n int;
begin
  for row in
    select id, name
    from public.rtp_groups
    where slug is null
    order by created_at
  loop
    base := trim(both '-' from regexp_replace(lower(coalesce(row.name, 'bible group')), '[^a-z0-9]+', '-', 'g'));
    if base = '' then
      base := 'bible-group';
    end if;
    base := left(base, 60);
    candidate := base;
    n := 2;
    while exists (select 1 from public.rtp_groups where slug = candidate and id <> row.id) loop
      candidate := base || '-' || n;
      n := n + 1;
    end loop;
    update public.rtp_groups set slug = candidate where id = row.id and slug is null;
  end loop;
end $$;

create or replace function public.rtp_public_slug_state(target text)
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
  where slug = target;
$$;

revoke all on function public.rtp_public_slug_state(text) from public, anon, authenticated;
grant execute on function public.rtp_public_slug_state(text) to anon, authenticated;
