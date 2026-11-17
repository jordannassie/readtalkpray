"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Marker } from "leaflet";
import type { PublicGroup } from "@/lib/groups/types";

type Focus = { latitude: number; longitude: number; label: string } | null;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return entities[char] ?? char;
  });
}

function photoSrc(url: string | null) {
  if (!url) return null;
  if (/^\/demo\/leaders\/[a-z0-9.-]+$/.test(url)) return url;
  if (url.startsWith("https://")) return url;
  return null;
}

function pinFace(name: string, url: string | null) {
  const src = photoSrc(url);
  const initial = escapeHtml(name.slice(0, 1).toUpperCase() || "•");
  return src ? `<img src="${escapeHtml(src)}" alt="" />` : `<span>${initial}</span>`;
}

function pinHtml(group: PublicGroup) {
  if (!group.co_leader_name) return `<div class="rtp-pin">${pinFace(group.leader_name, group.leader_photo_url)}</div>`;
  return `<div class="rtp-pin rtp-pin-pair">${pinFace(group.leader_name, group.leader_photo_url)}${pinFace(group.co_leader_name, group.co_leader_photo_url ?? null)}</div>`;
}

export function GroupsMap({
  groups,
  focus,
  userLocation,
  selectedId,
  onSelect,
}: {
  groups: PublicGroup[];
  focus: Focus;
  userLocation?: Focus;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const userMarkerRef = useRef<Marker | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const node = nodeRef.current;
    if (!node) return;

    void import("leaflet").then((L) => {
      if (cancelled || !nodeRef.current || mapRef.current) return;
      const map = L.map(nodeRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
      }).setView([36.1627, -86.7816], 11);
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ",
        maxZoom: 19,
      }).addTo(map);
      window.setTimeout(() => map.invalidateSize(), 0);
      mapRef.current = map;
      setReady(true);
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    let cancelled = false;
    void import("leaflet").then((L) => {
      if (cancelled || mapRef.current !== map) return;
      markersRef.current.forEach((marker) => marker.remove());
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      markersRef.current = groups.map((group) => {
        const pair = Boolean(group.co_leader_name);
        const marker = L.marker([group.latitude, group.longitude], {
          icon: L.divIcon({
            className: "rtp-pin-icon",
            html: pinHtml(group),
            iconSize: pair ? [76, 46] : [52, 52],
            iconAnchor: pair ? [38, 23] : [26, 26],
          }),
          keyboard: true,
          title: group.name,
          zIndexOffset: group.is_demo ? 0 : 1000,
        });
        marker.on("click", () => onSelect(group.id));
        marker.addTo(map);
        return marker;
      });

      const latitudes = groups.map((group) => group.latitude);
      const longitudes = groups.map((group) => group.longitude);
      const latSpan = latitudes.length ? Math.max(...latitudes) - Math.min(...latitudes) : 0;
      const lngSpan = longitudes.length ? Math.max(...longitudes) - Math.min(...longitudes) : 0;
      const clustered = latSpan < 0.35 && lngSpan < 0.35;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (userLocation) {
        const marker = L.marker([userLocation.latitude, userLocation.longitude], {
          icon: L.divIcon({
            className: "rtp-user-icon",
            html: `<div class="rtp-user-pin"><span></span></div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          }),
          keyboard: false,
          interactive: false,
          zIndexOffset: 800,
          title: "Your location",
        });
        marker.addTo(map);
        userMarkerRef.current = marker;
        const points: [number, number][] = [[userLocation.latitude, userLocation.longitude], ...groups.map((group) => [group.latitude, group.longitude] as [number, number])];
        if (groups.length) map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 13, animate: !reduceMotion });
        else map.setView([userLocation.latitude, userLocation.longitude], 12);
      } else if (focus) {
        map.flyTo([focus.latitude, focus.longitude], 11, { duration: reduceMotion ? 0 : 0.6 });
      } else if (groups.length === 1) {
        map.setView([groups[0].latitude, groups[0].longitude], 12);
      } else if (groups.length > 1 && clustered) {
        map.fitBounds(L.latLngBounds(groups.map((group) => [group.latitude, group.longitude])), { padding: [48, 48], maxZoom: 12, animate: !reduceMotion });
      } else {
        map.setView([36.1, -86.78], 11);
      }

      const selected = groups.find((group) => group.id === selectedId);
      const selectedMarker = markersRef.current[groups.findIndex((group) => group.id === selectedId)];
      markersRef.current.forEach((marker, index) => {
        marker.getElement()?.classList.toggle("rtp-pin-selected", groups[index]?.id === selectedId);
      });
      if (!userLocation && selected && selectedMarker) {
        map.flyTo([selected.latitude, selected.longitude], Math.max(map.getZoom(), 12), { duration: reduceMotion ? 0 : 0.35 });
      }
      window.setTimeout(() => map.invalidateSize(), 50);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, groups, focus, userLocation, selectedId, onSelect]);

  useEffect(() => {
    const onResize = () => mapRef.current?.invalidateSize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [ready]);

  return <div ref={nodeRef} className="rtp-map h-full w-full" />;
}
