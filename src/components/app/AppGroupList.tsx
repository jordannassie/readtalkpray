"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { meetingWhen, type PublicGroup } from "@/lib/groups/types";

export function AppGroupList({ groups }: { groups: PublicGroup[] }) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return groups;
    return groups.filter((group) =>
      `${group.name} ${group.city} ${group.state ?? ""} ${group.public_location}`.toLowerCase().includes(text),
    );
  }, [groups, query]);

  return (
    <div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search city or group"
        className="h-12 w-full rounded-2xl border border-[#e6e6e6] bg-white px-4 text-base outline-none focus:border-[#1976F3]"
      />
      {groups.length === 0 ? <p className="mt-6 text-sm leading-relaxed text-[#555]">Approved groups will show up here. The public map is unchanged.</p> : null}
      <ul className="mt-4 space-y-3">
        {visible.map((group) => (
          <li key={group.id}>
            <Link href={`/groups/${group.id}`} className="block rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-lg font-semibold tracking-tight">{group.name}</p>
              <p className="mt-1 text-sm text-[#555]">{[group.city, group.state].filter(Boolean).join(", ")}</p>
              <p className="mt-2 text-sm">{meetingWhen(group) || "Time to be announced"}</p>
              <p className="mt-1 text-sm text-[#666]">{group.public_location}</p>
            </Link>
          </li>
        ))}
      </ul>
      {groups.length > 0 && visible.length === 0 ? <p className="mt-6 text-sm text-[#555]">No groups match that search.</p> : null}
    </div>
  );
}
