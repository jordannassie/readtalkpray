"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { HERO_VIDEO, STAR_VISIT_IMAGE } from "@/lib/demo/data";

function SpeakerOffIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M4 9.5h3.2L12 5.8v12.4L7.2 14.5H4V9.5Z" fill="white" />
      <path
        d="m15.2 9.2 5.6 5.6M20.8 9.2l-5.6 5.6"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SpeakerOnIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M4 9.5h3.2L12 5.8v12.4L7.2 14.5H4V9.5Z" fill="white" />
      <path
        d="M15.2 8.8c1.4 1.5 1.4 4.9 0 6.4M17.8 6.6c2.5 2.6 2.5 8.2 0 10.8"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StarVisit() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const start = () => {
      void video.play().catch(() => {});
    };
    start();
    video.addEventListener("canplay", start);
    return () => video.removeEventListener("canplay", start);
  }, []);

  function applyMuted(nextMuted: boolean) {
    const video = videoRef.current;
    if (!video) return;
    video.muted = nextMuted;
    setMuted(nextMuted);
    if (!nextMuted) void video.play();
  }

  function toggleSound() {
    const nextMuted = !muted;
    setPinned(!nextMuted);
    applyMuted(nextMuted);
  }

  return (
    <section aria-label="The Star in Frisco" className="relative bg-[#111]">
      <Image
        src={STAR_VISIT_IMAGE}
        alt="A couple standing outside The Star in Frisco"
        width={1672}
        height={941}
        sizes="100vw"
        className="h-auto w-full"
      />
      <div className="px-5 pt-4 pb-6 lg:pointer-events-none lg:absolute lg:inset-0 lg:flex lg:items-center lg:justify-end lg:px-8 lg:py-8 xl:px-12">
        <div className="pointer-events-auto relative mx-auto w-full max-w-[520px] overflow-hidden rounded-[24px] bg-black shadow-[0_22px_60px_rgba(0,0,0,0.35)] lg:mx-0 lg:w-[min(34vw,440px)]">
          <video
            ref={videoRef}
            src={HERO_VIDEO}
            className="aspect-video w-full bg-black object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-label="Sending Church video"
          />
          <button
            type="button"
            onClick={toggleSound}
            onMouseEnter={() => applyMuted(false)}
            onMouseLeave={() => {
              if (!pinned) applyMuted(true);
            }}
            className={`absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-full ${
              muted ? "bg-[#ff2d2d]" : "bg-[#22c55e]"
            }`}
            aria-label={muted ? "Turn sound on" : "Turn sound off"}
          >
            {muted ? <SpeakerOffIcon /> : <SpeakerOnIcon />}
          </button>
        </div>
      </div>
    </section>
  );
}
