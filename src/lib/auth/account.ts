import { cache } from "react";
import { claimLeaderGroups } from "@/lib/auth/claim";
import { getSessionAdmin } from "@/lib/auth/admin";
import { ensureProfile } from "@/lib/auth/profile";
import type { CoLeaderInvite } from "@/lib/groups/types";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const APPLICATION_COLUMNS = "id, status, review_message, group_name, leader_name, city, state, country, location_type, meeting_location, meeting_day, meeting_time, duration, timezone, description, leader_photo_url, latitude, longitude, exact_latitude, exact_longitude, phone, group_id, created_at";
const GROUP_COLUMNS = "id, name, description, public_location, meeting_day, meeting_time, duration, leader_name, leader_photo_url, leader_user_id, city, state, country, location_type, latitude, longitude, status";
const GROUP_COLUMNS_WITH_CO = `${GROUP_COLUMNS}, co_leader_name, co_leader_photo_url, groupme_url, slug`;

export const loadAccount = cache(async () => {
  if (!isSupabaseConfigured()) return { configured: false as const };
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { configured: true as const, user: null };
  const session = await getSessionAdmin();
  await claimLeaderGroups(supabase, data.user, session.admin);
  const profile = await ensureProfile(data.user);
  const [applications, ownedGroups, { data: leaderRows }] = await Promise.all([
    selectApplications(supabase, data.user.id),
    selectOwnGroups(supabase, data.user.id),
    supabase.from("rtp_group_leaders").select("group_id").eq("user_id", data.user.id).eq("is_primary", false),
  ]);
  const ownedIds = new Set((ownedGroups ?? []).map((group) => group.id));
  const coIds = (leaderRows ?? []).map((row) => row.group_id).filter((id) => !ownedIds.has(id));
  const coGroups = coIds.length ? await selectGroupsByIds(supabase, coIds) : [];
  const groups = [...(ownedGroups ?? []), ...coGroups];
  const email = data.user.email ?? "";
  const [{ data: sentInvites }, { data: receivedInvites }] = await Promise.all([
    supabase.from("rtp_co_leader_invites").select("id, application_id, group_id, invited_by, name, email, group_name, status, approved, accepted_by").eq("invited_by", data.user.id),
    email
      ? supabase.from("rtp_co_leader_invites").select("id, application_id, group_id, invited_by, name, email, group_name, status, approved, accepted_by").ilike("email", email)
      : Promise.resolve({ data: [] as CoLeaderInvite[] }),
  ]);
  const invites = dedupeInvites([...(sentInvites ?? []), ...(receivedInvites ?? [])]);
  const ids = groups.map((group) => group.id);
  const [{ data: requests }, { data: details }, { data: locationChanges }] = await Promise.all([
    ids.length
      ? supabase.from("rtp_join_requests").select("id, group_id, first_name, phone, email, status, created_at").in("group_id", ids).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    ids.length
      ? supabase.from("rtp_group_private").select("group_id, address").in("group_id", ids)
      : Promise.resolve({ data: [] }),
    ids.length
      ? supabase.from("rtp_location_changes").select("id, group_id, public_location, status, created_at").in("group_id", ids).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);
  return {
    configured: true as const,
    user: data.user,
    admin: session.admin,
    profile,
    applications: applications ?? [],
    groups: groups ?? [],
    requests: requests ?? [],
    details: details ?? [],
    locationChanges: locationChanges ?? [],
    invites,
  };
});

async function selectApplications(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const withCo = await supabase
    .from("rtp_group_applications")
    .select(`${APPLICATION_COLUMNS}, co_leader_name, co_leader_photo_url`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (!withCo.error) return withCo.data ?? [];
  if (!/co_leader/i.test(withCo.error.message)) return [];
  const plain = await supabase.from("rtp_group_applications").select(APPLICATION_COLUMNS).eq("user_id", userId).order("created_at", { ascending: false });
  return plain.data ?? [];
}

const GROUP_COLUMNS_WITH_EXTRAS = `${GROUP_COLUMNS}, co_leader_name, co_leader_photo_url, groupme_url`;

async function selectOwnGroups(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<any[]> {
  return selectGroupColumns((columns) => supabase.from("rtp_groups").select(columns).eq("leader_user_id", userId));
}

async function selectGroupsByIds(supabase: Awaited<ReturnType<typeof createClient>>, ids: string[]): Promise<any[]> {
  return selectGroupColumns((columns) => supabase.from("rtp_groups").select(columns).in("id", ids));
}

async function selectGroupColumns(
  run: (columns: string) => PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>,
) {
  for (const columns of [GROUP_COLUMNS_WITH_CO, GROUP_COLUMNS_WITH_EXTRAS, GROUP_COLUMNS]) {
    const result = await run(columns);
    if (!result.error) return (result.data ?? []) as any[];
    if (!/co_leader|groupme_url|slug/i.test(result.error.message)) return [];
  }
  return [];
}

function dedupeInvites(rows: CoLeaderInvite[]) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    if (!row?.id || seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  });
}
