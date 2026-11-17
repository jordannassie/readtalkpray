import { GroupFinder } from "@/components/home/GroupFinder";
import { demoGroups } from "@/lib/groups/demo";
import { listApprovedGroups } from "@/lib/groups/queries";

export const dynamic = "force-dynamic";

export default async function AppGroupsPage() {
  const groups = [...(await listApprovedGroups()), ...(await demoGroups())];
  return (
    <div className="-mt-5">
      <GroupFinder groups={groups} />
    </div>
  );
}
