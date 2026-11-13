"use client";

import { useEffect, useMemo, useRef } from "react";
import { MapPin, Users } from "lucide-react";
import landDots from "@/lib/globe/land-dots.json";
import { createGlobeProjection, frontAxis, isFacing, orientGlobe, projectOnGlobe } from "@/lib/globe/project";

const LAND = (landDots as [number, number][]).map(([lon, lat]) => {
  const lambda = (lon * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  return { lon, lat, x: cosPhi * Math.cos(lambda), y: Math.sin(phi), z: cosPhi * Math.sin(lambda) };
});

type City = {
  name: string;
  lat: number;
  lon: number;
  label: string;
  country?: string;
  live?: boolean;
  demo?: boolean;
};

const WORLD_CITIES: City[] = [
  { name: "Nashville", country: "United States", lat: 36.1627, lon: -86.7816, label: "Nashville" },
  { name: "New York", country: "United States", lat: 40.7128, lon: -74.006, label: "New York" },
  { name: "Los Angeles", country: "United States", lat: 34.0522, lon: -118.2437, label: "Los Angeles" },
  { name: "Mexico City", country: "Mexico", lat: 19.4326, lon: -99.1332, label: "Mexico City" },
  { name: "São Paulo", country: "Brazil", lat: -23.5558, lon: -46.6396, label: "São Paulo" },
  { name: "Buenos Aires", country: "Argentina", lat: -34.6037, lon: -58.3816, label: "Buenos Aires" },
  { name: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278, label: "London" },
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522, label: "Paris" },
  { name: "Lagos", country: "Nigeria", lat: 6.5244, lon: 3.3792, label: "Lagos" },
  { name: "Nairobi", country: "Kenya", lat: -1.2921, lon: 36.8219, label: "Nairobi" },
  { name: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357, label: "Cairo" },
  { name: "Johannesburg", country: "South Africa", lat: -26.2041, lon: 28.0473, label: "Johannesburg" },
  { name: "Istanbul", country: "Türkiye", lat: 41.0082, lon: 28.9784, label: "Istanbul" },
  { name: "Dubai", country: "United Arab Emirates", lat: 25.2048, lon: 55.2708, label: "Dubai" },
  { name: "Mumbai", country: "India", lat: 19.076, lon: 72.8777, label: "Mumbai" },
  { name: "Delhi", country: "India", lat: 28.6139, lon: 77.209, label: "Delhi" },
  { name: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198, label: "Singapore" },
  { name: "Jakarta", country: "Indonesia", lat: -6.2088, lon: 106.8456, label: "Jakarta" },
  { name: "Shanghai", country: "China", lat: 31.2304, lon: 121.4737, label: "Shanghai" },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503, label: "Tokyo" },
  { name: "Seoul", country: "South Korea", lat: 37.5665, lon: 126.978, label: "Seoul" },
  { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093, label: "Sydney" },
];

export type GlobePlace = City;

export function WorldGlobe({ places = [] }: { places?: GlobePlace[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const markers = useMemo(() => {
    const real = places.map((place) => ({ ...place, live: true }));
    const taken = new Set(real.map((place) => place.name.toLowerCase()));
    const cities = WORLD_CITIES.filter((city) => !taken.has(city.name.toLowerCase()));
    return [...real, ...cities];
  }, [places]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let frame = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const bounds = wrap.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const cityPoints = markers;
    const projection = createGlobeProjection();
    let active = 0;
    let shown = -1;
    let shownAt = 0;
    const timer = window.setInterval(() => {
      active = (active + 1) % Math.max(cityPoints.length, 1);
    }, 2200);
    const brand = getComputedStyle(document.documentElement).getPropertyValue("--sending-blue").trim() || "#2f6bff";
    const channel = brand.replace("#", "");
    const expanded = channel.length === 3 ? channel.split("").map((part) => part + part).join("") : channel;
    const red = Number.parseInt(expanded.slice(0, 2), 16);
    const green = Number.parseInt(expanded.slice(2, 4), 16);
    const blue = Number.parseInt(expanded.slice(4, 6), 16);

    const draw = (time: number) => {
      const spin = time * 0.006875;
      const radius = Math.min(width, height) * 0.44;
      const cx = width / 2;
      const cy = height / 2 + 8;
      orientGlobe(projection, cx, cy, radius, spin);

      context.clearRect(0, 0, width, height);
      context.beginPath();
      context.arc(cx, cy, radius + 1.5, 0, Math.PI * 2);
      context.strokeStyle = `rgba(${red}, ${green}, ${blue}, 0.55)`;
      context.lineWidth = 1.5;
      context.stroke();

      const axis = frontAxis(spin);
      for (const dot of LAND) {
        if (!isFacing(axis, dot.x, dot.y, dot.z)) continue;
        const point = projection([dot.lon, dot.lat]);
        if (!point) continue;
        const dx = (point[0] - cx) / radius;
        const dy = (point[1] - cy) / radius;
        const depth = Math.max(0, 1 - dx * dx - dy * dy);
        context.fillStyle = `rgba(214, 220, 228, ${0.28 + depth * 0.5})`;
        context.beginPath();
        context.arc(point[0], point[1], 0.85 + depth * 0.4, 0, Math.PI * 2);
        context.fill();
      }

      const positions = cityPoints.map((city) => {
        const point = projectOnGlobe(projection, spin, city.lon, city.lat);
        if (!point) return { visible: false, x: 0, y: 0 };
        return { visible: true, x: point[0], y: point[1] };
      });

      positions.forEach((position) => {
        if (!position.visible) return;
        context.beginPath();
        context.fillStyle = brand;
        context.arc(position.x, position.y, 4.5, 0, Math.PI * 2);
        context.fill();
      });

      let spotlight = active;
      for (let step = 0; step < positions.length; step += 1) {
        const candidate = (active + step) % positions.length;
        if (positions[candidate]?.visible) {
          spotlight = candidate;
          break;
        }
      }
      if (spotlight !== shown) {
        shown = spotlight;
        shownAt = time;
      }
      const age = Math.min(1, (time - shownAt) / 320);
      const scale = 0.84 + age * 0.16;

      cityPoints.forEach((_, index) => {
        const card = cardRefs.current[index];
        const position = positions[index];
        if (!card || !position) return;
        const on = index === spotlight && position.visible;
        const cardX = Math.min(width - 98, Math.max(98, position.x));
        const placeBelow = position.y < 92;
        const cardY = Math.min(height - 12, Math.max(12, position.y));
        card.style.opacity = on ? "1" : "0";
        card.style.transform = `translate(${cardX}px, ${cardY}px) translate(-50%, ${placeBelow ? "14px" : "-118%"}) scale(${on ? scale : 0.84})`;
      });

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(timer);
      window.removeEventListener("resize", resize);
    };
  }, [markers]);

  return (
    <section id="world" className="scroll-mt-28 overflow-x-clip bg-black">
      <div className="mx-auto grid max-w-[1320px] items-center gap-6 px-5 py-16 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:py-20">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-white/45">Around the world</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl sm:leading-[0.98]">
            Find your people.
            <span className="block">Wherever you are.</span>
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70">
            Read Talk Pray is a simple way to follow Jesus with people near you, and with groups that begin in other cities. Approved groups show up on this globe as they start meeting.
          </p>
        </div>

        <div ref={wrapRef} className="relative mx-auto h-[460px] w-full max-w-[760px] sm:h-[560px] lg:h-[640px]">
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
          {markers.map((city, index) => (
            <div
              key={`${city.name}-${index}`}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              className="pointer-events-none absolute top-0 left-0 opacity-0"
            >
              <div className="min-w-[168px] rounded-2xl bg-[#171717] px-4 py-3 text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--sending-blue-light)] text-[var(--sending-blue)]">
                    {city.live ? <Users size={14} /> : <MapPin size={14} />}
                  </span>
                  <p className="text-sm font-medium leading-snug">{city.live ? city.label : city.name}</p>
                  {city.demo ? <span className="rounded-full bg-[#e7f0ff] px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-[#1976F3] uppercase">Demo</span> : null}
                </div>
                <p className="mt-2 text-[11px] tracking-[0.14em] text-white/45 uppercase">{city.live ? city.name : city.country}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
