"use client";

import { useState } from "react";

export function DemoToggle({ initial, onChange }: { initial: boolean; onChange?: (enabled: boolean) => void }) {
  const [enabled, setEnabled] = useState(initial);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function toggle() {
    const next = !enabled;
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/demo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ enabled: next }),
    });
    const body = (await response.json()) as { ok?: boolean; error?: string };
    setBusy(false);
    if (!response.ok || !body.ok) {
      setMessage(body.error || "Demo groups did not change.");
      return;
    }
    setEnabled(next);
    onChange?.(next);
    setMessage(next ? "Demo Mode is on." : "Demo Mode is off. Real groups and accounts stay visible.");
  }

  return (
    <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Demo Mode</h2>
          <p className="mt-1 text-sm text-[#555]">Show or hide demo groups and demo accounts across the platform.</p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void toggle()}
          className={`inline-flex h-12 min-w-20 items-center justify-center rounded-full px-4 text-sm font-semibold text-white ${enabled ? "bg-[#1976F3]" : "bg-[#98a2b3]"}`}
        >
          {enabled ? "On" : "Off"}
        </button>
      </div>
      {message ? <p className="mt-3 text-sm">{message}</p> : null}
    </section>
  );
}
