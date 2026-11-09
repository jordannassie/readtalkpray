import { MapPin } from "lucide-react";

type LocationSearchProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: (value: string) => void;
};

export function LocationSearch({
  query,
  onQueryChange,
  onSubmit,
}: LocationSearchProps) {
  return (
    <form
      className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
      onSubmit={(event) => {
        event.preventDefault();
        const value = new FormData(event.currentTarget).get("query");
        onSubmit(typeof value === "string" ? value : query);
      }}
    >
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">City or ZIP code</span>
        <MapPin
          size={18}
          className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-[#999]"
        />
        <input
          type="text"
          name="query"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="City or ZIP code"
          className="h-14 w-full rounded-full border border-[#eee] bg-white pr-5 pl-12 text-base text-[#111] outline-none placeholder:text-[#999] focus:border-[#d4d4d4]"
        />
      </label>
      <button
        type="submit"
        className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[var(--sending-blue)] px-6 text-sm font-medium text-white hover:bg-[var(--sending-blue-hover)] active:bg-[var(--sending-blue-hover)] sm:w-auto"
      >
        Find
      </button>
    </form>
  );
}
