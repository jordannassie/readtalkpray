import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LeadTracker } from "@/components/leads/LeadTracker";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { adminSql, getSessionAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Leads · Read Talk Pray",
  robots: { index: false, follow: false },
};

export default async function CsvPage() {
  const session = await getSessionAdmin();
  if (!session.configured) {
    return (
      <main className="mx-auto max-w-lg px-5 py-16">
        <h1 className="text-3xl font-semibold">Leads are not configured</h1>
        <p className="mt-3 text-sm text-[#666]">Add the Supabase URL and anon key.</p>
      </main>
    );
  }
  if (!session.user) redirect("/login?next=/csv");
  if (!session.admin) {
    return (
      <main className="mx-auto max-w-lg px-5 py-16">
        <h1 className="text-3xl font-semibold">Admin access needed</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#555]">
          Signed in as {session.user.email}. Lead phone numbers stay hidden until this account is an admin.
        </p>
        <pre className="mt-4 overflow-auto rounded-2xl bg-[#111] p-4 text-xs text-white">{adminSql(session.user.id)}</pre>
      </main>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="bg-[#fafafa] px-5 py-8">
        <LeadTracker />
      </main>
    </>
  );
}
