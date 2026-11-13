"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BLACK_LOGO } from "@/components/brand/logos";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const LEFT = [
  { href: "/#groups", label: "Groups Map" },
  { href: "/#how", label: "How It Works" },
];

const START = { href: "/app/start", label: "Start a Group" };

export function SiteHeader({ activeHref }: { tone?: "solid" | "overlay" | "light"; activeHref?: string }) {
  const [open, setOpen] = useState(false);
  const [accountHref, setAccountHref] = useState("/login");

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      setAccountHref(data.user ? "/app" : "/login");
    });
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white">
      <div className="mx-auto grid h-[84px] max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-3 sm:px-5 lg:h-[116px]">
        <div className="flex items-center justify-self-start">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-black lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
          <nav className="hidden items-center gap-8 text-[15px] text-black lg:flex">
            {LEFT.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href === activeHref)}>
                {item.label}
              </Link>
            ))}
            <Link href={accountHref} className={linkClass(accountHref === activeHref)}>
              {accountHref === "/app" ? "Account" : "Sign in"}
            </Link>
          </nav>
        </div>

        <Link href="/" aria-label="Read Talk Pray home" className="justify-self-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={BLACK_LOGO}
            alt="Read Talk Pray"
            width={1254}
            height={1254}
            className="h-auto w-[68px] object-contain lg:w-[92px]"
          />
        </Link>

        <div className="flex items-center justify-end justify-self-end gap-5">
          <Link href={START.href} className={`hidden lg:inline ${linkClass(START.href === activeHref)}`}>
            {START.label}
          </Link>
          <Link
            href="/#join"
            className="inline-flex h-9 items-center justify-center rounded-full bg-[#1976F3] px-3 text-sm font-semibold text-white lg:h-10 lg:px-4 lg:text-[15px]"
          >
            <span className="lg:hidden">Join</span>
            <span className="hidden lg:inline">Join a Group</span>
          </Link>
        </div>
      </div>
      {open ? (
        <div className="border-t border-black/10 bg-white px-5 py-3 lg:hidden">
          {[...LEFT, START, { href: accountHref, label: accountHref === "/app" ? "Account" : "Sign in" }].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-2.5 text-base text-black hover:text-[#1976F3]"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}

function linkClass(active: boolean) {
  return `text-[15px] text-black transition-colors hover:text-[#1976F3] ${
    active ? "text-[#1976F3] underline decoration-2 underline-offset-8" : ""
  }`;
}
