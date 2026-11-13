import type { SupabaseClient, User } from "@supabase/supabase-js";

export async function claimLeaderGroups(supabase: SupabaseClient, user: User, isAdmin: boolean) {
  const email = user.email?.toLowerCase();
  if (!email) return;

  if (isAdmin) {
    const { data: leaders } = await supabase
      .from("rtp_group_leaders")
      .select("group_id, email")
      .is("user_id", null)
      .eq("is_primary", true);
    const ids = (leaders ?? [])
      .filter((row) => String(row.email ?? "").toLowerCase() === email)
      .map((row) => String(row.group_id));
    if (ids.length === 0) return;
    await supabase.from("rtp_groups").update({ leader_user_id: user.id }).in("id", ids).is("leader_user_id", null);
    await supabase.from("rtp_group_leaders").update({ user_id: user.id }).in("group_id", ids).is("user_id", null);
    return;
  }

  const { data: claimed } = await supabase
    .from("rtp_groups")
    .update({ leader_user_id: user.id })
    .is("leader_user_id", null)
    .eq("status", "approved")
    .select("id");
  const ids = (claimed ?? []).map((row) => String(row.id));
  if (ids.length > 0) {
    await supabase.from("rtp_group_leaders").update({ user_id: user.id }).in("group_id", ids).is("user_id", null);
  }
}
