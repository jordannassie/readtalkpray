import Link from "next/link";
import { AccountDashboard } from "@/components/account/AccountDashboard";
import { ProfilePhoto } from "@/components/account/ProfilePhoto";
import { loadAccount } from "@/lib/auth/account";
import { googleAvatar } from "@/lib/auth/profile";

export const dynamic = "force-dynamic";

export default async function AppHomePage() {
  const account = await loadAccount();
  if (!account.configured || !account.user) return null;
  const name = account.profile.full_name || "Welcome";
  return (
    <div>
      <div className="flex flex-col items-center px-2 pt-2 text-center">
        <ProfilePhoto
          userId={account.profile.user_id}
          name={account.profile.full_name}
          email={account.user.email ?? ""}
          photoUrl={account.profile.photo_url}
          googlePhotoUrl={googleAvatar(account.user)}
          fullName={account.profile.full_name}
          phone={account.profile.phone}
          size={144}
        />
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">{name}</h1>
        <p className="mt-1 text-sm text-[#667085]">Welcome. Read, talk, and pray with people near you.</p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link href="/app/groups" className="flex h-12 items-center justify-center rounded-full bg-[#1976F3] px-4 text-center text-sm font-semibold text-white">Find a Group</Link>
        <Link href="/app/start" className="flex h-12 items-center justify-center rounded-full bg-white px-4 text-center text-sm font-semibold text-[#1976F3] shadow-sm">Start a Group</Link>
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
