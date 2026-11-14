"use client";

import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { BLACK_LOGO } from "@/components/brand/logos";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const LEFT = [
  { href: "/#groups", label: "Find a Group" },
  { href: "/#how", label: "How It Works" },
  { href: "/#beliefs", label: "About" },
];

type Account = {
  email: string;
  name: string;
  photo: string | null;
  hasGroup: boolean;
  admin: boolean;
};

export function SiteHeader({ activeHref }: { tone?: "solid" | "overlay" | "light"; activeHref?: string }) {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const start = account?.hasGroup
    ? { href: "/app/group", label: "My Group" }
    : { href: "/app/start", label: "Start a Group" };

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    let alive = true;
    async function load(user: User | null) {
      if (!alive) return;
      if (!user) {
        setAccount(null);
        return;
      }
      const [profile, application, group, admin] = await Promise.all([
        supabase.from("rtp_profiles").select("full_name, photo_url").eq("user_id", user.id).maybeSingle(),
        supabase.from("rtp_group_applications").select("id").eq("user_id", user.id).in("status", ["pending", "changes_requested", "approved", "suspended"]).limit(1),
        supabase.from("rtp_groups").select("id").eq("leader_user_id", user.id).in("status", ["approved", "suspended", "paused"]).limit(1),
        supabase.from("rtp_admins").select("user_id").eq("user_id", user.id).maybeSingle(),
      ]);
      if (!alive) return;
      const metaName = user.user_metadata?.full_name ?? user.user_metadata?.name;
      const metaPhoto = user.user_metadata?.avatar_url ?? user.user_metadata?.picture;
      setAccount({
        email: user.email ?? "",
        name: profile.data?.full_name || (typeof metaName === "string" ? metaName : "") || "Your account",
        photo: profile.data?.photo_url || (typeof metaPhoto === "string" && metaPhoto.startsWith("https://") ? metaPhoto : null),
        hasGroup: Boolean(application.data?.length || group.data?.length),
        admin: Boolean(admin.data),
      });
    }
    void supabase.auth.getUser().then(({ data }) => load(data.user));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      void load(session?.user ?? null);
    });
    return () => {
      alive = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function onPointer(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenu(false);
    }
    window.addEventListener("pointerdown", onPointer);
    return () => window.removeEventListener("pointerdown", onPointer);
  }, []);

  async function signOut() {
    await createClient().auth.signOut();
    window.location.assign("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white">
      <div className="mx-auto grid h-20 max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-3 sm:px-5">
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
          <nav className="hidden items-center gap-8 lg:flex">
            {LEFT.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href === activeHref)}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <Link href="/" aria-label="Read Talk Pray home" className="justify-self-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BLACK_LOGO} alt="Read Talk Pray" width={1254} height={1254} className="h-14 w-auto object-contain sm:h-16" />
        </Link>

        <div className="flex items-center justify-end justify-self-end gap-3 sm:gap-4">
          {account ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-label="Account menu"
                aria-expanded={menu}
                onClick={() => setMenu((value) => !value)}
                className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-[#e7f0ff] text-sm font-semibold text-[#1976F3]"
              >
                {account.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={account.photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  account.name.slice(0, 1).toUpperCase()
                )}
              </button>
              {menu ? <AccountMenu account={account} onClose={() => setMenu(false)} onSignOut={() => void signOut()} /> : null}
            </div>
          ) : (
            <Link href="/login" className={`hidden lg:inline ${linkClass(false)}`}>Sign In</Link>
          )}
          <Link href={start.href} className="hidden h-10 items-center justify-center rounded-full border border-[#d0d5dd] bg-white px-4 text-sm font-semibold text-black lg:inline-flex">
            {start.label}
          </Link>
          <Link href="/#groups" className={`${account ? "hidden lg:inline-flex" : "inline-flex"} h-10 items-center justify-center rounded-full bg-[#1976F3] px-4 text-sm font-semibold text-white`}>
            <span className="lg:hidden">Join</span>
            <span className="hidden lg:inline">Join a Group</span>
          </Link>
        </div>
      </div>
      {open ? (
        <div className="border-t border-black/10 bg-white px-5 py-3 lg:hidden">
          {LEFT.map((item) => (
            <Link key={item.href} href={item.href} className="block py-3 text-base text-black" onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href={start.href} className="block py-3 text-base text-black" onClick={() => setOpen(false)}>{start.label}</Link>
          <Link href="/#groups" className="block py-3 text-base text-black" onClick={() => setOpen(false)}>Join a Group</Link>
          {account ? (
            <>
              <Link href="/app" className="block py-3 text-base text-black" onClick={() => setOpen(false)}>Account</Link>
              {account.admin ? <Link href="/app/admin" className="block py-3 text-base text-black" onClick={() => setOpen(false)}>Admin Dashboard</Link> : null}
              <button type="button" className="block py-3 text-base font-semibold text-[#e10600]" onClick={() => void signOut()}>Sign Out</button>
            </>
          ) : (
            <Link href="/login" className="block py-3 text-base text-black" onClick={() => setOpen(false)}>Sign In</Link>
          )}
        </div>
      ) : null}
    </header>
  );
}

function AccountMenu({ account, onClose, onSignOut }: { account: Account; onClose: () => void; onSignOut: () => void }) {
  return (
    <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-black/10 bg-white py-2 shadow-lg">
      <div className="px-4 py-3">
        <p className="truncate text-sm font-semibold">{account.name}</p>
        <p className="truncate text-xs text-[#666]">{account.email}</p>
      </div>
      <div className="my-1 border-t border-black/5" />
      <MenuLink href="/app" onClick={onClose}>Home</MenuLink>
      <MenuLink href="/app/groups" onClick={onClose}>Find a Group</MenuLink>
      <MenuLink href="/app/start" onClick={onClose}>Start a Group</MenuLink>
      <MenuLink href="/app/group" onClick={onClose}>My Group</MenuLink>
      <MenuLink href="/app/me" onClick={onClose}>Account Settings</MenuLink>
      {account.admin ? <MenuLink href="/app/admin" onClick={onClose}>Admin Dashboard</MenuLink> : null}
      <button type="button" onClick={onSignOut} className="flex w-full items-center gap-2 bg-[#fff1f1] px-4 py-3 text-left text-sm font-semibold text-[#e10600]">
        <LogOut size={18} aria-hidden />
        Sign Out
      </button>
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

function linkClass(active: boolean) {
  return `text-[15px] font-medium text-black transition-colors hover:text-[#1976F3] ${active ? "text-[#1976F3]" : ""}`;
}
