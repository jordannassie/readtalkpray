import Image from "next/image";
import type { SendingLocation } from "@/lib/locations";
import { ChurchBlock } from "./ChurchBlock";
import { TrainingBlock } from "./TrainingBlock";

type LocationCardProps = {
  location: SendingLocation;
  nearestFallback?: boolean;
};

export function LocationCard({
  location,
  nearestFallback = false,
}: LocationCardProps) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-[#eee] bg-white">
      <div className="px-6 py-6 sm:px-8">
        {nearestFallback ? (
          <p className="mb-3 text-sm text-[#777]">Nearest available Sending Church</p>
        ) : null}
        <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {location.location_name}
        </h3>
        <p className="mt-2 text-base text-[#111]">{location.venue_name}</p>
        <p className="mt-1 text-sm text-[#666]">{location.address}</p>
        <a
          href={location.map_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex text-sm font-medium text-[var(--sending-blue)] hover:text-[var(--sending-blue-hover)] active:text-[var(--sending-blue-hover)]"
        >
          Get Directions
        </a>

        {location.leader_name ? (
          <div className="mt-5 flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[var(--sending-blue-light)]">
              {location.leader_photo_url ? (
                <Image
                  src={location.leader_photo_url}
                  alt={location.leader_name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              ) : null}
            </div>
            <p className="text-sm font-medium text-[#111]">{location.leader_name}</p>
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 px-6 pb-6 sm:px-8 lg:grid-cols-2">
        <ChurchBlock location={location} />
        <TrainingBlock location={location} />
      </div>
    </article>
  );
}
