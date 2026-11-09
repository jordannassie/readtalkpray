import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminReview } from "@/components/admin/AdminReview";
import { adminSql, getSessionAdmin } from "@/lib/auth/admin";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Review groups · Read Talk Pray", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const session = await getSessionAdmin();
  if (!session.configured) {
    return <main className="mx-auto max-w-lg px-5 py-16">Supabase is not configured.</main>;
  }
  if (!session.user) redirect("/login?next=/admin");
  if (!session.admin) {
    return (
      <main className="mx-auto max-w-lg px-5 py-16">
        <h1 className="text-3xl font-semibold">Admin access needed</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#555]">
          Signed in as {session.user.email}. Add this account in Supabase, then refresh.
        </p>
        <pre className="mt-4 overflow-auto rounded-2xl bg-[#111] p-4 text-xs text-white">{adminSql(session.user.id)}</pre>
      </main>
    );
  }

  const supabase = await createClient();
  const [{ data: applications }, { data: requests }] = await Promise.all([
    supabase.from("rtp_group_applications").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("rtp_join_requests").select("id, first_name, phone, email, status, address_shared, created_at, group_id").order("created_at", { ascending: false }).limit(50),
  ]);

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">Review groups</h1>
          <Link href="/csv" className="text-sm font-medium text-[var(--sending-blue)]">Open leads</Link>
        </div>
        <AdminReview applications={applications ?? []} requests={requests ?? []} />
      </main>
    </div>
  );
}
