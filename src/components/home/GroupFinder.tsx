"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Calendar, Check, ChevronLeft, Loader2, LocateFixed, MapPin, Search, X } from "lucide-react";
import { GroupMembersDisplay } from "@/components/groups/GroupMembersDisplay";
import { JoinGroupForm } from "@/components/groups/JoinGroupForm";
import { LeaderFaces } from "@/components/groups/LeaderFaces";
import { formatMiles, groupsByDistance, SEARCH_RADII, widerRadius, type SearchRadius } from "@/lib/groups/nearby";
import { cityState, leaderLine, meetingWhen, type PublicGroup } from "@/lib/groups/types";

const GroupsMap = dynamic(() => import("@/components/home/GroupsMap").then((mod) => mod.GroupsMap), {
  ssr: false,
  loading: () => <div className="h-full min-h-[260px] animate-pulse bg-[#e7eef8] md:min-h-[640px]" />,
});

type Place = { latitude: number; longitude: number; label: string };

export function GroupFinder({ groups, samplePreview = false }: { groups: PublicGroup[]; samplePreview?: boolean }) {
  const [query, setQuery] = useState("");
  const [place, setPlace] = useState<Place | null>(null);
  const [located, setLocated] = useState<Place | null>(null);
  const [radius, setRadius] = useState<SearchRadius>(25);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [searching, setSearching] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(groups[0]?.id ?? null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [formEpoch, setFormEpoch] = useState(0);
  const [notice, setNotice] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const locateRequest = useRef(0);

  const listed = useMemo(() => {
    const text = query.trim().toLowerCase();
    const matchesText = (group: PublicGroup) => {
      const haystack = `${group.name} ${group.city} ${group.state ?? ""} ${group.country} ${group.public_location} ${group.meeting_day ?? ""} ${group.meeting_time ?? ""}`.toLowerCase();
      return haystack.includes(text);
    };
    const origin = located ?? place;
    if (origin) {
      const ranked = groupsByDistance(groups, origin, radius);
      const filtered = located && text ? ranked.filter((item) => matchesText(item.group)) : ranked;
      return filtered.map((item) => ({ group: item.group, km: item.km }));
    }
    const matched = text ? groups.filter(matchesText) : groups;
    return matched.map((group) => ({ group, km: null as number | null }));
  }, [groups, query, place, located, radius]);

  const visible = listed.map((item) => item.group);
  const selected = visible.find((group) => group.id === selectedId) ?? null;

  function clearSearch() {
    locateRequest.current += 1;
    setQuery("");
    setPlace(null);
    setLocated(null);
    setLocating(false);
    setLocationError("");
    setLocationNote("");
    setNotice("");
  }

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
    if (!visible.length) return;
    if (visible.some((group) => group.id === selectedId)) return;
    setSelectedId(visible[0].id);
  }, [visible, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || showMap) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setShowMap(true);
    }, { rootMargin: "240px" });
    observer.observe(map);
    return () => observer.disconnect();
  }, [showMap]);

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

  function expandTo50() {
    const next = widerRadius(radius);
    if (next) setRadius(next);
  }

  async function useMyLocation() {
    const request = ++locateRequest.current;
    setLocationError("");
    setNotice("");
    if (!navigator.geolocation) {
      setLocationError("Location unavailable. Search by city or ZIP code.");
      return;
    }
    setLocating(true);
    setShowMap(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 60000,
        });
      });
      if (request !== locateRequest.current) return;
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        setLocationError("Location unavailable. Search by city or ZIP code.");
        return;
      }
      const origin = { latitude, longitude, label: "" };
      setPlace(null);
      setLocated(origin);
      setLocationNote("Finding groups near you...");
      const closest = groupsByDistance(groups, origin, radius)[0]?.group.id ?? null;
      setSelectedId(closest);
      window.setTimeout(() => {
        if (request === locateRequest.current) setLocationNote("");
      }, 1600);
      try {
        const response = await fetch(`/api/places?reverse=1&lat=${latitude.toFixed(2)}&lng=${longitude.toFixed(2)}`);
        const body = (await response.json()) as { label?: string };
        if (request !== locateRequest.current || !response.ok || !body.label) return;
        setLocated({ latitude, longitude, label: body.label });
      } catch {
        // The city label is optional. The nearby search already used the device coordinates.
      }
    } catch {
      if (request !== locateRequest.current) return;
      setLocationError("Location unavailable. Search by city or ZIP code.");
    } finally {
      if (request === locateRequest.current) setLocating(false);
    }
  }

  async function onSearch(event: FormEvent) {
    event.preventDefault();
    const next = query.trim();
    setNotice("");
    if (next.length < 2) {
      setPlace(null);
      return;
    }
    locateRequest.current += 1;
    setLocating(false);
    setLocated(null);
    setLocationError("");
    setLocationNote("");
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
        <div id="groups" className="scroll-mt-28 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-[#142033] sm:text-5xl">Find a Bible Group</h2>
          <p className="mt-2 text-sm text-[#52627a] sm:text-base">Find people reading the Bible together near you.</p>
          <form onSubmit={onSearch} className="mx-auto mt-4 w-full max-w-[1080px]">
            <label className="sr-only" htmlFor="group-search">Search city, ZIP code, or neighborhood</label>
            <div className="flex h-14 items-center gap-3 rounded-full border border-[#c5daf8] bg-white px-5 shadow-sm focus-within:border-[#1976F3] focus-within:shadow-[0_0_0_4px_rgba(25,118,243,0.16)] sm:h-16">
              <Search size={20} className="shrink-0 text-[#1976F3]" aria-hidden />
              <input
                id="group-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search city, ZIP code, or neighborhood..."
                className="h-full w-full bg-transparent text-base outline-none placeholder:text-[#8a8a8a]"
              />
              {query || place || located ? (
                <button type="button" onClick={clearSearch} aria-label="Clear search" className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-[#52627a]">
                  <X size={18} aria-hidden />
                </button>
              ) : null}
            </div>
            <button type="submit" className="sr-only" disabled={searching}>
              {searching ? "Searching" : "Search"}
            </button>
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              aria-busy={locating}
              className={`mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-white transition duration-200 active:scale-[0.98] disabled:cursor-wait motion-reduce:transform-none ${located && !locating ? "bg-[#15803d]" : "bg-[#1976F3] hover:bg-[#1565d8]"}`}
            >
              {locating ? <Loader2 size={18} className="animate-spin motion-reduce:animate-none" aria-hidden /> : located ? <Check size={18} aria-hidden /> : <LocateFixed size={18} aria-hidden />}
              {locating ? "Finding Your Location..." : located?.label || (located ? "Location found" : "Use My Current Location")}
            </button>
            <p className="mt-2 inline-flex items-center justify-center gap-1.5 text-xs text-[#6d7b90]">
              <LocateFixed size={13} aria-hidden />
              Find nearby groups automatically
            </p>
            <div role="radiogroup" aria-label="Distance" className="mx-auto mt-3 flex max-w-lg rounded-full border border-[#d5e3f5] bg-white p-1">
              {SEARCH_RADII.map((miles) => {
                const selectedRadius = radius === miles;
                return (
                  <button
                    key={miles}
                    type="button"
                    role="radio"
                    aria-checked={selectedRadius}
                    onClick={() => setRadius(miles)}
                    className={`h-11 min-w-0 flex-1 rounded-full px-1 text-xs font-semibold whitespace-nowrap transition duration-200 motion-reduce:transition-none sm:text-sm ${selectedRadius ? "bg-[#1976F3] text-white" : "text-[#52627a] hover:text-[#142033]"}`}
                  >
                    {miles} miles
                  </button>
                );
              })}
            </div>
            {locationError || locationNote || notice ? (
              <p aria-live="polite" className={`mt-2 text-sm ${locationError || notice ? "text-[#9a3412]" : "text-[#52627a]"}`}>
                {locationError || locationNote || notice}
              </p>
            ) : null}
          </form>
        </div>

        {samplePreview ? <p className="mt-4 rounded-2xl bg-[#e7f0ff] px-4 py-3 text-sm font-semibold text-[#1565d8]">Preview — Sample Groups</p> : null}
        <section className="mt-6 rounded-[28px] bg-[#f7f9fc] p-3 sm:p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,35%)_minmax(0,35%)_minmax(0,30%)] lg:items-stretch">
            <div className="order-1 flex min-w-0 flex-col rounded-[22px] bg-white p-3 shadow-sm lg:max-h-[680px]">
            <div className="max-h-[460px] min-w-0 space-y-2 overflow-auto lg:max-h-none lg:flex-1">
              {visible.length === 0 ? (
                <div className="rounded-2xl border border-[#d5deea] bg-[#f8fafc] px-4 py-8 text-center">
                  {(located || place) && !(located && query.trim()) ? (
                    <>
                      <p className="font-semibold text-[#142033]">No Bible Groups found within {radius} miles.</p>
                      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                        {widerRadius(radius) ? (
                          <button type="button" onClick={expandTo50} className="inline-flex h-11 items-center justify-center rounded-full bg-[#1976F3] px-4 text-sm font-semibold text-white transition duration-200 active:scale-[0.98] motion-reduce:transform-none">
                            Expand to 50 Miles
                          </button>
                        ) : (
                          <Link href="/app/start" className="inline-flex h-11 items-center justify-center rounded-full bg-[#1976F3] px-4 text-sm font-semibold text-white">
                            Start a Group
                          </Link>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-[#142033]">No groups in that search yet.</p>
                      <p className="mt-1 text-sm text-[#52627a]">Try another city, or start a group nearby.</p>
                    </>
                  )}
                </div>
              ) : (
                listed.map((item) => {
                  const group = item.group;
                  return (
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
                    <LeaderFaces leaderName={group.leader_name} leaderPhoto={group.leader_photo_url} coLeaderName={group.co_leader_name} coLeaderPhoto={group.co_leader_photo_url} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="line-clamp-2 font-semibold leading-snug">{group.name}</span>
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 text-[13px] font-medium whitespace-nowrap text-[#142033]">
                        <Calendar size={13} className="shrink-0 text-[#1976F3]" aria-hidden />
                        {meetingWhen(group) || "Time to be announced"}
                      </span>
                      <span className="mt-0.5 flex min-w-0 items-center gap-1 text-sm text-[#5d6b82]">
                        <MapPin size={13} className="shrink-0 text-[#1976F3]" aria-hidden />
                        <span className="truncate">{cityState(group) || group.public_location}</span>
                        {item.km != null ? <span className="shrink-0 font-semibold text-[#1976F3]">{formatMiles(item.km, group.location_type === "home")}</span> : null}
                      </span>
                      {typeof group.members === "number" ? (
                        <span className="mt-1 block">
                          <GroupMembersDisplay groupId={group.id} count={group.members} compact live={!group.is_demo} />
                        </span>
                      ) : null}
                      <span className="mt-0.5 block truncate text-xs text-[#52627a]">Led by {leaderLine(group)}</span>
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
                );
                })
              )}
            </div>
            </div>

            <div ref={mapRef} id="groups-map" className={`relative z-0 order-2 h-[220px] min-w-0 overflow-hidden rounded-[22px] border border-[#e6ebf2] bg-white shadow-sm isolate md:h-[320px] lg:order-2 lg:h-auto lg:min-h-[640px] ${sheetOpen ? "max-lg:hidden" : ""}`}>
              {showMap ? <GroupsMap groups={visible} focus={located ?? place} userLocation={located} selectedId={selectedId} onSelect={selectGroup} /> : <div className="h-full min-h-[220px] animate-pulse bg-[#e7eef8] md:min-h-[320px]" />}
            </div>

            <aside id="group-panel" className="order-3 hidden min-w-0 overflow-auto rounded-[22px] border border-[#e6ebf2] bg-white p-4 shadow-sm lg:block lg:max-h-[680px]">
              {selected ? (
                <JoinGroupForm key={`${selected.id}-${formEpoch}`} group={selected} variant="panel" faces="profile" onFindAnother={findAnother} />
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
            Home groups show an approximate area. The exact address is shared after the leader confirms a real request.
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
            <JoinGroupForm key={`${selected.id}-${formEpoch}`} group={selected} variant="panel" faces="profile" onFindAnother={findAnother} />
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}

