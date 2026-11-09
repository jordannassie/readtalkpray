"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

const PROFILE_URL = "https://www.instagram.com/sending_churches/";

const REELS = [
  { code: "DN0pV9F3Nvy", videoHeight: 506 },
  { code: "DN0ooUFXL7B", videoHeight: 506 },
  { code: "DN0oNKD3Ef_", videoHeight: 506 },
  { code: "DFeMYngvw3j", videoHeight: 228 },
  { code: "C2OO1rNvN4X", videoHeight: 506 },
] as const;

const EMBED_WIDTH = 385;
const VIDEO_TOP = 54;
const CARD_WIDTH = 230;
const CARD_HEIGHT = 288;

function reelFrame(videoHeight: number) {
  const scale = videoHeight >= 400 ? CARD_WIDTH / EMBED_WIDTH : CARD_HEIGHT / videoHeight;
  const translateX = videoHeight >= 400 ? 0 : (EMBED_WIDTH - CARD_WIDTH / scale) / 2;
  return { scale, translateX };
}

export function InstagramReels() {
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function scrollToIndex(next: number) {
    const el = scroller.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(REELS.length - 1, next));
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    const left = REELS.length <= 1 ? 0 : (clamped / (REELS.length - 1)) * max;
    el.scrollTo({ left, behavior: "smooth" });
    setIndex(clamped);
  }

  function onScroll() {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const next = max <= 0 ? 0 : Math.round((el.scrollLeft / max) * (REELS.length - 1));
    setIndex(Math.max(0, Math.min(REELS.length - 1, next)));
  }

  return (
    <section aria-labelledby="reels-heading" className="overflow-hidden bg-black text-white">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:py-16">
        <div className="flex items-center justify-between gap-4">
          <h2 id="reels-heading" className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Reels
          </h2>
          <a
            href={PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--sending-blue)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--sending-blue-hover)] active:bg-[var(--sending-blue-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Follow
            <ArrowUpRight size={16} aria-hidden />
          </a>
        </div>

        <div className="relative mt-8">
          <button
            type="button"
            onClick={() => scrollToIndex(index - 1)}
            disabled={index === 0}
            aria-label="Previous reels"
            className="absolute top-1/2 left-0 z-10 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#111] shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:pointer-events-none sm:flex"
          >
            <ChevronLeft size={20} aria-hidden />
          </button>

          <div
            ref={scroller}
            onScroll={onScroll}
            className="flex gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {REELS.map((reel, reelIndex) => {
              const frame = reelFrame(reel.videoHeight);
              return (
              <div
                key={reel.code}
                className="relative h-[288px] w-[230px] shrink-0 overflow-hidden rounded-[22px] bg-black"
              >
                <iframe
                  src={`https://www.instagram.com/reel/${reel.code}/embed`}
                  title={`Sending Churches reel ${reelIndex + 1}`}
                  loading="lazy"
                  scrolling="no"
                  className="max-w-none origin-top-left border-0"
                  style={{
                    width: EMBED_WIDTH,
                    height: 760,
                    transform: `scale(${frame.scale}) translate(${-frame.translateX}px, -${VIDEO_TOP}px)`,
                  }}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/50 text-white">
                    <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor">
                      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                    </svg>
                  </span>
                </span>
              </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollToIndex(index + 1)}
            disabled={index === REELS.length - 1}
            aria-label="Next reels"
            className="absolute top-1/2 right-0 z-10 hidden h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#111] shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:pointer-events-none sm:flex"
          >
            <ChevronRight size={20} aria-hidden />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {REELS.map((reel, dotIndex) => (
            <button
              key={reel.code}
              type="button"
              aria-label={`Show reel ${dotIndex + 1}`}
              aria-current={dotIndex === index}
              onClick={() => scrollToIndex(dotIndex)}
              className={`h-2 w-2 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                dotIndex === index ? "bg-[var(--sending-blue)]" : "bg-white/35"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
