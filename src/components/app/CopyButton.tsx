"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

type Phase = "idle" | "copied" | "error";

export function useClipboardCopy() {
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    if (phase === "idle") return;
    const timer = window.setTimeout(() => setPhase("idle"), 1500);
    return () => window.clearTimeout(timer);
  }, [phase]);

  async function copy(value: string) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(value);
      setPhase("copied");
      return true;
    } catch {
      setPhase("error");
      return false;
    }
  }

  return { phase, copy };
}

export function CopyButton({
  value,
  idleLabel,
  successLabel = "Copied!",
  errorLabel = "Couldn't copy",
  variant = "text",
  className = "",
  share,
}: {
  value: string | (() => string);
  idleLabel: string;
  successLabel?: string;
  errorLabel?: string;
  variant?: "icon" | "text";
  className?: string;
  share?: { title: string; text: string; url: string } | (() => { title: string; text: string; url: string });
}) {
  const { phase, copy } = useClipboardCopy();
  const success = phase === "copied";
  const failed = phase === "error";
  const spoken = success ? successLabel : failed ? errorLabel : idleLabel;

  async function onClick() {
    if (share) {
      const payload = typeof share === "function" ? share() : share;
      if (typeof navigator.share === "function") {
        try {
          await navigator.share(payload);
        } catch {
          // The share sheet was dismissed. Do not claim the link was copied.
        }
        return;
      }
    }
    const text = typeof value === "function" ? value() : value;
    await copy(text);
  }

  if (variant === "icon") {
    return (
      <span className="relative grid h-11 w-11 shrink-0 place-items-center">
        <button
          type="button"
          onClick={() => void onClick()}
          aria-label={spoken}
          title={spoken}
          className={`relative grid h-11 w-11 place-items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1976F3] ${failed ? "text-[#b91c1c]" : "text-[#1976F3]"} ${className}`}
        >
          <Copy className={`motion-safe:transition motion-safe:duration-200 ${success ? "scale-75 opacity-0" : "scale-100 opacity-100"}`} size={16} aria-hidden />
          <span className="pointer-events-none absolute inset-0 grid place-items-center">
            <Check className={`text-[#16A34A] motion-safe:transition motion-safe:duration-200 ${success ? "scale-100 opacity-100" : "scale-75 opacity-0"}`} size={16} aria-hidden />
          </span>
        </button>
        <span className={`pointer-events-none absolute right-full top-1/2 -translate-y-1/2 pr-1 text-xs font-semibold whitespace-nowrap motion-safe:transition motion-safe:duration-200 ${success || failed ? "scale-100 opacity-100" : "scale-95 opacity-0"} ${success ? "text-[#16A34A]" : "text-[#b91c1c]"}`} aria-hidden>
          {success ? successLabel : failed ? errorLabel : ""}
        </span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void onClick()}
      aria-live="polite"
      className={`inline-flex h-11 items-center gap-1.5 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1976F3] ${className}`}
    >
      {success ? <Check size={16} className="text-[#16A34A] motion-safe:transition motion-safe:duration-200" aria-hidden /> : null}
      <span className={success ? "text-[#16A34A]" : failed ? "text-[#b91c1c]" : ""}>{spoken}</span>
    </button>
  );
}

export function PressLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      className="grid h-11 w-11 place-items-center rounded-full text-[#1976F3] transition-transform duration-150 active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1976F3]"
    >
      {children}
    </a>
  );
}
