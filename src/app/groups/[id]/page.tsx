import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { SHARE_IMAGE } from "@/components/brand/logos";
import { GroupLanding, PausedGroupPage } from "@/components/groups/GroupLanding";
import { getApprovedGroup, publicGroupState } from "@/lib/groups/queries";
import { cityState } from "@/lib/groups/types";
import { isUuid } from "@/lib/groups/text";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const group = isUuid(id) ? await getApprovedGroup(id) : null;
  if (!group) return { title: "Group · Read Talk Pray" };
  const description = `Read the Bible, talk about it, and pray together in ${cityState(group) || "your city"}.`;
  const canonical = group.slug ? `https://readtalkpray.com/g/${group.slug}` : undefined;
  return {
    title: `${group.name} | Read Talk Pray`,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: { title: `${group.name} | Read Talk Pray`, description, url: canonical, siteName: "Read Talk Pray", type: "website", images: [{ url: SHARE_IMAGE, width: 1080, height: 1080, alt: "Read Talk Pray" }] },
  };
}

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = isUuid(id) ? await getApprovedGroup(id) : null;
  if (group?.slug) redirect(`/g/${group.slug}`);
  if (!group && isUuid(id) && (await publicGroupState(id)) === "paused") return <PausedGroupPage />;
  if (!group) notFound();
  return <GroupLanding group={group} />;
}
