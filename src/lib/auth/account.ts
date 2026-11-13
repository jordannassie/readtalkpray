import { cache } from "react";
import { claimLeaderGroups } from "@/lib/auth/claim";
import { getSessionAdmin } from "@/lib/auth/admin";
import { ensureProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const loadAccount = cache(async () => {
  if (!isSupabaseConfigured()) return { configured: false as const };
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { configured: true as const, user: null };
  const session = await getSessionAdmin();
  await claimLeaderGroups(supabase, data.user, session.admin);
  const profile = await ensureProfile(data.user);
  const [{ data: applications }, { data: groups }] = await Promise.all([
    supabase
      .from("rtp_group_applications")
      .select("id, status, review_message, group_name, city, created_at")
      .eq("user_id", data.user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("rtp_groups")
      .select("id, name, description, public_location, meeting_day, meeting_time, leader_name, city, status")
      .eq("leader_user_id", data.user.id),
  ]);
  const ids = (groups ?? []).map((group) => group.id);
  const [{ data: requests }, { data: details }, { data: locationChanges }] = await Promise.all([
    ids.length
      ? supabase.from("rtp_join_requests").select("id, group_id, first_name, phone, status, created_at").in("group_id", ids).order("created_at", { ascending: false })
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
  };
});
