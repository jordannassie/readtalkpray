import { AccountDashboard } from "@/components/account/AccountDashboard";
import { loadAccount } from "@/lib/auth/account";
import { googleAvatar } from "@/lib/auth/profile";

export const dynamic = "force-dynamic";

export default async function AppGroupPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const account = await loadAccount();
  if (!account.configured || !account.user) return null;
  const params = await searchParams;
  return (
    <AccountDashboard
      focus="group"
      profile={account.profile}
      email={account.user.email ?? ""}
      googlePhotoUrl={googleAvatar(account.user)}
      isAdmin={account.admin}
      applications={account.applications}
      groups={account.groups}
      requests={account.requests}
      details={account.details}
      locationChanges={account.locationChanges}
      invites={account.invites}
      selectedId={params.id ?? ""}
    />
  );
}
