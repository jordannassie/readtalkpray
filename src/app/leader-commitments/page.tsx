import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

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
        <p>Group leaders are called to live lives that reflect Jesus Christ.</p>
        <p>Leaders teach from Scripture, serve people, and stay accountable. Leadership is about serving people, not controlling them.</p>
        <p>Leaders must demonstrate biblical character, humility, integrity, sound doctrine, servant leadership, and faithfulness to Scripture.</p>
        <p>Leaders remain accountable to Scripture and, where they belong to one, to their local church. Local autonomy does not mean independence from biblical accountability.</p>
        <p>Leaders agree to join the monthly leader meeting.</p>
        <p>Leaders who persist in unrepentant sin, teach false doctrine, engage in serious misconduct, or reject biblical accountability may be removed from leadership and may no longer be recognized with Read Talk Pray.</p>
        <p className="text-sm text-[#666]">Scripture: 1 Timothy 3:1–7; Titus 1:5–9; 1 Peter 5:2–3; Matthew 18:15–17; 1 Timothy 5:19–21.</p>
      </main>
      <SiteFooter />
    </div>
  );
}
