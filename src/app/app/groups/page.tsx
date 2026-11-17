import { GroupFinder } from "@/components/home/GroupFinder";
import { loadAccount } from "@/lib/auth/account";
import { demoGroups, demoGroupsEnabled } from "@/lib/groups/demo";
import { listApprovedGroups } from "@/lib/groups/queries";

export const dynamic = "force-dynamic";

export default async function AppGroupsPage() {
  const account = await loadAccount();
  const samples = Boolean("admin" in account && account.admin && (await demoGroupsEnabled()));
  const groups = [...(samples ? await demoGroups() : []), ...(await listApprovedGroups())];
  return (
    <div className="-mt-5">
      <GroupFinder groups={groups} samplePreview={samples} />
    </div>
  );
}
