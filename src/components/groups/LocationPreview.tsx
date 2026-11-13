"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap } from "leaflet";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return entities[char] ?? char;
  });
}

export function LocationPreview({
  latitude,
  longitude,
  photoUrl,
  name,
}: {
  latitude: number;
  longitude: number;
  photoUrl: string | null;
  name: string;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let cancelled = false;
    const node = nodeRef.current;
    if (!node) return;
    void import("leaflet").then((L) => {
      if (cancelled || !nodeRef.current) return;
      const map = mapRef.current ?? L.map(nodeRef.current, { scrollWheelZoom: false });
      if (!mapRef.current) {
        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
          attribution: "Tiles &copy; Esri",
          maxZoom: 19,
        }).addTo(map);
        mapRef.current = map;
      }
      map.eachLayer((layer) => {
        if ("getLatLng" in layer) layer.remove();
      });
      const initial = escapeHtml((name || "You").slice(0, 1).toUpperCase());
      const photo = photoUrl && photoUrl.startsWith("https://")
        ? `<img src="${escapeHtml(photoUrl)}" alt="" />`
        : `<span>${initial}</span>`;
      L.marker([latitude, longitude], {
        icon: L.divIcon({
          className: "rtp-pin-icon",
          html: `<div class="rtp-pin">${photo}</div>`,
          iconSize: [52, 52],
          iconAnchor: [26, 26],
        }),
      }).addTo(map);
      map.setView([latitude, longitude], 13);
      window.setTimeout(() => map.invalidateSize(), 0);
    });
    return () => {
      cancelled = true;
    };
  }, [latitude, longitude, photoUrl, name]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={nodeRef} className="rtp-map h-56 w-full overflow-hidden rounded-3xl" aria-label="Meeting location preview" />;
}
