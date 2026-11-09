export const INSTAGRAM_URL = "https://www.instagram.com/sending_churches";

type InstagramLinkProps = {
  size?: number;
  className?: string;
};

export function InstagramLink({
  size = 22,
  className = "",
}: InstagramLinkProps) {
  return (
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Sending Churches on Instagram"
      className={`inline-flex items-center justify-center transition-opacity hover:opacity-80 ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    </a>
  );
}
