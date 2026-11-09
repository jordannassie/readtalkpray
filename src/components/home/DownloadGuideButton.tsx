"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { CHURCH_GUIDE_IMAGE } from "@/lib/demo/data";

export function DownloadGuideButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function downloadGuide() {
    if (busy) return;
    setBusy(true);
    setError("");

    try {
      const response = await fetch(CHURCH_GUIDE_IMAGE);
      if (!response.ok) throw new Error("download failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Sending-Church-Guide.jpg";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("The download didn’t start. Open the guide and print it from there.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={downloadGuide}
        disabled={busy}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--sending-blue)] px-5 text-sm font-medium text-white transition-colors hover:bg-[var(--sending-blue-hover)] active:bg-[var(--sending-blue-hover)] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {busy ? "Preparing…" : "Download to Print"}
        {busy ? null : <Download aria-hidden size={16} />}
      </button>
      <p className="mt-3 text-sm leading-relaxed text-[#666]">
        Print this off for your church members.
      </p>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-[#c2410c]">
          {error}{" "}
          <a
            href={CHURCH_GUIDE_IMAGE}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Open the guide
          </a>
        </p>
      ) : null}
    </div>
  );
}
