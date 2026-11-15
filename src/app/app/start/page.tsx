import { redirect } from "next/navigation";
import { StartGroupForm } from "@/components/groups/StartGroupForm";
import { loadAccount } from "@/lib/auth/account";
import { googleAvatar } from "@/lib/auth/profile";
import { ownsGroup } from "@/lib/groups/ownership";

export const dynamic = "force-dynamic";

export default async function AppStartPage({
  searchParams,
}: {
  searchParams: Promise<{ application?: string; group?: string }>;
}) {
  const account = await loadAccount();
  if (!account.configured || !account.user?.email) return null;
  const params = await searchParams;
  const application = params.application
    ? account.applications.find((item) => item.id === params.application) ?? null
    : null;
  const published = account.groups.find((item) => item.id === (params.group || application?.group_id)) ?? null;
  const editing = Boolean(application || published);
  if (!editing && ownsGroup(account.applications, account.groups)) redirect("/app/group");
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">{editing ? "Edit Group" : "Start a Bible Group"}</h1>
      <p className="mt-2 text-sm leading-relaxed text-[#555]">{published ? "This updates the existing group." : application ? "This updates this application. It does not create another group." : "Just a few details. We'll help you get started."}</p>
      <div className="mt-5">
        <StartGroupForm
          email={account.user.email}
          name={account.profile.full_name ?? ""}
          userId={account.profile.user_id}
          photoUrl={account.profile.photo_url}
          googlePhotoUrl={googleAvatar(account.user)}
          phone={account.profile.phone}
          application={application}
          published={published && published.status !== "pending" && published.status !== "rejected" ? published : null}
        />
      </div>
    </div>
  );
}
