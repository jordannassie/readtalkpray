"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Calendar, ChevronLeft, MapPin } from "lucide-react";
import { JoinGroupForm } from "@/components/groups/JoinGroupForm";
import { distanceKm } from "@/lib/groups/geo";
import { meetingWhen, type PublicGroup } from "@/lib/groups/types";

const GroupsMap = dynamic(() => import("@/components/home/GroupsMap").then((mod) => mod.GroupsMap), {
  ssr: false,
  loading: () => <div className="h-full min-h-[260px] animate-pulse bg-[#e7eef8] md:min-h-[640px]" />,
});

type Place = { latitude: number; longitude: number; label: string };

export function GroupFinder({ groups }: { groups: PublicGroup[] }) {
  const [query, setQuery] = useState("");
  const [place, setPlace] = useState<Place | null>(null);
  const [searching, setSearching] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(groups[0]?.id ?? null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [formEpoch, setFormEpoch] = useState(0);
  const [notice, setNotice] = useState("");
  const [mounted, setMounted] = useState(false);

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text && !place) return groups;
    return groups.filter((group) => {
      const haystack = `${group.name} ${group.city} ${group.state ?? ""} ${group.country} ${group.public_location} ${group.meeting_day ?? ""} ${group.meeting_time ?? ""}`.toLowerCase();
      if (text && haystack.includes(text)) return true;
      if (place && distanceKm(place, group) <= 32) return true;
      return false;
    });
  }, [groups, query, place]);

  const selected = visible.find((group) => group.id === selectedId) ?? groups.find((group) => group.id === selectedId) ?? null;

  const selectGroup = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const findAnother = useCallback(() => {
    setSheetOpen(false);
    setFormEpoch((value) => value + 1);
  }, []);

  const joinGroup = useCallback((id: string) => {
    setSelectedId(id);
    setSheetOpen(true);
    if (window.matchMedia("(min-width: 1024px)").matches) {
      document.getElementById("group-panel")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!sheetOpen || !window.matchMedia("(max-width: 1023px)").matches) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSheetOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [sheetOpen]);

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
    } catch {
      setNotice("Search is unavailable right now.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div id="join" className="scroll-mt-28 bg-[#f4f7fb]">
      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-5 sm:py-10">
        <div id="groups" className="scroll-mt-28">
          <h2 className="text-3xl font-semibold tracking-tight text-[#142033] sm:text-4xl">{place ? `Find a Group near ${place.label}` : "Find a Group in Nashville"}</h2>
          <p className="mt-2 max-w-2xl text-base text-[#52627a] sm:text-lg">Read the Bible. Talk about it. Pray together. Any day, any time. About one hour.</p>
        </div>

        <section className="mt-5 rounded-[28px] bg-[#f7f9fc] p-3 sm:p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,35%)_minmax(0,35%)_minmax(0,30%)] lg:items-stretch">
            <div className="order-1 flex min-w-0 flex-col rounded-[22px] bg-white p-3 shadow-sm lg:max-h-[680px]">
              <form onSubmit={onSearch}>
                <label className="sr-only" htmlFor="group-search">Search by neighborhood or city</label>
                <span className="flex h-12 items-center gap-2 rounded-full border border-[#e6ebf2] bg-[#f8fafc] px-4">
                  <MapPin size={16} className="shrink-0 text-[#1976F3]" aria-hidden />
                  <input
                    id="group-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by neighborhood or city..."
                    className="h-full w-full bg-transparent text-base outline-none placeholder:text-[#8a8a8a]"
                  />
                </span>
                <button type="submit" className="sr-only" disabled={searching}>
                  {searching ? "Searching" : "Search"}
                </button>
              </form>
              {notice ? <p className="mt-2 text-sm text-[#9a3412]">{notice}</p> : null}
              {query || place ? (
                <button
                  type="button"
                  className="mt-2 min-h-11 text-sm font-medium text-[#1976F3]"
                  onClick={() => {
                    setQuery("");
                    setPlace(null);
                    setNotice("");
                  }}
                >
                  Clear search
                </button>
              ) : null}

            <div className="mt-3 max-h-[460px] min-w-0 space-y-2 overflow-auto lg:max-h-none lg:flex-1">
              {visible.length === 0 ? (
                <div className="rounded-2xl border border-[#d5deea] bg-[#f8fafc] px-4 py-8 text-center">
                  <p className="font-semibold text-[#142033]">No groups in that search yet.</p>
                  <p className="mt-1 text-sm text-[#52627a]">Try another city, or start a group nearby.</p>
                </div>
              ) : (
                visible.map((group) => (
                  <div
                    key={group.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => selectGroup(group.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectGroup(group.id);
                      }
                    }}
                    className={`flex min-w-0 items-center gap-2.5 rounded-2xl border bg-white px-2.5 py-2 text-left ${
                      selectedId === group.id ? "border-[#1976F3] shadow-[0_0_0_1px_#1976F3]" : "border-[#e6ebf2]"
                    }`}
                  >
                    <LeaderPhoto group={group} />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold leading-snug">{group.name}</span>
                        {group.is_demo ? (
                          <span className="shrink-0 rounded-full bg-[#e7f0ff] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#1976F3] uppercase">Demo</span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 text-[13px] font-medium whitespace-nowrap text-[#142033]">
                        <Calendar size={13} className="shrink-0 text-[#1976F3]" aria-hidden />
                        {meetingWhen(group) || "Time to be announced"}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 text-sm text-[#5d6b82]">
                        <MapPin size={13} className="shrink-0 text-[#1976F3]" aria-hidden />
                        <span className="leading-snug">{group.public_location}</span>
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        joinGroup(group.id);
                      }}
                      className="inline-flex h-11 w-[84px] shrink-0 items-center justify-center rounded-full border border-[#16A34A] bg-white text-xs font-semibold whitespace-nowrap text-[#16A34A] lg:h-[34px] lg:w-[78px]"
                    >
                      {group.is_demo ? "Preview" : "Join"} →
                    </button>
                  </div>
                ))
              )}
            </div>
            </div>

            <div id="groups-map" className={`relative z-0 order-2 h-[220px] min-w-0 overflow-hidden rounded-[22px] border border-[#e6ebf2] bg-white shadow-sm isolate md:h-[320px] lg:order-2 lg:h-auto lg:min-h-[640px] ${sheetOpen ? "max-lg:hidden" : ""}`}>
              <GroupsMap groups={visible} focus={place} selectedId={selectedId} onSelect={selectGroup} />
            </div>

            <aside id="group-panel" className="order-3 hidden min-w-0 overflow-auto rounded-[22px] border border-[#e6ebf2] bg-white p-4 shadow-sm lg:block lg:max-h-[680px]">
              {selected ? (
                <JoinGroupForm key={`${selected.id}-${formEpoch}`} group={selected} variant="panel" onFindAnother={findAnother} />
              ) : (
                <div className="grid h-full min-h-48 place-items-center px-4 text-center">
                  <div>
                    <p className="text-lg font-semibold text-[#142033]">Choose a group</p>
                    <p className="mt-2 text-sm leading-relaxed text-[#52627a]">Select a card or a photo pin. The join form stays on this page.</p>
                  </div>
                </div>
              )}
            </aside>
          </div>
          <p className="mt-3 px-1 text-xs leading-relaxed text-[#6d7b90]">
            Home groups show an approximate area. The exact address is shared after the leader confirms a real request. Demo groups are examples and do not take reservations.
          </p>
        </section>

        <section className="mt-5 rounded-[28px] bg-white px-5 py-6 shadow-sm sm:flex sm:items-center sm:justify-between sm:px-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Don’t see a group near you?</h2>
            <p className="mt-2 max-w-xl text-base text-[#52627a]">Start one. All you need is a Bible and a few people. Meet any day, any time, anywhere, for about one hour.</p>
          </div>
          <Link href="/app/start" className="mt-4 inline-flex h-12 min-h-11 items-center justify-center gap-2 rounded-full bg-[#1976F3] px-5 text-sm font-semibold text-white sm:mt-0">
            Start a Group
            <ArrowRight size={16} aria-hidden />
          </Link>
        </section>
      </div>

      {mounted && sheetOpen && selected
        ? createPortal(
        <div className="fixed inset-0 z-[1300] flex h-dvh w-full flex-col overflow-hidden bg-white lg:hidden" role="dialog" aria-modal="true" aria-label="Join this group">
          <div className="flex h-14 items-center px-2">
            <button type="button" onClick={() => setSheetOpen(false)} className="inline-flex h-11 items-center gap-1 rounded-full px-2 text-sm font-semibold text-[#142033]">
              <ChevronLeft size={20} aria-hidden />
              Back
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <JoinGroupForm key={`${selected.id}-${formEpoch}`} group={selected} variant="panel" onFindAnother={findAnother} />
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}

function LeaderPhoto({ group }: { group: PublicGroup }) {
  if (group.leader_photo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={group.leader_photo_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
    );
  }
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1976F3] text-sm font-semibold text-white">
      {group.leader_name.slice(0, 1).toUpperCase()}
    </span>
  );
}
