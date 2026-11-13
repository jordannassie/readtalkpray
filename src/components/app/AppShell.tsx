"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, UserRound, Users } from "lucide-react";

const TABS = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/groups", label: "Groups", icon: MapPin },
  { href: "/app/group", label: "My Group", icon: Users },
  { href: "/app/me", label: "Me", icon: UserRound },
];

export function AppShell({
  children,
  name,
  photoUrl,
  isAdmin,
}: {
  children: React.ReactNode;
  name: string | null;
  photoUrl: string | null;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const initial = (name || "You").slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#1c1c1c]">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-4 lg:max-w-3xl">
          <Link href="/app" className="text-base font-semibold tracking-tight text-[#1976F3]">
            Read Talk Pray
          </Link>
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <Link href="/app/admin" className="inline-flex h-11 items-center rounded-full px-3 text-sm font-semibold text-[#1976F3]">
                Admin
              </Link>
            ) : null}
            <Link href="/app/me" aria-label="Account" className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-[#e7f0ff] text-sm font-semibold text-[#1976F3]">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-lg px-4 pb-28 pt-5 lg:max-w-3xl">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white pb-[env(safe-area-inset-bottom)]" aria-label="App">
        <div className="mx-auto grid h-16 max-w-lg grid-cols-4 lg:max-w-3xl">
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
