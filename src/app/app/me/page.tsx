import { AccountDashboard } from "@/components/account/AccountDashboard";
import { SignOutButton } from "@/components/account/SignOutButton";
import { loadAccount } from "@/lib/auth/account";

export const dynamic = "force-dynamic";

export default async function AppMePage() {
  const account = await loadAccount();
  if (!account.configured || !account.user) return null;
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Me</h1>
      <AccountDashboard
        focus="me"
        profile={account.profile}
        email={account.user.email ?? ""}
        isAdmin={account.admin}
        applications={account.applications}
        groups={account.groups}
        requests={account.requests}
        details={account.details}
        locationChanges={account.locationChanges}
      />
      <div className="mt-4">
        <SignOutButton className="inline-flex h-12 w-full items-center justify-center rounded-full border border-black/10 bg-white text-sm font-semibold" />
      </div>
    </div>
  );
}
