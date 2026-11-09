"use client";

import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { EVENTS } from "@/lib/demo/data";

export default function EventsPage() {
  return (
    <DashboardShell>
      <p className="text-sm text-[#777]">Events</p>
      <h1 className="mt-1 text-4xl font-semibold tracking-tight">Upcoming gatherings</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {EVENTS.map((event) => (
          <article
            key={event.title}
            className="overflow-hidden rounded-[28px] border border-[#eee] bg-white"
          >
            <Image
              src={event.image}
              alt={event.title}
              width={800}
              height={420}
              className="h-48 w-full object-cover"
            />
            <div className="p-5">
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <p className="mt-3 flex items-center gap-2 text-sm text-[#666]">
                <Calendar size={15} className="text-[var(--sending-blue)]" />
                {event.dateLabel} · {event.time}
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-[#666]">
                <MapPin size={15} className="text-[var(--sending-blue)]" />
                {event.location}
              </p>
            </div>
          </article>
        ))}
      </div>
    </DashboardShell>
  );
}
