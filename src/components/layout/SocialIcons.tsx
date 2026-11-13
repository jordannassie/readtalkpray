const SOCIALS = [
  { key: "instagram", label: "Instagram", env: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM, icon: InstagramIcon },
  { key: "facebook", label: "Facebook", env: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK, icon: FacebookIcon },
  { key: "tiktok", label: "TikTok", env: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK, icon: TikTokIcon },
  { key: "youtube", label: "YouTube", env: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE, icon: YouTubeIcon },
] as const;

function configuredUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase();
    if (host === "sending.church" || host.endsWith(".sending.church") || host.includes("sendingchurch")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function SocialIcons({ tone = "onBlue" }: { tone?: "onBlue" | "dark" }) {
  const className =
    tone === "dark"
      ? "grid h-10 w-10 place-items-center rounded-full text-[#142033] transition hover:bg-[#e7f0ff] hover:text-[#1976F3]"
      : "grid h-10 w-10 place-items-center rounded-full text-white transition hover:bg-white/15";
  return (
    <div className="flex items-center gap-1">
      {SOCIALS.map((item) => {
        const href = configuredUrl(item.env);
        const Icon = item.icon;
        if (!href) {
          return (
            <span key={item.key} className={className} aria-label={item.label}>
              <Icon />
            </span>
          );
        }
        return (
          <a key={item.key} href={href} className={className} aria-label={item.label} target="_blank" rel="noreferrer">
            <Icon />
          </a>
        );
      })}
    </div>
  );
}

function InstagramIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14.2 8.5h2.6V5.6h-2.6c-2.3 0-3.8 1.6-3.8 4v1.9H8v2.9h2.4V20h3V14.4h2.5l.4-2.9h-2.9V9.7c0-.7.4-1.2 1.2-1.2z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14.4 3.2c.4 2.3 1.7 3.9 4 4.2v2.4c-1.4-.1-2.7-.5-3.9-1.3v6.4c0 3.3-2.5 5.6-5.6 5.6S3.2 18.2 3.2 15s2.5-5.5 5.5-5.6v2.5c-1.5.1-2.6 1.2-2.6 2.8 0 1.6 1.2 2.9 2.9 2.9s3-1.3 3-3V3.2h2.4z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21.6 12.1s0-3-.4-4.3c-.2-.8-.8-1.5-1.6-1.7C18.1 5.7 12 5.7 12 5.7s-6.1 0-7.6.4c-.8.2-1.4.9-1.6 1.7C2.4 9.1 2.4 12.1 2.4 12.1s0 3 .4 4.3c.2.8.8 1.5 1.6 1.7 1.5.4 7.6.4 7.6.4s6.1 0 7.6-.4c.8-.2 1.4-.9 1.6-1.7.4-1.3.4-4.3.4-4.3zM10.2 15.2V9.1l5 3.05-5 3.05z" />
    </svg>
  );
}
