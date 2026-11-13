import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const sql = readFileSync(new URL("../supabase/rtp.sql", import.meta.url), "utf8");
const db = new PGlite();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function asRole(role, statement) {
  await db.exec("begin");
  await db.exec(`set local role ${role}`);
  try {
    const result = await db.query(statement);
    await db.exec("commit");
    return result;
  } catch (error) {
    await db.exec("rollback");
    throw error;
  }
}

await db.exec(`
  create schema if not exists auth;
  create table if not exists auth.users (
    id uuid primary key,
    email text
  );
  create or replace function auth.uid()
  returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  create or replace function auth.jwt()
  returns jsonb language sql stable as $$
    select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
  $$;
  do $$ begin
    if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon; end if;
    if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated; end if;
  end $$;
  create table if not exists public.sending_leads (id int primary key);
  insert into public.sending_leads (id) values (1) on conflict do nothing;
`);

await db.exec(sql);

const tables = await db.query(`
  select relname, relrowsecurity
  from pg_class
  where relname like 'rtp_%' and relkind = 'r'
`);
const names = tables.rows.map((row) => row.relname);
for (const name of [
  "rtp_admins",
  "rtp_groups",
  "rtp_group_leaders",
  "rtp_group_private",
  "rtp_group_applications",
  "rtp_join_requests",
  "rtp_leads",
  "rtp_profiles",
  "rtp_application_reviews",
  "rtp_location_changes",
]) {
  assert(names.includes(name), `missing ${name}`);
}
assert(tables.rows.every((row) => row.relrowsecurity), "RLS is off on an rtp table");
const sending = await db.query("select count(*)::int as count from public.sending_leads");
assert(sending.rows[0].count === 1, "sending_leads was modified");

const adminId = "11111111-1111-4111-8111-111111111111";
const leaderId = "22222222-2222-4222-8222-222222222222";
const strangerId = "33333333-3333-4333-8333-333333333333";
await db.exec(`
  insert into auth.users (id, email) values
    ('${adminId}', 'admin@example.com'),
    ('${leaderId}', 'ada@example.com'),
    ('${strangerId}', 'stranger@example.com');
`);
await db.query(`
  insert into public.rtp_leads (full_name, first_name, phone, category, source)
  values ('Ada', 'Ada', '+15555550123', 'join', 'test')
`);

let anonBlocked = false;
try {
  await asRole("anon", "select count(*)::int as count from public.rtp_leads");
} catch (error) {
  anonBlocked = /permission denied/i.test(String(error));
}
assert(anonBlocked, "anon can read leads");

let privateDenied = false;
try {
  await asRole("anon", "select * from public.rtp_group_private");
} catch (error) {
  privateDenied = /permission denied/i.test(String(error));
}
assert(privateDenied, "anon can read private group details");

await db.exec(`select set_config('request.jwt.claim.sub', '${adminId}', false)`);
await db.exec(`select set_config('request.jwt.claims', '{"email":"admin@example.com"}', false)`);
await db.query(`insert into public.rtp_admins (user_id) values ('${adminId}')`);

const group = await db.query(`
  insert into public.rtp_groups (
    name, city, state, country, location_type, public_location,
    latitude, longitude, meeting_day, meeting_time, leader_name, status
  ) values (
    'East Nashville Group', 'Nashville', 'TN', 'USA', 'home', 'Nashville, TN area',
    36.16, -86.78, 'Sunday', '10:00 AM', 'Ada', 'approved'
  )
  returning id
`);
const groupId = group.rows[0].id;
await db.exec(`
  insert into public.rtp_group_leaders (group_id, name, email, phone, is_primary)
  values ('${groupId}', 'Ada', 'ada@example.com', '+15555550111', true);
  insert into public.rtp_group_private (group_id, address, leader_email, leader_phone)
  values ('${groupId}', '123 Hidden Lane', 'ada@example.com', '+15555550111');
`);

const publicRow = await asRole("anon", `select address from public.rtp_groups where id = '${groupId}'`);
assert(publicRow.rows[0].address === null, "home address was published");

await db.exec(`select set_config('request.jwt.claim.sub', '${leaderId}', false)`);
await db.exec(`select set_config('request.jwt.claims', '{"email":"ada@example.com"}', false)`);
await asRole("authenticated", `update public.rtp_groups set leader_user_id = '${leaderId}' where id = '${groupId}'`);
await asRole("authenticated", `update public.rtp_group_leaders set user_id = '${leaderId}' where group_id = '${groupId}'`);
const claimed = await db.query(`select leader_user_id::text as leader from public.rtp_groups where id = '${groupId}'`);
assert(claimed.rows[0].leader === leaderId, "leader could not claim the group");

await asRole("authenticated", `update public.rtp_groups set public_location = '123 Hidden Lane' where id = '${groupId}'`);
const kept = await db.query(`select public_location from public.rtp_groups where id = '${groupId}'`);
assert(kept.rows[0].public_location === "Nashville, TN area", "leader changed the public location");
await asRole("authenticated", `update public.rtp_groups set status = 'paused' where id = '${groupId}'`);
const hidden = await asRole("anon", `select id from public.rtp_groups where id = '${groupId}'`);
assert(hidden.rows.length === 0, "paused group is public");
await asRole("authenticated", `update public.rtp_groups set status = 'approved' where id = '${groupId}'`);

await db.exec(`select set_config('request.jwt.claim.sub', '${strangerId}', false)`);
await db.exec(`select set_config('request.jwt.claims', '{"email":"stranger@example.com"}', false)`);
const stolen = await asRole("authenticated", `select address from public.rtp_group_private where group_id = '${groupId}'`);
assert(stolen.rows.length === 0, "stranger could read the exact address");
const address = await db.query("select address from public.rtp_group_private");
assert(address.rows[0].address === "123 Hidden Lane", "private address changed");

await db.exec(`select set_config('request.jwt.claim.sub', '', false)`);
await db.exec(`select set_config('request.jwt.claims', '{}', false)`);
await asRole("anon", `insert into public.rtp_join_requests (group_id, first_name, phone) values ('${groupId}', 'Sam', '+15555550999')`);
let duplicateBlocked = false;
try {
  await asRole("anon", `insert into public.rtp_join_requests (group_id, first_name, phone) values ('${groupId}', 'Sam', '+15555550999')`);
} catch (error) {
  duplicateBlocked = /duplicate|unique/i.test(String(error));
}
assert(duplicateBlocked, "duplicate join request was saved");

console.log("rtp.sql passed local checks");
await db.close();
