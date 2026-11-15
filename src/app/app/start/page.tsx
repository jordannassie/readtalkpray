import { StartGroupForm } from "@/components/groups/StartGroupForm";
import { loadAccount } from "@/lib/auth/account";
import { googleAvatar } from "@/lib/auth/profile";

export const dynamic = "force-dynamic";

export default async function AppStartPage({
  searchParams,
}: {
  searchParams: Promise<{ application?: string }>;
}) {
  const account = await loadAccount();
  if (!account.configured || !account.user?.email) return null;
  const params = await searchParams;
  const application = params.application
    ? account.applications.find((item) => item.id === params.application) ?? null
    : null;
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">{application ? "Edit application" : "Start a Bible Group"}</h1>
      <p className="mt-2 text-sm leading-relaxed text-[#555]">{application ? "An admin reviews the application before the group appears on the map." : "Just a few details. We'll help you get started."}</p>
      <div className="mt-5">
        <StartGroupForm
          email={account.user.email}
          name={account.profile.full_name ?? ""}
          userId={account.profile.user_id}
          photoUrl={account.profile.photo_url}
          googlePhotoUrl={googleAvatar(account.user)}
          phone={account.profile.phone}
          application={application}
        />
      </div>
    </div>
  );
}
