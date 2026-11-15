import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GroupLanding, PausedGroupPage } from "@/components/groups/GroupLanding";
import { getApprovedGroupBySlug, publicSlugState } from "@/lib/groups/queries";
import { cityState } from "@/lib/groups/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const group = await getApprovedGroupBySlug(slug);
  if (!group) return { title: "Group · Read Talk Pray" };
  const description = `Read the Bible, talk about it, and pray together in ${cityState(group) || "your city"}.`;
  const url = `https://readtalkpray.com/g/${slug}`;
  return {
    title: `${group.name} | Read Talk Pray`,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${group.name} | Read Talk Pray`, description, url, siteName: "Read Talk Pray", type: "website" },
  };
}

export default async function FriendlyGroupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const group = await getApprovedGroupBySlug(slug);
  if (!group && (await publicSlugState(slug)) === "paused") return <PausedGroupPage />;
  if (!group) notFound();
  return <GroupLanding group={group} />;
}
