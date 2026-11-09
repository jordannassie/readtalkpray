"use client";

import { ArrowRight } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/Button";
import { START_CHECKLIST, START_FLOW } from "@/lib/demo/data";
import { useDemoAuth } from "@/lib/demo/auth";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

function StartContent({ ctaHref }: { ctaHref: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm text-[#777]">Start a Church</p>
      <h1 className="mt-1 text-4xl font-semibold tracking-tight">Start With Two.</h1>
      <p className="mt-4 text-base leading-relaxed text-[#666]">
        You do not need a building, stage, staff, or large crowd. Find one other
        person. Meet anywhere. Follow the 60-minute Sending Church format. Then
        multiply.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        {START_FLOW.map((item, index) => (
          <div key={item} className="flex items-center gap-3">
            <span className="rounded-full border border-[#eee] bg-white px-4 py-2 text-sm font-medium">
              {item}
            </span>
            {index < START_FLOW.length - 1 ? (
              <ArrowRight size={16} className="text-[var(--sending-blue)]" />
            ) : null}
          </div>
        ))}
      </div>
      <ol className="mt-8 space-y-3">
        {START_CHECKLIST.map((item, index) => (
          <li key={item} className="flex items-start gap-3 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--sending-blue-light)] text-xs font-semibold text-[var(--sending-blue)]">
              {index + 1}
            </span>
            <span className="pt-0.5">{item}</span>
          </li>
        ))}
      </ol>
      <div className="mt-8">
        <Button href={ctaHref}>
          Start My Sending Church
          <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
}

export default function StartAChurchPage() {
  const { user, ready } = useDemoAuth();

  if (!ready) {
    return null;
  }

  if (user) {
    return (
      <DashboardShell>
        <StartContent ctaHref="/login" />
      </DashboardShell>
    );
  }

  return (
    <div className="bg-white">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-16">
        <StartContent ctaHref="/login" />
      </main>
      <SiteFooter />
    </div>
  );
}
