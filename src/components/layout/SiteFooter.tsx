import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const NAV = [
  { href: "/#groups", label: "Groups" },
  { href: "/start", label: "Start a Group" },
  { href: "/#how", label: "How It Works" },
  { href: "/#beliefs", label: "Our Beliefs" },
  { href: "/leader", label: "Leader" },
];

export function SiteFooter() {
  return (
    <footer className="bg-[#10284f] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 md:flex-row md:items-center md:justify-between">
        <Logo invert href="/" />
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/85">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="text-sm text-white/80">Read the Bible. Talk about it. Pray together.</p>
      </div>
    </footer>
  );
}
