import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JoinGroupForm } from "@/components/groups/JoinGroupForm";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getDemoGroup } from "@/lib/groups/demo";
import { getApprovedGroup, publicGroupState } from "@/lib/groups/queries";
import { isUuid } from "@/lib/groups/text";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const group = (await getDemoGroup(id)) ?? (isUuid(id) ? await getApprovedGroup(id) : null);
  return { title: group ? `${group.name} · Read Talk Pray` : "Group · Read Talk Pray" };
}

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = (await getDemoGroup(id)) ?? (isUuid(id) ? await getApprovedGroup(id) : null);
  if (!group && isUuid(id) && (await publicGroupState(id)) === "paused") {
    return (
      <div className="min-h-screen bg-black text-white">
        <SiteHeader />
        <main className="mx-auto flex max-w-xl flex-col items-center px-5 py-16 text-center">
          <p className="text-4xl font-semibold tracking-tight">This group is paused.</p>
          <p className="mt-3 text-lg text-white/70">It is not meeting publicly right now. Check back later, or find another group.</p>
        </main>
        <SiteFooter />
      </div>
    );
  }
  if (!group) notFound();

  return (
    <div className="min-h-screen bg-black text-white">
      <SiteHeader />
      <main className="mx-auto flex max-w-xl flex-col items-center px-5 py-12">
        <p className="text-center text-5xl font-semibold tracking-tight sm:text-6xl">Join a group.</p>
        <p className="mt-3 text-center text-lg text-white/70">Any day. Any time. Anywhere.</p>
        <div className="mt-8 w-full">
          <JoinGroupForm group={group} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
