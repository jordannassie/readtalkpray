"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const NAV = [
  { href: "/#groups", label: "Groups Map" },
  { href: "/#how", label: "How It Works" },
  { href: "/start", label: "Start a Group" },
];

export function SiteHeader({ tone = "solid" }: { tone?: "solid" | "overlay" }) {
  const [open, setOpen] = useState(false);
  const overlay = tone === "overlay";
  const text = overlay ? "text-white" : "text-[#243]";
  const bar = overlay
    ? "absolute inset-x-0 top-0 z-20 bg-transparent"
    : "sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur";

  return (
    <header className={bar}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Logo invert={overlay} />
        <nav className={`hidden items-center gap-7 text-sm md:flex ${text}`}>
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:opacity-80">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/#join"
            className={`hidden rounded-full px-4 py-2 text-sm font-semibold md:inline-flex ${
              overlay ? "bg-white text-[#111]" : "bg-[var(--sending-blue)] text-white"
            }`}
          >
            Join a Group
          </Link>
          <button
            type="button"
            className={`rounded-full p-2 md:hidden ${text}`}
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open ? (
        <div className={`space-y-1 px-5 py-3 md:hidden ${overlay ? "bg-[#10203a]/95 text-white" : "border-t border-black/5 bg-white"}`}>
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="block py-2 text-sm" onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href="/#join" className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-[var(--sending-blue)] px-4 py-3 text-sm font-semibold text-white" onClick={() => setOpen(false)}>
            Join a Group
          </Link>
        </div>
      ) : null}
    </header>
  );
}
