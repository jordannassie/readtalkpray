"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { DEMO_CHURCH } from "@/lib/demo/data";

const METRICS = [
  ["Current Team", DEMO_CHURCH.team],
  ["People Reached", DEMO_CHURCH.reached],
  ["Baptized", DEMO_CHURCH.baptized],
  ["Trained", DEMO_CHURCH.trained],
  ["Sent", DEMO_CHURCH.sent],
] as const;

export default function MyChurchPage() {
  return (
    <DashboardShell>
      <p className="text-sm text-[#777]">My Church</p>
      <h1 className="mt-1 text-4xl font-semibold tracking-tight">{DEMO_CHURCH.city}</h1>
      <p className="mt-3 text-sm text-[#777]">
        Leader: {DEMO_CHURCH.leader} · {DEMO_CHURCH.meeting}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {METRICS.map(([label, value]) => (
          <div key={label} className="rounded-[24px] border border-[#eee] bg-white p-5">
            <p className="text-sm text-[#888]">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
