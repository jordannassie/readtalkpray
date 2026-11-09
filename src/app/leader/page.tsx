import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LeaderHome } from "@/components/leader/LeaderHome";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your group · Read Talk Pray", robots: { index: false, follow: false } };

export default async function LeaderPage() {
  if (!isSupabaseConfigured()) {
    return <main className="mx-auto max-w-lg px-5 py-16">Supabase is not configured.</main>;
  }
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login?next=/leader");

  await supabase
    .from("rtp_groups")
    .update({ leader_user_id: data.user.id })
    .is("leader_user_id", null)
    .eq("status", "approved");

  const { data: groups } = await supabase
    .from("rtp_groups")
    .select("id, name, description, public_location, meeting_day, meeting_time, leader_name, city")
    .eq("leader_user_id", data.user.id);

  const ids = (groups ?? []).map((group) => group.id);
  if (ids.length > 0) {
    await supabase.from("rtp_group_leaders").update({ user_id: data.user.id }).in("group_id", ids).is("user_id", null);
  }

  const [{ data: requests }, { data: details }] = await Promise.all([
    ids.length
      ? supabase.from("rtp_join_requests").select("id, group_id, first_name, phone, email, status, address_shared").in("group_id", ids).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    ids.length
      ? supabase.from("rtp_group_private").select("group_id, address, leader_email").in("group_id", ids)
      : Promise.resolve({ data: [] }),
  ]);

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Your group</h1>
        <p className="mt-2 text-sm text-[#666]">Signed in as {data.user.email}</p>
        <LeaderHome groups={groups ?? []} requests={requests ?? []} details={details ?? []} />
      </main>
    </div>
  );
}
