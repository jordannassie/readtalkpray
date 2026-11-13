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
  placeId?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  label: string;
  city: string;
  state: string;
  country: string;
};

type NominatimPlace = {
  name?: string;
  lat?: string;
  lon?: string;
  display_name?: string;
  address?: {
    house_number?: string;
    road?: string;
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
  const name = place.name || place.display_name?.split(",")[0]?.trim() || query;
  const street = [address?.house_number, address?.road].filter(Boolean).join(" ");
  const city = address?.city || address?.town || address?.village || address?.hamlet || address?.suburb || "";
  const state = address?.state || "";
  const country = address?.country || "";
  const formatted = [street, city, state].filter(Boolean).join(", ");
  return {
    name,
    address: formatted,
    latitude,
    longitude,
    label: [name, formatted].filter(Boolean).join(", ") || query,
    city,
    state,
    country,
  };
}

type GoogleSuggestion = {
  placePrediction?: {
    placeId?: string;
    text?: { text?: string };
    structuredFormat?: { mainText?: { text?: string }; secondaryText?: { text?: string } };
  };
};

type GoogleDetails = {
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  addressComponents?: { longText?: string; shortText?: string; types?: string[] }[];
};

function googleComponent(parts: GoogleDetails["addressComponents"], type: string) {
  return parts?.find((part) => part.types?.includes(type))?.longText || "";
}

export async function googlePlaceSuggestions(query: string, key: string) {
  const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: { "content-type": "application/json", "X-Goog-Api-Key": key },
    body: JSON.stringify({ input: query }),
  });
  if (!response.ok) return null;
  const body = (await response.json()) as { suggestions?: GoogleSuggestion[] };
  return (body.suggestions ?? []).flatMap((item) => {
    const prediction = item.placePrediction;
    if (!prediction?.placeId) return [];
    const name = prediction.structuredFormat?.mainText?.text || prediction.text?.text || query;
    const address = prediction.structuredFormat?.secondaryText?.text || "";
    const place: FoundPlace = {
      placeId: prediction.placeId,
      name,
      address,
      latitude: Number.NaN,
      longitude: Number.NaN,
      label: [name, address].filter(Boolean).join(", "),
      city: "",
      state: "",
      country: "",
    };
    return [place];
  });
}

export async function googlePlaceDetails(placeId: string, key: string): Promise<FoundPlace | null> {
  const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    headers: {
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "displayName,formattedAddress,location,addressComponents",
    },
  });
  if (!response.ok) return null;
  const body = (await response.json()) as GoogleDetails;
  const latitude = Number(body.location?.latitude);
  const longitude = Number(body.location?.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  const name = body.displayName?.text || "";
  const city = googleComponent(body.addressComponents, "locality") || googleComponent(body.addressComponents, "postal_town");
  const state = googleComponent(body.addressComponents, "administrative_area_level_1");
  const country = googleComponent(body.addressComponents, "country");
  return {
    placeId,
    name,
    address: body.formattedAddress || "",
    latitude,
    longitude,
    label: [name, body.formattedAddress].filter(Boolean).join(", "),
    city,
    state,
    country,
  };
}

type PhotonFeature = {
  geometry?: { coordinates?: number[] };
  properties?: {
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    state?: string;
    country?: string;
  };
};

async function photonPlaces(query: string): Promise<FoundPlace[]> {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "5");
  url.searchParams.set("lang", "en");
  const response = await fetch(url, { headers: { accept: "application/json", "user-agent": "ReadTalkPray/1.0 (group finder)" } });
  if (!response.ok) return [];
  const body = (await response.json()) as { features?: PhotonFeature[] };
  return (body.features ?? []).flatMap((feature) => {
    const longitude = Number(feature.geometry?.coordinates?.[0]);
    const latitude = Number(feature.geometry?.coordinates?.[1]);
    const props = feature.properties;
    const name = props?.name?.trim() || "";
    if (!name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];
    const street = [props?.housenumber, props?.street].filter(Boolean).join(" ");
    const city = props?.city || "";
    const state = props?.state || "";
    const country = props?.country || "";
    const address = [street, city, state].filter(Boolean).join(", ");
    const place: FoundPlace = {
      name,
      address,
      latitude,
      longitude,
      label: [name, address].filter(Boolean).join(", "),
      city,
      state,
      country,
    };
    return [place];
  });
}

function placeScore(query: string, place: FoundPlace) {
  const tokens = query.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length >= 3);
  const haystack = `${place.name} ${place.address} ${place.city} ${place.state}`.toLowerCase();
  return tokens.reduce((score, token) => score + (haystack.includes(token) ? 1 : 0), 0);
}

export async function suggestRealPlaces(query: string) {
  const [listed, photon] = await Promise.all([
    searchPlaces(query).catch(() => [] as FoundPlace[]),
    photonPlaces(query).catch(() => [] as FoundPlace[]),
  ]);
  const seen = new Set<string>();
  return [...listed, ...photon]
    .filter((place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude) && placeScore(query, place) > 0)
    .sort((a, b) => placeScore(query, b) - placeScore(query, a))
    .filter((place) => {
      const key = `${place.name.toLowerCase()}|${place.city.toLowerCase()}|${place.latitude.toFixed(4)}|${place.longitude.toFixed(4)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 5);
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
