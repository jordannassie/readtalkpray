import type { Metadata } from "next";
import { SHARE_IMAGE } from "@/components/brand/logos";
import { groupSeoDescription, groupSeoTitle, SITE } from "./seo";
import type { PublicGroup } from "./types";

export function groupLandingMetadata(group: PublicGroup, path: string): Metadata {
  const title = groupSeoTitle(group);
  const description = groupSeoDescription(group);
  const url = `${SITE}${path}`;
  const photo = group.leader_photo_url?.startsWith("https://") ? group.leader_photo_url : null;
  const image = photo ?? SHARE_IMAGE;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: group.is_demo ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: "Read Talk Pray",
      type: "website",
      images: [{ url: image, alt: photo ? `${group.leader_name}, leader of ${group.name}` : "Read Talk Pray" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
