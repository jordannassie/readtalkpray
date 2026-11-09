export const TIKTOK_URL = "https://www.tiktok.com/@sending_churches";

type TikTokLinkProps = {
  size?: number;
  className?: string;
};

export function TikTokLink({ size = 22, className = "" }: TikTokLinkProps) {
  return (
    <a
      href={TIKTOK_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Sending Churches on TikTok"
      className={`inline-flex items-center justify-center transition-opacity hover:opacity-80 ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.16 15.3 6.34 6.34 0 0 0 9.5 21.64a6.34 6.34 0 0 0 6.33-6.33V8.83a8.18 8.18 0 0 0 4.76 1.52V6.9a4.84 4.84 0 0 1-1-.21z" />
      </svg>
    </a>
  );
}
