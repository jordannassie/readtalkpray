"use client";

import { useMemo, useState } from "react";
import { getLocations, searchLocations } from "@/lib/locations";
import { EmptyLocationCTA } from "./EmptyLocationCTA";
import { LocationCard } from "./LocationCard";
import { LocationSearch } from "./LocationSearch";

export function LocationFinder() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const result = useMemo(
    () => searchLocations(getLocations(), submittedQuery, "nearest"),
    [submittedQuery],
  );

  return (
    <section id="find-a-church" className="bg-white">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#999]">
          Find a Sending Church
        </p>
        <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Find a Church Near You
        </h2>

        <LocationSearch
          query={query}
          onQueryChange={setQuery}
          onSubmit={(value) => {
            setQuery(value);
            setSubmittedQuery(value);
          }}
        />

        <div className="mt-8 space-y-5">
          {result.locations.map((location) => (
            <LocationCard
              key={location.location_id}
              location={location}
              nearestFallback={result.nearestFallback}
            />
          ))}
        </div>

        <EmptyLocationCTA />
      </div>
    </section>
  );
}
