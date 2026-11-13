import { AppGroupList } from "@/components/app/AppGroupList";
import { listApprovedGroups } from "@/lib/groups/queries";

export const dynamic = "force-dynamic";

export default async function AppGroupsPage() {
  const groups = await listApprovedGroups();
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Groups</h1>
      <p className="mt-2 text-sm text-[#555]">Approved groups only. Pending applications stay off this list and off the public map.</p>
      <div className="mt-5">
        <AppGroupList groups={groups} />
      </div>
    </div>
  );
}
