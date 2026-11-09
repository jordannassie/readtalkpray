import type { LocationFilter } from "@/lib/locations";

const FILTERS: { id: LocationFilter; label: string }[] = [
  { id: "nearest", label: "Nearest Location" },
  { id: "training", label: "Training Starting Soon" },
  { id: "church", label: "Church This Sunday" },
];

type LocationFiltersProps = {
  value: LocationFilter;
  onChange: (value: LocationFilter) => void;
};

export function LocationFilters({ value, onChange }: LocationFiltersProps) {
  return (
    <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
      {FILTERS.map((filter) => {
        const active = value === filter.id;
        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange(filter.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
              active
                ? "bg-[#111] text-white"
                : "border border-[#eee] bg-white text-[#666] hover:border-[#d4d4d4]"
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
