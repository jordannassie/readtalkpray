import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { GroupLanding, PausedGroupPage } from "@/components/groups/GroupLanding";
import { getDemoGroup } from "@/lib/groups/demo";
import { groupLandingMetadata } from "@/lib/groups/landing";
import { getApprovedGroup, publicGroupState } from "@/lib/groups/queries";
import { isUuid } from "@/lib/groups/text";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const group = (await getDemoGroup(id)) ?? (isUuid(id) ? await getApprovedGroup(id) : null);
  if (!group) {
    if (isUuid(id) && (await publicGroupState(id)) === "paused") return { title: "This group is paused · Read Talk Pray", robots: { index: false, follow: false } };
    return { title: "Group · Read Talk Pray", robots: { index: false, follow: false } };
  }
  return groupLandingMetadata(group, group.slug ? `/g/${group.slug}` : `/groups/${id}`);
}

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const demo = await getDemoGroup(id);
  const group = demo ?? (isUuid(id) ? await getApprovedGroup(id) : null);
  if (group?.slug && !demo) redirect(`/g/${group.slug}`);
  if (!group && isUuid(id) && (await publicGroupState(id)) === "paused") return <PausedGroupPage />;
  if (!group) notFound();
  return <GroupLanding group={group} />;
}
