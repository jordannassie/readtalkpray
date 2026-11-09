"use client";

import { BookOpen } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { TRAINING } from "@/lib/demo/data";

const GROUPS = [
  { key: "SAVE", items: TRAINING.SAVE },
  { key: "TRAIN", items: TRAINING.TRAIN },
  { key: "SEND", items: TRAINING.SEND },
] as const;

export default function TrainingPage() {
  return (
    <DashboardShell>
      <p className="text-sm text-[#777]">Training</p>
      <h1 className="mt-1 text-4xl font-semibold tracking-tight">Learn the model.</h1>
      <p className="mt-3 max-w-xl text-sm text-[#777]">
        Demo lessons only. Save. Train. Send.
      </p>

      <div className="mt-8 space-y-8">
        {GROUPS.map((group) => (
          <section key={group.key}>
            <h2 className="text-sm font-medium tracking-[0.18em] uppercase text-[var(--sending-blue)]">
              {group.key}
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {group.items.map((title) => (
                <article
                  key={title}
                  className="rounded-[24px] border border-[#eee] bg-white p-5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--sending-blue-light)] text-[var(--sending-blue)]">
                    <BookOpen size={18} />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight">{title}</h3>
                  <p className="mt-2 text-sm text-[#777]">Demo card. Coming soon.</p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </DashboardShell>
  );
}
