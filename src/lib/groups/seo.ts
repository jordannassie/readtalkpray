import type { Metadata } from "next";
import { SHARE_IMAGE } from "../../components/brand/logos";
import { hasMapCoordinates } from "./nearby";
import { cityState, meetingWhen, venueName, type PublicGroup } from "./types";

export const SITE = "https://readtalkpray.com";

export function publicMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  const url = path ? `${SITE}${path}` : `${SITE}/`;
  const fullTitle = title.includes("Read Talk Pray") ? title : `${title} · Read Talk Pray`;
  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Read Talk Pray",
      type: "website",
      images: [{ url: SHARE_IMAGE, alt: "Read Talk Pray" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [SHARE_IMAGE] },
  };
}

export function groupSeoTitle(group: Pick<PublicGroup, "name" | "city" | "state">) {
  const place = cityState(group);
  if (!place) return `${group.name} | Bible Group`;
  return `Bible Group in ${place} | ${group.name}`;
}

export function groupSeoDescription(group: PublicGroup) {
  const custom = group.description?.replace(/\s+/g, " ").trim();
  const place = cityState(group);
  if (custom && custom.length >= 40) {
    const city = group.city.trim().toLowerCase();
    if (!place || (city && custom.toLowerCase().includes(city))) return custom.slice(0, 160);
    const local = `${custom} Bible group in ${place}.`;
    if (local.length <= 170) return local;
  }
  const area = place || "your area";
  const when = meetingWhen(group);
  const venue = venueName(group);
  const meeting = when && venue ? ` Meets ${when} at ${venue}.` : when ? ` Meets ${when}.` : venue ? ` Meets at ${venue}.` : "";
  const full = `${group.name} is a Bible group in ${area}.${meeting} Read the Bible, talk about Jesus, and pray together.`;
  if (full.length <= 170) return full;
  return `${group.name} is a Bible group in ${area}. Read the Bible, talk about Jesus, and pray together.`;
}

export function groupJsonLd(group: PublicGroup, url: string) {
  if (group.is_demo) return null;
  const place = cityState(group);
  const address: Record<string, string> = {
    "@type": "PostalAddress",
    addressLocality: group.city,
    addressCountry: group.country || "US",
  };
  if (group.state) address.addressRegion = group.state;
  const street = group.location_type === "home" ? "" : group.address?.trim() ?? "";
  if (street) address.streetAddress = street;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Church",
    name: group.name,
    description: groupSeoDescription(group),
    url,
    address,
    areaServed: place || group.city,
  };
  if (group.location_type !== "home" && hasMapCoordinates(group)) {
    data.geo = { "@type": "GeoCoordinates", latitude: group.latitude, longitude: group.longitude };
  }
  return data;
}
