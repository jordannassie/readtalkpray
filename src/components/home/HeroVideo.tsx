"use client";

import { useEffect, useRef, useState } from "react";
import { HERO_VIDEO } from "@/lib/demo/data";

function SpeakerOffIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M4 9.5h3.2L12 5.8v12.4L7.2 14.5H4V9.5Z"
        fill="white"
      />
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

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMutedState] = useState(true);
  const [pinned, setPinned] = useState(false);
  const [needsPlay, setNeedsPlay] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const start = () => {
      void video.play().then(() => setNeedsPlay(false)).catch(() => setNeedsPlay(true));
    };
    start();
    video.addEventListener("canplay", start);
    return () => video.removeEventListener("canplay", start);
  }, []);

  function applyMuted(nextMuted: boolean) {
    const video = videoRef.current;
    if (!video) return;
    video.muted = nextMuted;
    setMutedState(nextMuted);
    if (!nextMuted) {
      void video.play();
    }
  }

  function toggleSound() {
    const nextMuted = !muted;
    setPinned(!nextMuted);
    applyMuted(nextMuted);
  }

  function playFromTap() {
    const video = videoRef.current;
    if (!video) return;
    void video.play().then(() => setNeedsPlay(false)).catch(() => setNeedsPlay(true));
  }

  return (
    <div
      className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-black"
      onMouseEnter={() => applyMuted(false)}
      onMouseLeave={() => {
        if (!pinned) applyMuted(true);
      }}
    >
      <video
        ref={videoRef}
        src={HERO_VIDEO}
        className="h-full w-full bg-black object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-label="Sending Church video"
      />
      {needsPlay ? (
        <button
          type="button"
          onClick={playFromTap}
          className="absolute inset-0 flex items-center justify-center bg-black/25 text-sm font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Play video
        </button>
      ) : null}
      <button
        type="button"
        onClick={toggleSound}
        className={`absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
          muted ? "bg-[#ff2d2d]" : "bg-[#22c55e]"
        }`}
        aria-label={muted ? "Turn sound on" : "Turn sound off"}
      >
        {muted ? <SpeakerOffIcon /> : <SpeakerOnIcon />}
      </button>
    </div>
  );
}
