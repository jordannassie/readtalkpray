"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Marker } from "leaflet";
import { meetingWhen, type PublicGroup } from "@/lib/groups/types";

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

function pinHtml(group: PublicGroup) {
  const initial = escapeHtml(group.leader_name.slice(0, 1).toUpperCase() || "•");
  const src = photoSrc(group.leader_photo_url);
  const photo = src ? `<img src="${escapeHtml(src)}" alt="" />` : `<span>${initial}</span>`;
  return `<div class="rtp-pin">${photo}<i></i></div>`;
}

export function GroupsMap({
  groups,
  focus,
  selectedId,
  onSelect,
}: {
  groups: PublicGroup[];
  focus: Focus;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
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
      markersRef.current = groups.map((group) => {
        const marker = L.marker([group.latitude, group.longitude], {
          icon: L.divIcon({
            className: "rtp-pin-icon",
            html: pinHtml(group),
            iconSize: [58, 72],
            iconAnchor: [29, 68],
            popupAnchor: [0, -60],
          }),
          keyboard: true,
          title: group.name,
        });
        const where = meetingWhen(group);
        const place = group.location_type === "home" ? `${group.public_location} · approximate area` : group.public_location;
        const badge = group.is_demo ? `<span class="rtp-demo">Demo</span>` : "";
        const action = group.is_demo
          ? `<a href="/groups/${encodeURIComponent(group.id)}">View demo group</a>`
          : `<a href="/groups/${encodeURIComponent(group.id)}">Join Group</a>`;
        marker.bindPopup(
          `<div class="rtp-popup">${badge}<strong>${escapeHtml(group.name)}</strong><p>${escapeHtml(group.leader_name)}</p><p>${escapeHtml(where)}</p><p>${escapeHtml(place)}</p>${action}</div>`,
        );
        marker.on("click", () => onSelect(group.id));
        marker.addTo(map);
        return marker;
      });

      const latitudes = groups.map((group) => group.latitude);
      const longitudes = groups.map((group) => group.longitude);
      const latSpan = latitudes.length ? Math.max(...latitudes) - Math.min(...latitudes) : 0;
      const lngSpan = longitudes.length ? Math.max(...longitudes) - Math.min(...longitudes) : 0;
      const clustered = latSpan < 0.35 && lngSpan < 0.35;

      if (focus) {
        map.flyTo([focus.latitude, focus.longitude], 11, { duration: 0.6 });
      } else if (groups.length === 1) {
        map.setView([groups[0].latitude, groups[0].longitude], 12);
      } else if (groups.length > 1 && clustered) {
        map.fitBounds(L.latLngBounds(groups.map((group) => [group.latitude, group.longitude])), { padding: [48, 48], maxZoom: 12 });
      } else {
        map.setView([36.1, -86.78], 11);
      }

      const selected = groups.find((group) => group.id === selectedId);
      const selectedMarker = markersRef.current[groups.findIndex((group) => group.id === selectedId)];
      if (selected && selectedMarker) {
        map.flyTo([selected.latitude, selected.longitude], Math.max(map.getZoom(), 12), { duration: 0.4 });
        selectedMarker.openPopup();
      }
      window.setTimeout(() => map.invalidateSize(), 50);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, groups, focus, selectedId, onSelect]);

  useEffect(() => {
    const onResize = () => mapRef.current?.invalidateSize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [ready]);

  return <div ref={nodeRef} className="rtp-map h-full w-full" />;
}
