"use client";

import { useEffect, useState } from "react";

const liveById = new Map<string, boolean>();
const listeners = new Map<string, Set<() => void>>();

function subscribe(id: string, listener: () => void) {
  const set = listeners.get(id) ?? new Set();
  set.add(listener);
  listeners.set(id, set);
  return () => {
    set.delete(listener);
  };
}

function readLive(id: string) {
  return liveById.get(id);
}

function writeLive(id: string, live: boolean) {
  liveById.set(id, live);
  listeners.get(id)?.forEach((listener) => listener());
}

export function LiveStatus({ live, label }: { live: boolean; label?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-sm font-semibold ${live ? "text-[#157a3a]" : "text-[#667085]"}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${live ? "animate-pulse bg-[#16A34A] motion-reduce:animate-none" : "bg-[#98a2b3]"}`} />
      {label ?? (live ? "Live" : "Paused")}
    </span>
  );
}

export function SyncedLiveStatus({ groupId, serverLive }: { groupId: string; serverLive: boolean }) {
  const [live, setLive] = useState(serverLive);
  useEffect(() => {
    const current = readLive(groupId);
    if (current === undefined) writeLive(groupId, serverLive);
    else setLive(current);
    return subscribe(groupId, () => {
      const next = readLive(groupId);
      if (next !== undefined) setLive(next);
    });
  }, [groupId, serverLive]);
  return <LiveStatus live={live} />;
}

export function GroupStatusToggle({ groupId, serverLive }: { groupId: string; serverLive: boolean }) {
  const [live, setLive] = useState(serverLive);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const current = readLive(groupId);
    if (current === undefined) writeLive(groupId, serverLive);
    else setLive(current);
    return subscribe(groupId, () => {
      const next = readLive(groupId);
      if (next !== undefined) setLive(next);
    });
  }, [groupId, serverLive]);

  async function choose(next: boolean) {
    if (pending || next === live) return;
    const previous = live;
    setError("");
    setSaved(false);
    setPending(true);
    writeLive(groupId, next);
    const response = await fetch("/api/leader", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: next ? "resume" : "pause", id: groupId }),
    });
    setPending(false);
    if (!response.ok) {
      writeLive(groupId, previous);
      setError("Couldn't update group. Try again.");
      return;
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <div className={`rounded-2xl px-3 py-3 ${live ? "bg-[#ECFDF3]" : "bg-[#f2f4f7]"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className={`flex items-center gap-2 text-sm font-semibold ${live ? "text-[#16A34A]" : "text-[#667085]"}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${live ? "animate-pulse bg-[#16A34A] motion-reduce:animate-none" : "bg-[#98a2b3]"}`} />
            {live ? "Group is Live" : "Group is Paused"}
          </p>
          <p className="mt-1 text-xs text-[#667085]">{live ? "Visible on the map and accepting new people" : "Hidden from new joiners"}</p>
        </div>
        <div className="relative grid h-11 w-40 shrink-0 grid-cols-2 rounded-full bg-white p-1" role="group" aria-label="Group visibility">
          <span
            aria-hidden
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-150 motion-reduce:transition-none ${live ? "left-[calc(50%)] bg-[#16A34A]" : "left-1 bg-[#667085]"}`}
          />
          <button type="button" disabled={pending} aria-pressed={!live} onClick={() => void choose(false)} className={`relative z-[1] rounded-full text-sm font-semibold ${live ? "text-[#667085]" : "text-white"}`}>Paused</button>
          <button type="button" disabled={pending} aria-pressed={live} onClick={() => void choose(true)} className={`relative z-[1] rounded-full text-sm font-semibold ${live ? "text-white" : "text-[#667085]"}`}>Live</button>
        </div>
      </div>
      {error ? <p className="mt-2 text-sm text-[#c2410c]">{error}</p> : null}
      {saved ? <p className="mt-2 text-xs font-semibold text-[#157a3a]">Saved</p> : null}
    </div>
  );
}
