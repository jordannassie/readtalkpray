const tones = {
  primary: "bg-[var(--sending-blue)] text-white hover:bg-[var(--sending-blue-hover)] active:bg-[var(--sending-blue-hover)]",
  secondary: "border border-[#e8e8e8] bg-white text-[#111] hover:border-[#d4d4d4]",
} as const;

export function ActionButton({
  tone = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: keyof typeof tones;
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${className}`}
      {...props}
    />
  );
}
