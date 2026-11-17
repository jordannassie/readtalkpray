"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus, Send, UserPlus, Waves } from "lucide-react";
import type { ImpactCounts } from "@/lib/impact";

const METRICS = [
  { key: "saved", label: "People Saved", icon: UserPlus, card: "bg-[#e7f1ff] text-[#1976F3]" },
  { key: "baptized", label: "People Baptized", icon: Waves, card: "bg-[#e5f8fb] text-[#0891b2]" },
  { key: "sent", label: "People Sent", icon: Send, card: "bg-[#f3e8ff] text-[#7c3aed]" },
] as const;

type Metric = (typeof METRICS)[number]["key"];

export function ImpactCounters({ groupId, initial }: { groupId: string; initial: ImpactCounts }) {
  const [counts, setCounts] = useState(initial);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState(false);
  const confirmed = useRef(initial);
  const generation = useRef(0);
  const inflight = useRef(0);

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
    const current = counts[metric];
    if (delta < 0 && current <= 0) return;
    const id = ++generation.current;
    inflight.current += 1;
    setError(false);
    setNotice("");
    setCounts((value) => ({ ...value, [metric]: Math.max(0, value[metric] + delta) }));
    try {
      const response = await fetch("/api/impact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ groupId, metric, delta }),
      });
      const body = (await response.json()) as { ok?: boolean; counts?: ImpactCounts };
      if (response.ok && body.counts) {
        confirmed.current = body.counts;
        if (id === generation.current) {
          setCounts(body.counts);
          setNotice("Saved");
          window.setTimeout(() => setNotice((value) => (value === "Saved" ? "" : value)), 1200);
        }
        return;
      }
    } catch {
      // The request failed. The latest click restores the last saved counts.
    } finally {
      inflight.current = Math.max(0, inflight.current - 1);
    }
    if (id === generation.current) {
      generation.current = 0;
      setCounts(confirmed.current);
      setError(true);
    }
  }

  return (
    <section className="mt-5 rounded-[28px] bg-white p-3 shadow-sm sm:p-4" aria-label="Ministry impact">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {METRICS.map((metric) => {
          const Icon = metric.icon;
          const value = counts[metric.key];
          return (
            <div key={metric.key} className={`rounded-3xl px-2 py-4 text-center sm:px-4 ${metric.card}`}>
              <Icon className="mx-auto" size={22} aria-hidden />
              <p className="mt-2 text-xs font-semibold text-[#142033] sm:text-sm">{metric.label}</p>
              <div className="mt-3 flex items-center justify-center gap-1 sm:gap-2">
                <button
                  type="button"
                  aria-label={`Decrease ${metric.label}`}
                  disabled={value <= 0}
                  onClick={() => void adjust(metric.key, -1)}
                  className="grid h-11 w-9 place-items-center rounded-full bg-white/80 text-[#142033] shadow-sm motion-safe:transition motion-safe:duration-150 active:scale-95 disabled:opacity-40 motion-reduce:active:scale-100 sm:w-11"
                >
                  <Minus size={16} aria-hidden />
                </button>
                <span key={`${metric.key}-${value}`} className="rtp-count min-w-[1.6ch] text-3xl font-semibold text-[#142033] tabular-nums sm:text-4xl">{value}</span>
                <button
                  type="button"
                  aria-label={`Increase ${metric.label}`}
                  onClick={() => void adjust(metric.key, 1)}
                  className="grid h-11 w-9 place-items-center rounded-full bg-white/80 text-[#142033] shadow-sm motion-safe:transition motion-safe:duration-150 active:scale-95 motion-reduce:active:scale-100 sm:w-11"
                >
                  <Plus size={16} aria-hidden />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {notice ? <p className="mt-2 text-center text-xs font-semibold text-[#16A34A]">{notice}</p> : null}
      {error ? <p className="mt-2 text-center text-xs text-[#b91c1c]">Couldn&apos;t save that count. Try again.</p> : null}
    </section>
  );
}
