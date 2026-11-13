import { AccountDashboard } from "@/components/account/AccountDashboard";
import { loadAccount } from "@/lib/auth/account";

export const dynamic = "force-dynamic";

export default async function AppGroupPage() {
  const account = await loadAccount();
  if (!account.configured || !account.user) return null;
  return (
    <AccountDashboard
      focus="group"
      profile={account.profile}
      email={account.user.email ?? ""}
      isAdmin={account.admin}
      applications={account.applications}
      groups={account.groups}
      requests={account.requests}
      details={account.details}
      locationChanges={account.locationChanges}
    />
  );
}
