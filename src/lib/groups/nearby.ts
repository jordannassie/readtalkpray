import { distanceKm } from "./geo";

export const SEARCH_RADII = [5, 10, 25, 50] as const;

export type SearchRadius = (typeof SEARCH_RADII)[number];

const MILE_KM = 1.609344;

const STATE_ABBR: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
  "district of columbia": "DC",
};

export function shortState(state: string) {
  const trimmed = state.trim();
  if (/^[A-Za-z]{2}$/.test(trimmed)) return trimmed.toUpperCase();
  return STATE_ABBR[trimmed.toLowerCase()] ?? trimmed;
}

export function nearLabel(city: string, state: string) {
  const name = city.trim();
  if (!name) return "";
  const region = shortState(state);
  return `Near ${[name, region].filter(Boolean).join(", ")}`;
}

export function hasMapCoordinates(point: { latitude: number; longitude: number }) {
  return Number.isFinite(point.latitude) && Number.isFinite(point.longitude) && !(point.latitude === 0 && point.longitude === 0);
}

export function groupsByDistance<T extends { latitude: number; longitude: number }>(
  groups: T[],
  origin: { latitude: number; longitude: number },
  radiusMiles: number | null,
) {
  const maxKm = radiusMiles == null ? Number.POSITIVE_INFINITY : radiusMiles * MILE_KM;
  return groups
    .flatMap((group) => {
      if (!hasMapCoordinates(group)) return [];
      const km = distanceKm(origin, group);
      if (km > maxKm) return [];
      return [{ group, km }];
    })
    .sort((left, right) => left.km - right.km);
}

export function formatMiles(km: number, approximate: boolean) {
  const miles = km / MILE_KM;
  const rounded = miles < 10 ? Math.round(miles * 10) / 10 : Math.round(miles);
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return approximate ? `about ${text} mi` : `${text} mi`;
}

export function widerRadius(radius: SearchRadius): SearchRadius | null {
  return radius < 50 ? 50 : null;
}
