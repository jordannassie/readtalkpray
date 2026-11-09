"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  BookOpen,
  Calendar,
  CheckSquare,
  Church,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  Menu,
  Rocket,
  User,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useDemoAuth } from "@/lib/demo/auth";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const NAV = [
  { href: "/dashboard", label: "Home", icon: Home, match: "/dashboard" },
  { href: "/dashboard#next-step", label: "My Next Step", icon: CheckSquare },
  { href: "/events", label: "Events", icon: Calendar, match: "/events" },
  { href: "/training", label: "Training", icon: BookOpen, match: "/training" },
  { href: "/start-a-church", label: "Get Involved", icon: Users },
  { href: "/my-church", label: "My Church", icon: Church, match: "/my-church" },
  { href: "/start-a-church", label: "Start a Church", icon: Rocket, match: "/start-a-church" },
  { href: "/training", label: "Resources", icon: FileText },
  { href: "/profile", label: "Profile", icon: User, match: "/profile" },
];

export function DashboardShell({
  children,
  variant = "demo",
  accountEmail,
}: {
  children: React.ReactNode;
  variant?: "demo" | "leads";
  accountEmail?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready, logout } = useDemoAuth();
  const [open, setOpen] = useState(false);
  const [leadAdmin, setLeadAdmin] = useState(variant === "leads");

  useEffect(() => {
    if (variant === "demo" && ready && !user) {
      router.replace("/login");
    }
  }, [variant, ready, user, router]);

  useEffect(() => {
    if (variant === "leads" || !isSupabaseConfigured()) return;
    let cancelled = false;
    const supabase = createClient();
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || cancelled) return;
      const { data: admin } = await supabase
        .from("rtp_admins")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();
      if (!cancelled) setLeadAdmin(Boolean(admin));
    });
    return () => {
      cancelled = true;
    };
  }, [variant]);

  async function signOut() {
    if (variant === "leads") {
      if (isSupabaseConfigured()) {
        await createClient().auth.signOut();
      }
    } else {
      logout();
    }
    router.push("/");
  }

  if (variant === "demo" && (!ready || !user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--sending-bg)] text-sm text-[#777]">
        Loading…
      </div>
    );
  }

  const nav = leadAdmin
    ? [
        NAV[0],
        { href: "/csv", label: "Leads", icon: ClipboardList, match: "/csv" },
        ...NAV.slice(1),
      ]
    : NAV;
  const homeHref = variant === "leads" ? "/csv" : "/dashboard";

  return (
    <div className="min-h-screen bg-[var(--sending-bg)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[220px] flex-col border-r border-[#eee] bg-white px-4 py-5 md:flex">
        <Logo href={homeHref} />
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = item.match === pathname;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm ${
                  active
                    ? "bg-[var(--sending-blue)] text-white"
                    : "text-[#666] hover:bg-[#f7f7f7]"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={() => void signOut()}
          className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-[#666] hover:bg-[#f7f7f7]"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </aside>

      <div className="md:pl-[220px]">
        <div className="flex items-center justify-between px-5 py-4 md:px-8">
          <div className="md:hidden">
            <Logo href={homeHref} />
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--sending-blue)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--sending-blue-hover)] active:bg-[var(--sending-blue-hover)] md:hidden"
            >
              <LogOut size={15} />
              Log Out
            </button>
            <button type="button" className="rounded-full p-2 text-[#888]" aria-label="Notifications">
              <Bell size={18} />
            </button>
            {variant === "demo" && user ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f3f3] text-xs font-medium"
                aria-label={accountEmail}
              >
                {(accountEmail ?? "?").slice(0, 1).toUpperCase()}
              </span>
            )}
            <button
              type="button"
              className="rounded-full p-2 text-[#111] md:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-label="Open menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {open ? (
          <div className="space-y-1 border-y border-[#eee] bg-white px-4 py-3 md:hidden">
            {nav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block rounded-xl px-3 py-2 text-sm text-[#333]"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}

        <main className="px-5 pb-10 md:px-8 md:pb-12">{children}</main>
      </div>
    </div>
  );
}
