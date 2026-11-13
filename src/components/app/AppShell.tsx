"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Home, LogOut, MapPin, UserRound, Users } from "lucide-react";
import { BLACK_LOGO } from "@/components/brand/logos";
import { createClient } from "@/lib/supabase/client";

const TABS = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/groups", label: "Groups", icon: MapPin },
  { href: "/app/group", label: "My Group", icon: Users },
  { href: "/app/me", label: "Me", icon: UserRound },
];

export function AppShell({
  children,
  name,
  email,
  photoUrl,
  isAdmin,
}: {
  children: React.ReactNode;
  name: string | null;
  email: string;
  photoUrl: string | null;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const map = pathname.startsWith("/app/groups");
  const wide = pathname.startsWith("/app/start");
  const initial = (name || email || "You").slice(0, 1).toUpperCase();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointer(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("pointerdown", onPointer);
    return () => window.removeEventListener("pointerdown", onPointer);
  }, []);

  async function signOut() {
    await createClient().auth.signOut();
    window.location.assign("/");
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#1c1c1c]">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white">
        <div className={`relative mx-auto flex h-16 items-center justify-end px-4 sm:px-6 ${wide ? "max-w-[1280px]" : "max-w-lg lg:max-w-5xl"}`}>
          <Link href="/app" aria-label="Read Talk Pray" className="absolute left-1/2 -translate-x-1/2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BLACK_LOGO} alt="Read Talk Pray" width={1254} height={1254} className="h-11 w-auto object-contain sm:h-12" />
          </Link>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label="Account menu"
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
              className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-[#e7f0ff] text-sm font-semibold text-[#1976F3]"
            >
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </button>
            {open ? (
              <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-black/10 bg-white py-2 shadow-lg">
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[#e7f0ff] text-sm font-semibold text-[#1976F3]">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      initial
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{name || "Your account"}</span>
                    <span className="block truncate text-xs text-[#666]">{email}</span>
                  </span>
                </div>
                <div className="my-1 border-t border-black/5" />
                <MenuLink href="/app" onClick={() => setOpen(false)}>Home</MenuLink>
                <MenuLink href="/app/groups" onClick={() => setOpen(false)}>Find a Group</MenuLink>
                <MenuLink href="/app/start" onClick={() => setOpen(false)}>Start a Group</MenuLink>
                <MenuLink href="/app/group" onClick={() => setOpen(false)}>My Group</MenuLink>
                <MenuLink href="/app/me" onClick={() => setOpen(false)}>Account Settings</MenuLink>
                {isAdmin ? <MenuLink href="/app/admin" onClick={() => setOpen(false)}>Admin Dashboard</MenuLink> : null}
                <button type="button" onClick={() => void signOut()} className="flex w-full items-center gap-2 bg-[#fff1f1] px-4 py-3 text-left text-sm font-semibold text-[#e10600]">
                  <LogOut size={18} aria-hidden />
                  Sign Out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>
      <main className={map ? "w-full pb-24" : wide ? "mx-auto w-full max-w-[1280px] px-4 pb-28 pt-5 sm:px-6" : "mx-auto w-full max-w-lg px-4 pb-28 pt-5 lg:max-w-3xl"}>{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white pb-[env(safe-area-inset-bottom)]" aria-label="App">
        <div className={`mx-auto grid h-16 grid-cols-4 ${wide ? "max-w-[1280px]" : "max-w-lg lg:max-w-5xl"}`}>
          {TABS.map((tab) => {
            const active = tab.href === "/app" ? pathname === "/app" : pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link key={tab.href} href={tab.href} className={`flex flex-col items-center justify-center gap-1 text-xs font-medium ${active ? "text-[#1976F3]" : "text-[#666]"}`}>
                <Icon size={22} aria-hidden />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function MenuLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="block px-4 py-3 text-sm font-medium hover:bg-[#f4f7fb]">
      {children}
    </Link>
  );
}
