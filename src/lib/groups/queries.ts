import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { PUBLIC_GROUP_COLUMNS, type PublicGroup } from "./types";

export async function listApprovedGroups(): Promise<PublicGroup[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rtp_groups")
    .select(PUBLIC_GROUP_COLUMNS)
    .eq("status", "approved")
    .order("city", { ascending: true });
  if (error || !data) return [];
  return data as PublicGroup[];
}

export async function getApprovedGroup(id: string): Promise<PublicGroup | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rtp_groups")
    .select(PUBLIC_GROUP_COLUMNS)
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();
  if (error || !data) return null;
  return data as PublicGroup;
}
