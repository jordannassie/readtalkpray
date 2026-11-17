import { createClient, createPublicClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { PUBLIC_GROUP_COLUMNS, type PublicGroup } from "./types";

const PUBLIC_GROUP_COLUMNS_WITH_CO_LEADER = `${PUBLIC_GROUP_COLUMNS}, co_leader_name, co_leader_photo_url, groupme_url`;
const PUBLIC_GROUP_COLUMNS_WITH_SLUG = `${PUBLIC_GROUP_COLUMNS_WITH_CO_LEADER}, slug`;

async function selectApproved(filter: { id?: string; slug?: string }) {
  const supabase = createPublicClient();
  const columns = [PUBLIC_GROUP_COLUMNS_WITH_SLUG, PUBLIC_GROUP_COLUMNS_WITH_CO_LEADER, PUBLIC_GROUP_COLUMNS];
  for (const columnList of columns) {
    let query = supabase.from("rtp_groups").select(columnList).eq("status", "approved");
    if (filter.id) query = query.eq("id", filter.id);
    else if (filter.slug) query = query.eq("slug", filter.slug);
    else query = query.order("city", { ascending: true });
    const { data, error } = filter.id || filter.slug ? await query.maybeSingle() : await query;
    if (!error) return data as PublicGroup | PublicGroup[] | null;
    if (!/co_leader|groupme_url|slug/i.test(error.message)) return null;
  }
  return null;
}

async function publicMemberCounts() {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("rtp_public_member_counts").select("group_id, group_members");
  const counts = new Map<string, number>();
  if (error || !data) return counts;
  for (const row of data) {
    const value = Number(row.group_members);
    if (row.group_id && Number.isFinite(value)) counts.set(row.group_id, Math.max(0, Math.floor(value)));
  }
  return counts;
}

function withMemberCounts(groups: PublicGroup[], counts: Map<string, number>) {
  return groups.map((group) => {
    if (group.is_demo || !counts.has(group.id)) return group;
    return { ...group, members: counts.get(group.id) };
  });
}

export async function listApprovedGroups(): Promise<PublicGroup[]> {
  if (!isSupabaseConfigured()) return [];
  const data = await selectApproved({});
  const groups = Array.isArray(data) ? data : [];
  if (!groups.length) return [];
  return withMemberCounts(groups, await publicMemberCounts());
}

async function withOneMemberCount(group: PublicGroup | null) {
  if (!group || group.is_demo) return group;
  const counts = await publicMemberCounts();
  return counts.has(group.id) ? { ...group, members: counts.get(group.id) } : group;
}

export async function getApprovedGroupBySlug(slug: string): Promise<PublicGroup | null> {
  if (!isSupabaseConfigured() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  const data = await selectApproved({ slug });
  return withOneMemberCount(data && !Array.isArray(data) ? data : null);
}

export async function getApprovedGroup(id: string): Promise<PublicGroup | null> {
  if (!isSupabaseConfigured()) return null;
  const data = await selectApproved({ id });
  return withOneMemberCount(data && !Array.isArray(data) ? data : null);
}

export async function publicSlugState(slug: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("rtp_public_slug_state", { target: slug });
  if (error || typeof data !== "string") return null;
  return data === "live" || data === "paused" ? data : "hidden";
}

export async function publicGroupState(id: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("rtp_public_group_state", { target: id });
  if (error || typeof data !== "string") return null;
  return data === "live" || data === "paused" ? data : "hidden";
}
