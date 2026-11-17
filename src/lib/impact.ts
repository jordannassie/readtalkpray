import { createClient } from "@/lib/supabase/server";

export type ImpactCounts = { members: number; saved: number; baptized: number; sent: number };

export const EMPTY_IMPACT: ImpactCounts = { members: 0, saved: 0, baptized: 0, sent: 0 };

const COUNT_COLUMNS = "group_members, people_saved, people_baptized, people_sent";

export function impactCounts(row: { group_members?: number; people_saved?: number; people_baptized?: number; people_sent?: number } | null): ImpactCounts {
  const count = (value: number | undefined) => Math.max(0, Number(value ?? 0) || 0);
  return {
    members: count(row?.group_members),
    saved: count(row?.people_saved),
    baptized: count(row?.people_baptized),
    sent: count(row?.people_sent),
  };
}

export function impactSaveFailure(message: string) {
  if (/not allowed/i.test(message)) return { status: 403, error: "Only this group's leader can change these counts." };
  if (/ambiguous/i.test(message)) return { status: 503, error: "The save function still needs the database update. Run the new SQL, then try again." };
  if (/invalid metric|group_members|schema cache|could not find the function/i.test(message)) {
    return { status: 503, error: "Group Members is not in the database yet. Run the new SQL, then try again." };
  }
  if (/permission denied/i.test(message)) return { status: 403, error: "This account cannot change these counts." };
  const detail = message.replace(/\s+/g, " ").trim().slice(0, 140);
  return { status: 503, error: detail || "The count could not be saved." };
}

export async function loadImpact(groupId: string): Promise<ImpactCounts> {
  try {
    const supabase = await createClient();
    const full = await supabase.from("rtp_group_impact").select(COUNT_COLUMNS).eq("group_id", groupId).maybeSingle();
    if (!full.error) return impactCounts(full.data);
    if (!/group_members/i.test(full.error.message)) return EMPTY_IMPACT;
    const legacy = await supabase.from("rtp_group_impact").select("people_saved, people_baptized, people_sent").eq("group_id", groupId).maybeSingle();
    if (legacy.error || !legacy.data) return EMPTY_IMPACT;
    return impactCounts(legacy.data);
  } catch {
    return EMPTY_IMPACT;
  }
}
