import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { PUBLIC_GROUP_COLUMNS, type PublicGroup } from "./types";

const PUBLIC_GROUP_COLUMNS_WITH_CO_LEADER = `${PUBLIC_GROUP_COLUMNS}, co_leader_name, co_leader_photo_url, groupme_url`;

async function selectApproved(filter: { id?: string }) {
  const supabase = await createClient();
  const columns = [PUBLIC_GROUP_COLUMNS_WITH_CO_LEADER, PUBLIC_GROUP_COLUMNS];
  for (const columnList of columns) {
    let query = supabase.from("rtp_groups").select(columnList).eq("status", "approved");
    query = filter.id ? query.eq("id", filter.id) : query.order("city", { ascending: true });
    const { data, error } = filter.id ? await query.maybeSingle() : await query;
    if (!error) return data as PublicGroup | PublicGroup[] | null;
    if (!/co_leader|groupme_url/i.test(error.message)) return null;
  }
  return null;
}

export async function listApprovedGroups(): Promise<PublicGroup[]> {
  if (!isSupabaseConfigured()) return [];
  const data = await selectApproved({});
  return Array.isArray(data) ? data : [];
}

export async function getApprovedGroup(id: string): Promise<PublicGroup | null> {
  if (!isSupabaseConfigured()) return null;
  const data = await selectApproved({ id });
  return data && !Array.isArray(data) ? data : null;
}

export async function publicGroupState(id: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("rtp_public_group_state", { target: id });
  if (error || typeof data !== "string") return null;
  return data === "live" || data === "paused" ? data : "hidden";
}
