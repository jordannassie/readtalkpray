import Link from "next/link";
import { BookOpen } from "lucide-react";

type LogoProps = {
  href?: string;
  invert?: boolean;
  className?: string;
  imageClassName?: string;
};

export function Logo({ href = "/", invert = false, className = "" }: LogoProps) {
  return (
    <Link href={href} className={`inline-flex items-center gap-2 font-semibold tracking-tight ${invert ? "text-white" : "text-[#142033]"} ${className}`}>
      <BookOpen size={22} className={invert ? "text-white" : "text-[var(--sending-blue)]"} aria-hidden />
      <span>Read Talk Pray</span>
    </Link>
  );
}
