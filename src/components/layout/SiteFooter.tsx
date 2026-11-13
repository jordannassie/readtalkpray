import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { SocialIcons } from "@/components/layout/SocialIcons";

const NAV = [
  { href: "/#groups", label: "Groups" },
  { href: "/app/start", label: "Start a Group" },
  { href: "/#how", label: "How It Works" },
  { href: "/#beliefs", label: "Our Beliefs" },
  { href: "/app/start", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="bg-[#1976F3] text-white">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-5 px-5 py-10 text-center sm:flex-row sm:items-center sm:justify-between sm:py-12 sm:text-left">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-white">THIS WEEK</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Come as you are.</p>
        </div>
        <Link
          href="/#join"
          className="inline-flex h-12 w-fit items-center justify-center gap-1.5 rounded-full bg-white px-5 text-sm font-semibold text-[#111]"
        >
          Join a Group
          <ArrowUpRight size={16} aria-hidden />
        </Link>
      </div>
      <div className="mx-auto grid max-w-[1280px] gap-8 px-5 pb-10 text-center lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] lg:items-center lg:text-left">
        <div className="flex flex-col items-center lg:items-start">
          <Logo invert width={120} />
          <p className="mt-3 max-w-sm text-base text-white">Read the Bible. Talk about it. Pray together.</p>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-white lg:justify-center">
          {NAV.map((item) => (
            <Link key={item.label} href={item.href} className="transition-colors hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex justify-center lg:justify-end">
          <SocialIcons />
        </div>
      </div>
      <div className="border-t border-white/20">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-2 px-5 py-5 text-center text-sm text-white sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>© 2026 Read Talk Pray.</p>
          <p className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <span>A simple way to follow Jesus together.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
