import Link from "next/link";

const variants = {
  primary:
    "bg-[var(--sending-blue)] text-white hover:bg-[var(--sending-blue-hover)] active:bg-[var(--sending-blue-hover)]",
  secondary:
    "bg-white text-[#111] border border-[#e8e8e8] hover:border-[#d4d4d4]",
  white: "bg-white text-[#111] hover:bg-white/90",
  outline:
    "border border-white/40 bg-transparent text-white hover:bg-white/10",
  dark: "bg-[#111] text-white hover:bg-[#222]",
} as const;

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-colors ${variants[variant]} ${className}`;
  const external = href.startsWith("http://") || href.startsWith("https://");

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
