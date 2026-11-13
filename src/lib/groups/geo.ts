export function approximateCoordinates(latitude: number, longitude: number, seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 33 + seed.charCodeAt(index)) >>> 0;
  }
  const latitudeOffset = ((hash % 200) / 199 - 0.5) * 0.018;
  const longitudeOffset = ((((hash >>> 8) % 200) / 199) - 0.5) * 0.018;
  return {
    latitude: Math.round((latitude + latitudeOffset) * 1000) / 1000,
    longitude: Math.round((longitude + longitudeOffset) * 1000) / 1000,
  };
}

export function publicLocationLabel(input: {
  locationType: string;
  meetingLocation: string;
  city: string;
  state: string;
}) {
  if (input.locationType === "home") {
    return input.state ? `${input.city}, ${input.state} area` : `${input.city} area`;
  }
  return input.meetingLocation.trim();
}

export function distanceKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earth = 6371;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLon / 2) ** 2;
  return earth * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export type FoundPlace = {
  latitude: number;
  longitude: number;
  label: string;
  city: string;
  state: string;
  country: string;
};

type NominatimPlace = {
  lat?: string;
  lon?: string;
  display_name?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    suburb?: string;
    state?: string;
    country?: string;
  };
};

function foundPlace(place: NominatimPlace, query: string): FoundPlace | null {
  const latitude = Number(place.lat);
  const longitude = Number(place.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  const address = place.address;
  return {
    latitude,
    longitude,
    label: place.display_name?.split(",").slice(0, 3).join(",").trim() || query,
    city: address?.city || address?.town || address?.village || address?.hamlet || address?.suburb || "",
    state: address?.state || "",
    country: address?.country || "",
  };
}

export async function searchPlaces(query: string) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "5");
  url.searchParams.set("q", query);
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "ReadTalkPray/1.0 (group finder)",
    },
  });
  if (!response.ok) return [];
  const body = (await response.json()) as NominatimPlace[];
  return body.map((place) => foundPlace(place, query)).filter((place): place is FoundPlace => Boolean(place));
}

export async function geocodePlace(query: string) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", query);
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "ReadTalkPray/1.0 (group finder)",
    },
  });
  if (!response.ok) return null;
  const body = (await response.json()) as { lat?: string; lon?: string; display_name?: string }[];
  const place = body[0];
  if (!place?.lat || !place.lon) return null;
  const latitude = Number(place.lat);
  const longitude = Number(place.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return {
    latitude,
    longitude,
    label: place.display_name?.split(",").slice(0, 3).join(",").trim() || query,
  };
}
