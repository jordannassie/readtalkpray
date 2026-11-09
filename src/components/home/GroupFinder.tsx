"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, MapPin, UserPlus, Users } from "lucide-react";
import { distanceKm } from "@/lib/groups/geo";
import { meetingWhen, placeLabel, type PublicGroup } from "@/lib/groups/types";

const GroupsMap = dynamic(() => import("@/components/home/GroupsMap").then((mod) => mod.GroupsMap), {
  ssr: false,
  loading: () => <div className="h-full min-h-[420px] animate-pulse bg-[#e7eef8] lg:min-h-[620px]" />,
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
      if (place && distanceKm(place, group) <= 32) return true;
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

  const demoCount = groups.filter((group) => group.is_demo).length;
  const heading = place ? `Groups near ${place.label}` : "Groups in Nashville";

  return (
    <div className="relative z-10 mx-auto -mt-16 max-w-[1320px] px-4 sm:-mt-28 sm:px-5">
      <div id="join" className="grid scroll-mt-24 items-stretch gap-4 lg:grid-cols-2 lg:gap-5">
        <form onSubmit={onSearch} className="flex flex-col rounded-[28px] bg-[var(--sending-blue)] p-6 text-white shadow-[0_22px_50px_rgba(24,70,180,0.32)] sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15">
              <Users size={24} />
            </span>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Join a Group</h2>
              <p className="mt-1 text-base text-white/90">Find a Read Talk Pray group near you.</p>
            </div>
          </div>
          <label className="mt-6 block">
            <span className="sr-only">City</span>
            <span className="flex h-14 items-center gap-2 rounded-full bg-white px-4 text-[#111]">
              <MapPin size={18} className="text-[var(--sending-blue)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nashville, TN"
                className="h-full w-full bg-transparent text-base outline-none placeholder:text-[#8a8a8a]"
              />
            </span>
          </label>
          <button
            type="submit"
            disabled={searching}
            className="mt-3 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white text-base font-semibold text-[#111]"
          >
            {searching ? "Searching…" : "Find a Group"}
            <ArrowRight size={18} />
          </button>
        </form>

        <article className="flex flex-col rounded-[28px] bg-white p-6 shadow-[0_22px_44px_rgba(20,40,80,0.14)] sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--sending-blue-light)] text-[var(--sending-blue)]">
              <UserPlus size={24} />
            </span>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Start a Group</h2>
              <p className="mt-1 text-base leading-relaxed text-[#4d4d4d]">
                Lead a simple Bible study in your home, coffee shop, workplace, or anywhere.
              </p>
            </div>
          </div>
          <Link
            href="/start"
            className="mt-auto inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[var(--sending-blue)] text-base font-semibold text-white"
          >
            Start a Group
            <ArrowRight size={18} />
          </Link>
        </article>
      </div>

      <section id="groups" className="mt-5 scroll-mt-24 rounded-[28px] bg-white p-4 shadow-[0_18px_44px_rgba(20,40,80,0.1)] sm:p-6">
        <div className="mb-4 flex items-end justify-between gap-3 px-1">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-[1.7rem]">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--sending-blue-light)] text-[var(--sending-blue)]">
                <Users size={18} />
              </span>
              {heading}
            </h2>
            <p className="mt-1 text-sm text-[#5d6b82] sm:text-base">
              {groups.length === 0 ? "The map is ready for the first group." : "Join a group this week."}
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
        {demoCount > 0 ? (
          <p className="mb-4 rounded-2xl bg-[#f3f7ff] px-4 py-3 text-sm leading-relaxed text-[#24406e]">
            <span className="mr-2 inline-flex rounded-full bg-white px-2 py-0.5 text-[11px] font-bold tracking-wide text-[var(--sending-blue)] uppercase">Demo</span>
            Sample groups for preview. They are not live meetings and do not take reservations.
          </p>
        ) : null}
        {notice ? <p className="mb-3 px-1 text-sm text-[#9a3412]">{notice}</p> : null}
        <div className="grid gap-4 lg:grid-cols-[minmax(280px,380px)_minmax(0,1fr)] lg:gap-5">
          <div className="order-1 max-h-[640px] space-y-3 overflow-auto pr-1 lg:order-none">
            {visible.length === 0 ? (
              <div className="rounded-2xl border border-[#d5deea] bg-[#f8fafc] px-5 py-10 text-center">
                <p className="text-xl font-semibold tracking-tight text-[#142033]">
                  {groups.length === 0
                    ? "Be the first to start a group in Nashville."
                    : "No groups in that search yet."}
                </p>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[#52627a]">
                  {groups.length === 0
                    ? "Approved groups appear here with a photo pin on the map."
                    : "Try Nashville, Franklin, Brentwood, or another city."}
                </p>
                <Link
                  href="/start"
                  className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--sending-blue)] px-5 text-sm font-semibold text-white"
                >
                  Start a Group
                  <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              visible.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(group.id);
                    document.getElementById("groups-map")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left ${
                    selectedId === group.id ? "border-[var(--sending-blue)] bg-[#f3f7ff] shadow-sm" : "border-[#e6ebf2] bg-white"
                  }`}
                >
                  <LeaderPhoto group={group} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-semibold">{group.name}</span>
                      {group.is_demo ? (
                        <span className="shrink-0 rounded-full bg-[#e7f0ff] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[var(--sending-blue)] uppercase">
                          Demo
                        </span>
                      ) : null}
                    </span>
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
                </button>
              ))
            )}
          </div>
          <div id="groups-map" className="order-2 h-[420px] overflow-hidden rounded-2xl border border-[#e6ebf2] lg:order-none lg:h-[640px]">
            <GroupsMap groups={visible} focus={place} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
        </div>
        <p className="mt-3 px-1 text-xs leading-relaxed text-[#6d7b90]">
          Home groups show an approximate area. The exact address is shared after the leader confirms a real request.
          {groups.some((group) => !group.is_demo)
            ? ` ${new Set(groups.filter((group) => !group.is_demo).map((group) => placeLabel(group))).size} live ${groups.filter((group) => !group.is_demo).length === 1 ? "place" : "places"} on the map.`
            : ""}
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
      <img src={group.leader_photo_url} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover" />
    );
  }
  return (
    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[var(--sending-blue)] text-sm font-semibold text-white">
      {group.leader_name.slice(0, 1).toUpperCase()}
    </span>
  );
}
