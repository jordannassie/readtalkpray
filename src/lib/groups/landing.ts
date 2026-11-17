import type { Metadata } from "next";
import { SHARE_IMAGE } from "@/components/brand/logos";
import { cityState, type PublicGroup } from "./types";

export function groupLandingMetadata(group: PublicGroup, path: string): Metadata {
  const place = cityState(group);
  const description = place
    ? `Join ${group.name} in ${place}. Read the Bible, talk about it, and pray together.`
    : `Join ${group.name}. Read the Bible, talk about it, and pray together.`;
  const url = `https://readtalkpray.com${path}`;
  const photo = group.leader_photo_url?.startsWith("https://") ? group.leader_photo_url : null;
  const image = photo ?? SHARE_IMAGE;
  return {
    title: `${group.name} | Read Talk Pray`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${group.name} | Read Talk Pray`,
      description,
      url,
      siteName: "Read Talk Pray",
      type: "website",
      images: [{ url: image, alt: photo ? group.leader_name : "Read Talk Pray" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${group.name} | Read Talk Pray`,
      description,
      images: [image],
    },
  };
}
