import Link from "next/link";
import { AdminReview } from "@/components/admin/AdminReview";
import { DemoToggle } from "@/components/admin/DemoToggle";
import { loadAccount } from "@/lib/auth/account";
import { demoGroupsEnabled } from "@/lib/groups/demo";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AppAdminPage() {
  const account = await loadAccount();
  if (!account.configured || !account.user) return null;
  if (!account.admin) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Admin access needed</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#555]">Signed in as {account.user.email}. Signing up does not make an account an admin.</p>
      </section>
    );
  }
  const demoOn = await demoGroupsEnabled();
  const supabase = await createClient();
  const [{ data: applications }, { data: requests }, { data: groups }, { data: reviews }, { data: locationChanges }] = await Promise.all([
    supabase.from("rtp_group_applications").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("rtp_join_requests").select("id, first_name, phone, email, status, address_shared, created_at, group_id").order("created_at", { ascending: false }).limit(50),
    supabase.from("rtp_groups").select("id, name, city, status, public_location, leader_name").order("city").limit(100),
    supabase.from("rtp_application_reviews").select("id, application_id, action, note, message, created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("rtp_location_changes").select("id, group_id, public_location, private_address, status").eq("status", "pending").limit(50),
  ]);
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Review</h1>
        <Link href="/csv" className="inline-flex h-11 items-center text-sm font-semibold text-[#1976F3]">Leads</Link>
      </div>
      <DemoToggle initial={demoOn} />
      <AdminReview
        applications={applications ?? []}
        requests={requests ?? []}
        groups={groups ?? []}
        reviews={reviews ?? []}
        locationChanges={locationChanges ?? []}
      />
    </div>
  );
}
