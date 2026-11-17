import { createClient } from "@/lib/supabase/server";

export type ImpactCounts = { saved: number; baptized: number; sent: number };

export const EMPTY_IMPACT: ImpactCounts = { saved: 0, baptized: 0, sent: 0 };

export function impactCounts(row: { people_saved?: number; people_baptized?: number; people_sent?: number } | null): ImpactCounts {
  return {
    saved: Math.max(0, Number(row?.people_saved ?? 0) || 0),
    baptized: Math.max(0, Number(row?.people_baptized ?? 0) || 0),
    sent: Math.max(0, Number(row?.people_sent ?? 0) || 0),
  };
}

export async function loadImpact(groupId: string): Promise<ImpactCounts> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("rtp_group_impact").select("people_saved, people_baptized, people_sent").eq("group_id", groupId).maybeSingle();
    if (error || !data) return EMPTY_IMPACT;
    return impactCounts(data);
  } catch {
    return EMPTY_IMPACT;
  }
}
