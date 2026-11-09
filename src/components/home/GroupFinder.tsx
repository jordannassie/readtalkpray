"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, MapPin, Plus, Users } from "lucide-react";
import { distanceKm } from "@/lib/groups/geo";
import { meetingWhen, placeLabel, type PublicGroup } from "@/lib/groups/types";

const GroupsMap = dynamic(() => import("@/components/home/GroupsMap").then((mod) => mod.GroupsMap), {
  ssr: false,
  loading: () => <div className="h-full min-h-[320px] animate-pulse bg-[#e7eef8]" />,
});

type Place = { latitude: number; longitude: number; label: string };

export function GroupFinder({ groups }: { groups: PublicGroup[] }) {
  const [query, setQuery] = useState("");
  const [place, setPlace] = useState<Place | null>(null);
  const [searching, setSearching] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text && !place) return groups;
    return groups.filter((group) => {
      const haystack = `${group.name} ${group.city} ${group.state ?? ""} ${group.country} ${group.public_location}`.toLowerCase();
      if (text && haystack.includes(text)) return true;
      if (place && distanceKm(place, group) <= 80) return true;
      return false;
    });
  }, [groups, query, place]);

  async function onSearch(event: FormEvent) {
    event.preventDefault();
    const next = query.trim();
    setNotice("");
    if (next.length < 2) {
      setPlace(null);
      return;
    }
    setSearching(true);
    try {
      const response = await fetch(`/api/places?q=${encodeURIComponent(next)}`);
      const body = (await response.json()) as { ok?: boolean; place?: Place };
      if (!response.ok || !body.place) {
        setPlace(null);
        setNotice("That place could not be found. Try a city name.");
        return;
      }
      setPlace(body.place);
      setSelectedId(null);
    } catch {
      setNotice("Search is unavailable right now.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="relative z-10 mx-auto -mt-8 max-w-6xl px-4 sm:-mt-14 sm:px-5">
      <div id="join" className="grid scroll-mt-24 gap-4 lg:grid-cols-2">
        <form onSubmit={onSearch} className="rounded-[28px] bg-[var(--sending-blue)] p-6 text-white shadow-[0_18px_50px_rgba(24,70,180,0.28)] sm:p-7">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/15">
              <Users size={22} />
            </span>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Join a Group</h2>
              <p className="mt-1 text-sm text-white/85">Find a Read Talk Pray group near you.</p>
            </div>
          </div>
          <label className="mt-5 block">
            <span className="sr-only">City</span>
            <span className="flex h-[52px] items-center gap-2 rounded-full bg-white px-4 text-[#111]">
              <MapPin size={18} className="text-[var(--sending-blue)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nashville, TN"
                className="h-full w-full bg-transparent text-sm outline-none placeholder:text-[#8a8a8a]"
              />
            </span>
          </label>
          <button
            type="submit"
            disabled={searching}
            className="mt-3 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-white text-[15px] font-semibold text-[#111]"
          >
            {searching ? "Searching…" : "Find a Group"}
            <ArrowRight size={16} />
          </button>
        </form>

        <article className="rounded-[28px] bg-white p-6 shadow-[0_18px_40px_rgba(20,40,80,0.12)] sm:p-7">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--sending-blue-light)] text-[var(--sending-blue)]">
              <Plus size={22} />
            </span>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Start a Group</h2>
              <p className="mt-1 text-sm leading-relaxed text-[#555]">
                Lead a simple Bible study in your home, coffee shop, workplace, or anywhere.
              </p>
            </div>
          </div>
          <Link
            href="/start"
            className="mt-6 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[var(--sending-blue)] text-[15px] font-semibold text-white"
          >
            Start a Group
            <ArrowRight size={16} />
          </Link>
        </article>
      </div>

      <section id="groups" className="mt-5 scroll-mt-24 rounded-[28px] bg-white p-4 shadow-[0_16px_40px_rgba(20,40,80,0.08)] sm:p-5">
        <div className="mb-4 flex items-end justify-between gap-3 px-1">
          <div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {place ? `Groups near ${place.label}` : "Groups"}
            </h2>
            <p className="mt-1 text-sm text-[#5d6b82]">
              {groups.length === 0
                ? "Approved groups will show up here."
                : "Join a group this week."}
            </p>
          </div>
          {query || place ? (
            <button
              type="button"
              className="text-sm font-medium text-[var(--sending-blue)]"
              onClick={() => {
                setQuery("");
                setPlace(null);
                setNotice("");
                setSelectedId(null);
              }}
            >
              Clear
            </button>
          ) : null}
        </div>
        {notice ? <p className="mb-3 px-1 text-sm text-[#9a3412]">{notice}</p> : null}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <div className="order-1 max-h-[520px] space-y-3 overflow-auto lg:order-none">
            {visible.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#d5deea] px-4 py-8 text-sm leading-relaxed text-[#52627a]">
                {groups.length === 0
                  ? "No approved groups yet. Be the first to start one."
                  : "No approved groups in that search yet."}
              </div>
            ) : (
              visible.map((group) => (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  onClick={() => setSelectedId(group.id)}
                  className={`flex items-center gap-3 rounded-2xl border px-3 py-3 ${
                    selectedId === group.id ? "border-[var(--sending-blue)] bg-[#f3f7ff]" : "border-[#e6ebf2] bg-white"
                  }`}
                >
                  <LeaderPhoto group={group} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{group.name}</span>
                    <span className="mt-0.5 block text-sm text-[#555]">{meetingWhen(group) || "Time to be announced"}</span>
                    <span className="mt-0.5 flex items-center gap-1 text-sm text-[#5d6b82]">
                      <MapPin size={13} className="shrink-0 text-[var(--sending-blue)]" />
                      <span className="truncate">
                        {group.public_location}
                        {group.location_type === "home" ? " · approximate" : ""}
                      </span>
                    </span>
                  </span>
                  <ArrowRight size={16} className="shrink-0 text-[#8b97ab]" />
                </Link>
              ))
            )}
          </div>
          <div className="order-2 min-h-[340px] overflow-hidden rounded-2xl border border-[#e6ebf2] lg:order-none lg:min-h-[520px]">
            <GroupsMap groups={visible} focus={place} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
        </div>
        <p className="mt-3 px-1 text-xs text-[#6d7b90]">
          Home groups show an approximate area. The exact address is shared after the leader confirms your request.
          {groups.length > 0 ? ` ${new Set(groups.map((group) => placeLabel(group))).size} ${groups.length === 1 ? "place" : "places"} on the map.` : ""}
        </p>
      </section>
    </div>
  );
}

function LeaderPhoto({ group }: { group: PublicGroup }) {
  if (group.leader_photo_url) {
    return (
      // Leader photos are uploaded at request time and already sized for a small circle.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={group.leader_photo_url} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
    );
  }
  return (
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--sending-blue)] text-sm font-semibold text-white">
      {group.leader_name.slice(0, 1).toUpperCase()}
    </span>
  );
}
