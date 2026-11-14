import Link from "next/link";
import { AdminReview } from "@/components/admin/AdminReview";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { DemoToggle } from "@/components/admin/DemoToggle";
import { loadAccount } from "@/lib/auth/account";
import { demoGroupsEnabled } from "@/lib/groups/demo";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AppAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
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
  const params = await searchParams;
  const filter = params.status === "approved" || params.status === "suspended" || params.status === "all" ? params.status : "pending";
  const query = (params.q ?? "").trim().replace(/[%_,]/g, " ").slice(0, 80);
  const page = Math.max(1, Number(params.page) || 1);
  const demoOn = await demoGroupsEnabled();
  const supabase = await createClient();
  let applicationsQuery = supabase
    .from("rtp_group_applications")
    .select("id, leader_name, email, phone, city, state, country, location_type, meeting_location, meeting_day, meeting_time, duration, timezone, description, leader_photo_url, group_name, status, faith_agreed, commitments_agreed, privacy_agreed, created_at", { count: "exact" })
    .order("created_at", { ascending: false });
  if (filter === "pending") applicationsQuery = applicationsQuery.in("status", ["pending", "changes_requested"]);
  else if (filter !== "all") applicationsQuery = applicationsQuery.eq("status", filter);
  if (query) {
    const pattern = `"%${query.replace(/"/g, "")}%"`;
    applicationsQuery = applicationsQuery.or(
      ["group_name", "leader_name", "email", "city"].map((column) => `${column}.ilike.${pattern}`).join(","),
    );
  }
  const from = (page - 1) * PAGE_SIZE;
  const [
    { data: applications, count: applicationCount },
    { count: pendingCount },
    { count: approvedCount },
    { count: suspendedCount },
    { count: leaderCount },
    { count: interestedCount },
    { data: requests },
    { data: groups },
    { data: locationChanges },
  ] = await Promise.all([
    applicationsQuery.range(from, from + PAGE_SIZE - 1),
    supabase.from("rtp_group_applications").select("id", { count: "exact", head: true }).in("status", ["pending", "changes_requested"]),
    supabase.from("rtp_groups").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("rtp_groups").select("id", { count: "exact", head: true }).eq("status", "suspended"),
    supabase.from("rtp_groups").select("id", { count: "exact", head: true }).eq("status", "approved").not("leader_name", "is", null),
    supabase.from("rtp_join_requests").select("id", { count: "exact", head: true }),
    supabase.from("rtp_join_requests").select("id, first_name, phone, email, status, address_shared, group_id").order("created_at", { ascending: false }).limit(PAGE_SIZE),
    supabase.from("rtp_groups").select("id, name, city, status, public_location, leader_name").order("city").limit(PAGE_SIZE),
    supabase.from("rtp_location_changes").select("id, group_id, public_location, private_address, status").eq("status", "pending").limit(PAGE_SIZE),
  ]);
  const ids = (applications ?? []).map((item) => item.id);
  const { data: reviews } = ids.length
    ? await supabase.from("rtp_application_reviews").select("id, application_id, action, note, message, created_at").in("application_id", ids).order("created_at", { ascending: false })
    : { data: [] };
  const total = applicationCount ?? 0;
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Review</h1>
        <Link href="/csv" className="inline-flex h-11 items-center text-sm font-semibold text-[#1976F3]">Leads</Link>
      </div>
      <DemoToggle initial={demoOn} />
      <AdminUsers />
      <AdminReview
        applications={applications ?? []}
        requests={requests ?? []}
        groups={groups ?? []}
        reviews={reviews ?? []}
        locationChanges={locationChanges ?? []}
        counts={{
          pending: pendingCount ?? 0,
          approved: approvedCount ?? 0,
          active: approvedCount ?? 0,
          leaders: leaderCount ?? 0,
          interested: interestedCount ?? 0,
          suspended: suspendedCount ?? 0,
        }}
        filter={filter}
        query={query}
        page={page}
        pageCount={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        total={total}
      />
    </div>
  );
}
