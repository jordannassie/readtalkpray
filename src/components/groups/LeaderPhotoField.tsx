"use client";

import { Camera, User } from "lucide-react";
import { PointerEvent, useEffect, useRef, useState } from "react";

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];
const PREVIEW = 160;

export function LeaderPhotoField({ onChange }: { onChange: (file: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number; moved: boolean; current: { x: number; y: number } } | null>(null);
  const [box, setBox] = useState(PREVIEW);
  const [preview, setPreview] = useState<string | null>(null);
  const [natural, setNatural] = useState({ w: 1, h: 1 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [error, setError] = useState("");

  async function renderFile(nextOffset: { x: number; y: number }, nextScale: number, image = imageRef.current) {
    if (!image) {
      onChange(null);
      return;
    }
    const size = 512;
    const ratio = size / box;
    const cover = Math.max(size / image.naturalWidth, size / image.naturalHeight);
    const width = image.naturalWidth * cover * nextScale;
    const height = image.naturalHeight * cover * nextScale;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(
      image,
      (size - width) / 2 + nextOffset.x * ratio,
      (size - height) / 2 + nextOffset.y * ratio,
      width,
      height,
    );
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    if (!blob) return;
    onChange(new File([blob], "leader.jpg", { type: "image/jpeg" }));
  }

  function choose(file: File | null) {
    setError("");
    if (!file) return;
    if (!ACCEPT.includes(file.type)) {
      setError("Use a JPG, PNG, or WebP photo.");
      return;
    }
    if (file.size > 8_000_000) {
      setError("Choose a photo under 8 MB. It will be resized before it is saved.");
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      imageRef.current = image;
      const next = { x: 0, y: 0 };
      setNatural({ w: image.naturalWidth, h: image.naturalHeight });
      setOffset(next);
      setScale(1);
      setPreview(url);
      void renderFile(next, 1, image);
    };
    image.src = url;
  }

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const update = () => setBox(node.clientWidth || PREVIEW);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!preview) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y, moved: false, current: offset };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const point = {
      x: drag.current.ox + event.clientX - drag.current.x,
      y: drag.current.oy + event.clientY - drag.current.y,
    };
    if (Math.abs(event.clientX - drag.current.x) + Math.abs(event.clientY - drag.current.y) > 4) {
      drag.current.moved = true;
    }
    drag.current.current = point;
    setOffset(point);
  }

  function onPointerUp() {
    const moved = drag.current?.moved;
    const point = drag.current?.current ?? offset;
    drag.current = null;
    if (moved) {
      void renderFile(point, scale);
      return;
    }
    inputRef.current?.click();
  }

  const cover = Math.max(box / natural.w, box / natural.h);
  const width = natural.w * cover * scale;
  const height = natural.h * cover * scale;

  return (
    <div className="flex flex-col items-center text-center">
      <div ref={frameRef} className="relative h-[130px] w-[130px] sm:h-40 sm:w-40">
        <div
          className="relative grid h-full w-full cursor-pointer place-items-center overflow-hidden rounded-full bg-[#e7e7e7] text-[#9aa3b2]"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          role="button"
          tabIndex={0}
          aria-label={preview ? "Move or replace your profile photo" : "Add your profile photo"}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
          }}
        >
          {preview ? (
            // The preview is the photo the leader just chose.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              draggable={false}
              className="pointer-events-none absolute max-w-none"
              style={{
                width,
                height,
                left: (box - width) / 2 + offset.x,
                top: (box - height) / 2 + offset.y,
              }}
            />
          ) : (
            <User size={48} />
          )}
        </div>
        <button
          type="button"
          className="absolute right-0 bottom-0 grid h-9 w-9 place-items-center rounded-full bg-[var(--sending-blue)] text-white shadow-md sm:right-1 sm:bottom-1"
          onClick={() => inputRef.current?.click()}
          aria-label="Choose a profile photo"
        >
          <Camera size={16} />
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => {
          choose(event.target.files?.[0] ?? null);
          event.target.value = "";
        }}
      />
      <p className="mt-3 text-sm font-semibold">Add your profile photo</p>
      <p className="mt-1 max-w-xs text-sm text-[#667085]">Help people recognize you when joining your group.</p>
      {preview ? (
        <label className="mt-3 flex w-full max-w-[220px] items-center gap-2 text-xs text-[#667085]">
          Zoom
          <input
            type="range"
            min={1}
            max={2.4}
            step={0.05}
            value={scale}
            aria-label="Zoom profile photo"
            onChange={(event) => {
              const next = Number(event.target.value);
              setScale(next);
              void renderFile(offset, next);
            }}
          />
        </label>
      ) : null}
      {error ? <p className="mt-2 text-sm text-[#c2410c]">{error}</p> : null}
    </div>
  );
}
