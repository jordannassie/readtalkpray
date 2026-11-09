import { FacebookLink } from "@/components/brand/FacebookLink";
import { InstagramLink } from "@/components/brand/InstagramLink";
import { TikTokLink } from "@/components/brand/TikTokLink";

type SocialLinksProps = {
  size?: number;
  className?: string;
};

export function SocialLinks({ size = 22, className = "" }: SocialLinksProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <InstagramLink size={size} />
      <FacebookLink size={size} />
      <TikTokLink size={size} />
    </div>
  );
}
