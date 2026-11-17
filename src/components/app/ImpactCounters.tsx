"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Minus, Plus, Send, UserPlus, Users, Waves } from "lucide-react";
import type { ImpactCounts } from "@/lib/impact";
import { publishMemberCount } from "@/lib/member-sync";

const METRICS = [
  { key: "members", label: "Group Members", icon: Users, card: "bg-[#e8f1ff]", iconClass: "text-[#1976F3]" },
  { key: "saved", label: "People Saved", icon: UserPlus, card: "bg-[#e8f8ea]", iconClass: "text-[#16a34a]" },
  { key: "baptized", label: "People Baptized", icon: Waves, card: "bg-[#e5f8fb]", iconClass: "text-[#0891b2]" },
  { key: "sent", label: "People Sent", icon: Send, card: "bg-[#fff3df]", iconClass: "text-[#e07a12]" },
] as const;

type Metric = (typeof METRICS)[number]["key"];

export function ImpactCounters({ groupId, initial }: { groupId: string; initial: ImpactCounts }) {
  const [counts, setCounts] = useState(initial);
  const [savedKey, setSavedKey] = useState<Metric | null>(null);
  const [reason, setReason] = useState("");
  const confirmed = useRef(initial);
  const countsRef = useRef(initial);
  const generation = useRef(0);
  const inflight = useRef(0);
  countsRef.current = counts;

  useEffect(() => {
    publishMemberCount(groupId, counts.members);
  }, [groupId, counts.members]);

  useEffect(() => {
    function refresh() {
      if (inflight.current > 0) return;
      void fetch(`/api/impact?groupId=${groupId}`)
        .then((response) => response.json())
        .then((body: { ok?: boolean; counts?: ImpactCounts }) => {
          if (!body.ok || !body.counts || inflight.current > 0) return;
          confirmed.current = body.counts;
          setCounts(body.counts);
        })
        .catch(() => undefined);
    }
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [groupId]);

  async function adjust(metric: Metric, delta: 1 | -1) {
    if (delta < 0 && countsRef.current[metric] <= 0) return;
    const id = ++generation.current;
    const next = { ...countsRef.current, [metric]: Math.max(0, countsRef.current[metric] + delta) };
    countsRef.current = next;
    inflight.current += 1;
    setReason("");
    setSavedKey(null);
    setCounts(next);
    let errorMessage = "";
    try {
      const response = await fetch("/api/impact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ groupId, metric, delta }),
      });
      const body = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !body.ok) errorMessage = body.error || "The count could not be saved.";
    } catch {
      errorMessage = "The count could not be saved.";
    } finally {
      inflight.current = Math.max(0, inflight.current - 1);
      if (inflight.current === 0) {
        try {
          const response = await fetch(`/api/impact?groupId=${groupId}`);
          const body = (await response.json()) as { ok?: boolean; counts?: ImpactCounts };
          if (inflight.current === 0 && response.ok && body.ok && body.counts) {
            confirmed.current = body.counts;
            countsRef.current = body.counts;
            setCounts(body.counts);
            if (id === generation.current) {
              setReason(errorMessage);
              if (!errorMessage) {
                setSavedKey(metric);
                window.setTimeout(() => setSavedKey((value) => (value === metric ? null : value)), 1200);
              }
            }
            return;
          }
        } catch {
          errorMessage = errorMessage || "The count could not be saved.";
        }
        if (id === generation.current) {
          countsRef.current = confirmed.current;
          setCounts(confirmed.current);
          setReason(errorMessage || "The count could not be saved.");
        }
      }
    }
  }

  return (
    <section className="mt-5 rounded-[28px] bg-white p-3 shadow-sm sm:p-4" aria-label="Ministry impact">
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        {METRICS.map((metric) => {
          const Icon = metric.icon;
          const value = counts[metric.key];
          const saved = savedKey === metric.key;
          return (
            <div key={metric.key} className={`rounded-3xl px-2 py-4 text-center sm:px-3 ${metric.card}`}>
              <Icon className={`mx-auto ${metric.iconClass}`} size={22} aria-hidden />
              <p className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-[#142033] sm:text-sm">
                {metric.label}
                {saved ? <Check size={14} className="text-[#16A34A]" aria-hidden /> : null}
              </p>
              <div className="mt-3 flex items-center justify-center gap-1 sm:gap-2">
                <button
                  type="button"
                  aria-label={`Decrease ${metric.label}`}
                  disabled={value <= 0}
                  onClick={() => void adjust(metric.key, -1)}
                  className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#142033] shadow-sm motion-safe:transition motion-safe:duration-150 active:scale-95 disabled:opacity-40 motion-reduce:active:scale-100"
                >
                  <Minus size={16} aria-hidden />
                </button>
                <span key={`${metric.key}-${value}`} className="rtp-count min-w-[1.6ch] text-3xl font-semibold text-[#142033] tabular-nums">{value}</span>
                <button
                  type="button"
                  aria-label={`Increase ${metric.label}`}
                  onClick={() => void adjust(metric.key, 1)}
                  className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#142033] shadow-sm motion-safe:transition motion-safe:duration-150 active:scale-95 motion-reduce:active:scale-100"
                >
                  <Plus size={16} aria-hidden />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <p aria-live="polite" className={reason ? "mt-2 text-center text-xs text-[#b91c1c]" : "sr-only"}>
        {reason || (savedKey ? "Saved" : "")}
      </p>
    </section>
  );
}
