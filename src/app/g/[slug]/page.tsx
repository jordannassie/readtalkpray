import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GroupLanding, PausedGroupPage } from "@/components/groups/GroupLanding";
import { groupLandingMetadata } from "@/lib/groups/landing";
import { getApprovedGroupBySlug, publicSlugState } from "@/lib/groups/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const group = await getApprovedGroupBySlug(slug);
  if (group) return groupLandingMetadata(group, `/g/${slug}`);
  if ((await publicSlugState(slug)) === "paused") return { title: "This group is paused · Read Talk Pray", robots: { index: false, follow: false } };
  return { title: "Group · Read Talk Pray", robots: { index: false, follow: false } };
}

export default async function FriendlyGroupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const group = await getApprovedGroupBySlug(slug);
  if (!group && (await publicSlugState(slug)) === "paused") return <PausedGroupPage />;
  if (!group) notFound();
  return <GroupLanding group={group} />;
}
