import { StartGroupForm } from "@/components/groups/StartGroupForm";
import { loadAccount } from "@/lib/auth/account";

export const dynamic = "force-dynamic";

export default async function AppStartPage() {
  const account = await loadAccount();
  if (!account.configured || !account.user?.email) return null;
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Start a group</h1>
      <p className="mt-2 text-sm leading-relaxed text-[#555]">An admin reviews the application before the group appears on the map.</p>
      <div className="mt-5">
        <StartGroupForm
          email={account.user.email}
          name={account.profile.full_name ?? ""}
          application={account.applications[0] ?? null}
        />
      </div>
    </div>
  );
}
