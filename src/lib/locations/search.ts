import type {
  LocationFilter,
  LocationSearchResult,
  SendingLocation,
} from "./types";

const LOCATION_ALIASES: Record<string, string[]> = {
  "frisco-star": [
    "frisco",
    "prosper",
    "75034",
    "75035",
    "75078",
    "75033",
    "75024",
    "the star",
    "omni",
  ],
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function locationText(location: SendingLocation) {
  return [
    location.location_name,
    location.city,
    location.state,
    location.zip_code,
    location.venue_name,
    location.address,
    ...(LOCATION_ALIASES[location.location_id] ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

function matchesQuery(location: SendingLocation, query: string) {
  const haystack = locationText(location);
  return query.split(/\s+/).every((part) => haystack.includes(part));
}

function applyFilter(locations: SendingLocation[], filter: LocationFilter) {
  if (filter === "training") {
    return [...locations]
      .filter((location) => Boolean(location.training_start_time))
      .sort((a, b) => a.training_start_date.localeCompare(b.training_start_date));
  }

  if (filter === "church") {
    return locations.filter((location) => /sunday/i.test(location.church_day));
  }

  return locations;
}

export function searchLocations(
  locations: SendingLocation[],
  query: string,
  filter: LocationFilter = "nearest",
): LocationSearchResult {
  const filtered = applyFilter(locations, filter);
  const normalized = normalize(query);

  if (!normalized) {
    return { locations: filtered, nearestFallback: false };
  }

  const matched = filtered.filter((location) =>
    matchesQuery(location, normalized),
  );

  if (matched.length > 0) {
    return { locations: matched, nearestFallback: false };
  }

  return {
    locations: filtered.slice(0, 1),
    nearestFallback: filtered.length > 0,
  };
}
