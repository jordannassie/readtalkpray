import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LEADER_COMMITMENTS, LEADER_COMMITMENT_SCRIPTURE } from "@/lib/groups/commitments";

export const metadata: Metadata = {
  title: "Leader Commitments · Read Talk Pray",
  description: "What a Read Talk Pray group leader agrees to do.",
};

export default function LeaderCommitmentsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-4 px-5 py-14 text-base leading-relaxed text-[#1c1c1c]">
        <h1 className="text-4xl font-semibold tracking-tight">Leader Commitments</h1>
        {LEADER_COMMITMENTS.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <p className="text-sm text-[#666]">{LEADER_COMMITMENT_SCRIPTURE}</p>
      </main>
      <SiteFooter />
    </div>
  );
}
