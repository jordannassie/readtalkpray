import Link from "next/link";
import { AccountDashboard } from "@/components/account/AccountDashboard";
import { loadAccount } from "@/lib/auth/account";

export const dynamic = "force-dynamic";

export default async function AppHomePage() {
  const account = await loadAccount();
  if (!account.configured || !account.user) return null;
  return (
    <div>
      <p className="text-sm text-[#666]">Hello</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{account.profile.full_name || "Welcome"}</h1>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Link href="/app/groups" className="flex h-20 items-center justify-center rounded-3xl bg-[#1976F3] px-4 text-center text-sm font-semibold text-white">Find a group</Link>
        <Link href="/app/start" className="flex h-20 items-center justify-center rounded-3xl bg-white px-4 text-center text-sm font-semibold text-[#1976F3] shadow-sm">Start a group</Link>
      </div>
      <AccountDashboard
        focus="home"
        profile={account.profile}
        email={account.user.email ?? ""}
        isAdmin={account.admin}
        applications={account.applications}
        groups={account.groups}
        requests={account.requests}
        details={account.details}
        locationChanges={account.locationChanges}
      />
    </div>
  );
}
