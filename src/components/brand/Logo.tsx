import Link from "next/link";
import { BLACK_LOGO, WHITE_LOGO } from "@/components/brand/logos";

type LogoProps = {
  href?: string;
  invert?: boolean;
  className?: string;
  width?: number;
};

export function Logo({ href = "/", invert = false, className = "", width = 96 }: LogoProps) {
  return (
    <Link href={href} aria-label="Read Talk Pray" className={`inline-flex shrink-0 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={invert ? WHITE_LOGO : BLACK_LOGO}
        alt="Read Talk Pray"
        width={1254}
        height={1254}
        style={{ width, height: "auto" }}
        className="h-auto max-w-full object-contain"
      />
    </Link>
  );
}
