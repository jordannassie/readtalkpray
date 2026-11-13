import type { Metadata } from "next";
import Link from "next/link";
import { StartGroupForm } from "@/components/groups/StartGroupForm";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ensureProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Start a Group · Read Talk Pray",
  description: "Start a simple Read Talk Pray Bible study wherever you are.",
};

export default async function StartPage() {
  const supabase = isSupabaseConfigured() ? await createClient() : null;
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  const profile = user ? await ensureProfile(user) : null;
  const { data: applications } = user && supabase
    ? await supabase.from("rtp_group_applications").select("status, review_message").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1)
    : { data: [] };
  const application = applications?.[0] ?? null;

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-5 py-12">
        <h1 className="text-4xl font-semibold tracking-tight">Start a Group</h1>
        <p className="mt-3 text-[#555]">
          Meet any day, any time, anywhere. Most groups last about one hour. Share a few details and an administrator will review the group before it appears on the map.
        </p>
        <div className="mt-8">
          {user?.email ? (
            <StartGroupForm email={user.email} name={profile?.full_name ?? ""} application={application} />
          ) : (
            <div className="rounded-[28px] bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold tracking-tight">Sign in to start a group</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#555]">
                Google and email sign-in keep the application attached to your account. Google sign-in is limited to approved testers while it is in testing.
              </p>
              <Link href="/login?next=/start" className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#1976F3] px-5 text-sm font-semibold text-white">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
