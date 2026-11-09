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

function pinHtml(group: PublicGroup) {
  const initial = escapeHtml(group.leader_name.slice(0, 1).toUpperCase() || "•");
  const photo = group.leader_photo_url?.startsWith("https://")
    ? `<img src="${escapeHtml(group.leader_photo_url)}" alt="" />`
    : `<span>${initial}</span>`;
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
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);
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
            iconSize: [52, 64],
            iconAnchor: [26, 60],
            popupAnchor: [0, -54],
          }),
          keyboard: true,
          title: group.name,
        });
        const where = meetingWhen(group);
        const place = group.location_type === "home" ? `${group.public_location} · approximate area` : group.public_location;
        marker.bindPopup(
          `<div class="rtp-popup"><strong>${escapeHtml(group.name)}</strong><p>${escapeHtml(where)}</p><p>${escapeHtml(place)}</p><a href="/groups/${group.id}">Join Group</a></div>`,
        );
        marker.on("click", () => onSelect(group.id));
        marker.addTo(map);
        return marker;
      });

      if (focus) {
        map.flyTo([focus.latitude, focus.longitude], 11, { duration: 0.6 });
      } else if (groups.length === 1) {
        map.setView([groups[0].latitude, groups[0].longitude], 12);
      } else if (groups.length > 1) {
        map.fitBounds(L.latLngBounds(groups.map((group) => [group.latitude, group.longitude])), { padding: [40, 40], maxZoom: 12 });
      } else {
        map.setView([36.1627, -86.7816], 11);
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

  return <div ref={nodeRef} className="h-full min-h-[320px] w-full" />;
}
