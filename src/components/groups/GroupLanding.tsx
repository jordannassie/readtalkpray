import { JoinGroupForm } from "@/components/groups/JoinGroupForm";
import { GroupLandingMap } from "@/components/groups/GroupLandingMap";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { cityState } from "@/lib/groups/types";
import type { PublicGroup } from "@/lib/groups/types";

export function GroupLanding({ group }: { group: PublicGroup }) {
  return (
    <div className="min-h-screen bg-[#F4F7FC] text-[#111]">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-4xl font-semibold tracking-tight text-[#142033] sm:text-5xl">Join Our Group.</h1>
        <p className="mt-2 text-lg text-[#52627a]">Read the Bible. Talk about it. Pray together.</p>
        <div className="mt-6 grid items-start gap-4 lg:grid-cols-2">
          <div className="order-2 h-[320px] overflow-hidden rounded-[28px] border border-[#e6ebf2] bg-white lg:order-1 lg:h-[680px]">
            <GroupLandingMap group={group} />
          </div>
          <div className="order-1 rounded-[28px] border border-[#e6ebf2] bg-white p-6 shadow-sm sm:p-8 lg:order-2">
            <JoinGroupForm group={group} variant="panel" />
          </div>
        </div>
        <p className="mt-4 text-sm text-[#6d7b90]">{cityState(group) ? `Meeting near ${cityState(group)}.` : "A neighborhood Bible group."}</p>
      </main>
      <SiteFooter />
    </div>
  );
}

export function PausedGroupPage() {
  return (
    <div className="min-h-screen bg-[#F4F7FC] text-[#111]">
      <SiteHeader />
      <main className="mx-auto flex max-w-xl flex-col items-center px-5 py-20 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">This group is paused.</h1>
        <p className="mt-3 text-lg text-[#52627a]">It is not meeting publicly right now. Check back later, or find another group.</p>
      </main>
      <SiteFooter />
    </div>
  );
}
