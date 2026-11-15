import Link from "next/link";
import { AdminDemoBar } from "@/components/admin/AdminDemoBar";
import { AdminReview } from "@/components/admin/AdminReview";
import { loadAccount } from "@/lib/auth/account";
import { demoAccounts, demoGroupsEnabled } from "@/lib/groups/demo";
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
    .select("id, leader_name, email, phone, city, state, country, location_type, meeting_location, meeting_day, meeting_time, duration, timezone, description, leader_photo_url, co_leader_name, co_leader_photo_url, group_name, status, faith_agreed, commitments_agreed, privacy_agreed, created_at", { count: "exact" })
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
  const groupStatus = filter === "suspended" ? "suspended" : filter === "all" ? null : "approved";
  let groupsQuery = supabase
    .from("rtp_groups")
    .select("id, name, city, state, country, status, public_location, address, location_type, latitude, longitude, meeting_day, meeting_time, description, leader_name, leader_photo_url, co_leader_name, co_leader_photo_url", { count: "exact" })
    .order("city");
  if (groupStatus === "approved") groupsQuery = groupsQuery.in("status", ["approved", "paused"]);
  else if (groupStatus) groupsQuery = groupsQuery.eq("status", groupStatus);
  if (query) {
    const pattern = `"%${query.replace(/"/g, "")}%"`;
    const { data: emailMatches } = await supabase.from("rtp_group_applications").select("group_id").ilike("email", `%${query}%`).limit(50);
    const emailIds = (emailMatches ?? []).map((item) => item.group_id).filter((id): id is string => Boolean(id));
    const clauses = ["name", "leader_name", "city"].map((column) => `${column}.ilike.${pattern}`);
    if (emailIds.length) clauses.push(`id.in.(${emailIds.join(",")})`);
    groupsQuery = groupsQuery.or(clauses.join(","));
  }
  const [
    { data: applications, count: applicationCount },
    { count: pendingCount },
    { count: approvedCount },
    { count: suspendedCount },
    { count: leaderCount },
    { count: interestedCount },
    { data: requests },
    { data: groups, count: groupCount },
    { data: locationChanges },
  ] = await Promise.all([
    applicationsQuery.range(from, from + PAGE_SIZE - 1),
    supabase.from("rtp_group_applications").select("id", { count: "exact", head: true }).in("status", ["pending", "changes_requested"]),
    supabase.from("rtp_groups").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("rtp_groups").select("id", { count: "exact", head: true }).eq("status", "suspended"),
    supabase.from("rtp_groups").select("id", { count: "exact", head: true }).eq("status", "approved").not("leader_name", "is", null),
    supabase.from("rtp_join_requests").select("id", { count: "exact", head: true }),
    supabase.from("rtp_join_requests").select("id, first_name, phone, email, status, address_shared, group_id").order("created_at", { ascending: false }).limit(PAGE_SIZE),
    groupsQuery.range(from, from + PAGE_SIZE - 1),
    supabase.from("rtp_location_changes").select("id, group_id, public_location, private_address, status").eq("status", "pending").limit(PAGE_SIZE),
  ]);
  const groupIds = (groups ?? []).map((item) => item.id);
  const { data: contacts } = groupIds.length
    ? await supabase.from("rtp_group_private").select("group_id, leader_email, leader_phone").in("group_id", groupIds)
    : { data: [] };
  const contactByGroup = new Map((contacts ?? []).map((item) => [item.group_id, item]));
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
      <AdminDemoBar initial={demoOn} demoAccounts={demoAccounts()} />
      <AdminReview
        applications={applications ?? []}
        requests={requests ?? []}
        groups={(groups ?? []).map((group) => ({
          ...group,
          leader_email: contactByGroup.get(group.id)?.leader_email ?? null,
          leader_phone: contactByGroup.get(group.id)?.leader_phone ?? null,
        }))}
        groupTotal={groupCount ?? 0}
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
