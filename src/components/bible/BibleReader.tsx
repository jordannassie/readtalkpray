"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { bibleHref, chapterFile, chapterNeighbors, type WebVerse } from "@/lib/bible/chapter";
import { BOOKS, type BookMeta } from "@/lib/bible/books";

const SIZES = ["S", "M", "L", "XL"] as const;
type Size = (typeof SIZES)[number];
const SIZE_CLASS: Record<Size, string> = {
  S: "text-[17px]",
  M: "text-[19px]",
  L: "text-[21px]",
  XL: "text-[23px]",
};

const cache = new Map<string, WebVerse[]>();

async function loadChapter(order: number, chapter: number) {
  const key = `${order}:${chapter}`;
  const saved = cache.get(key);
  if (saved) return saved;
  const response = await fetch(chapterFile(order, chapter));
  if (!response.ok) throw new Error("missing");
  const verses = (await response.json()) as WebVerse[];
  cache.set(key, verses);
  return verses;
}

export function BibleReader({ book, chapter }: { book: BookMeta; chapter: number }) {
  const router = useRouter();
  const [verses, setVerses] = useState<WebVerse[] | null>(null);
  const [error, setError] = useState("");
  const [size, setSize] = useState<Size>("XL");
  const [speaking, setSpeaking] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const neighbors = chapterNeighbors(book, chapter);

  useEffect(() => {
    setCanSpeak("speechSynthesis" in window);
    const saved = window.localStorage.getItem("rtp-bible-size");
    if (saved === "S" || saved === "M" || saved === "L" || saved === "XL") setSize(saved);
  }, []);

  useEffect(() => {
    let alive = true;
    setError("");
    setSpeaking(false);
    setVerses(cache.get(`${book.order}:${chapter}`) ?? null);
    window.localStorage.setItem("rtp-bible-place", `${book.slug}/${chapter}`);
    loadChapter(book.order, chapter)
      .then((rows) => {
        if (alive) setVerses(rows);
      })
      .catch(() => {
        if (alive) setError("This chapter could not be loaded.");
      });
    const stops = [chapterNeighbors(book, chapter).next, chapterNeighbors(book, chapter).prev];
    for (const stop of stops) {
      const nextBook = BOOKS.find((item) => item.slug === stop?.slug);
      if (nextBook && stop) void loadChapter(nextBook.order, stop.chapter).catch(() => {});
    }
    return () => {
      alive = false;
      window.speechSynthesis?.cancel();
    };
  }, [book, chapter]);

  function chooseSize(next: Size) {
    setSize(next);
    window.localStorage.setItem("rtp-bible-size", next);
  }

  function toggleAudio() {
    if (!verses || !canSpeak) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const chunks: string[] = [];
    let current = "";
    for (const verse of verses) {
      const next = `${current} ${verse.t}`.trim();
      if (next.length > 1400) {
        if (current) chunks.push(current);
        current = verse.t;
      } else current = next;
    }
    if (current) chunks.push(current);
    let index = 0;
    const say = () => {
      if (index >= chunks.length) {
        setSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.rate = 0.95;
      utterance.onend = () => {
        index += 1;
        say();
      };
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    };
    setSpeaking(true);
    say();
  }

  return (
    <article>
      <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <PillSelect label="Book" value={book.slug} onChange={(slug) => router.push(bibleHref(slug, 1))}>
          {BOOKS.map((item) => (
            <option key={item.slug} value={item.slug}>{item.name}</option>
          ))}
        </PillSelect>
        <PillSelect label="Chapter" value={String(chapter)} onChange={(value) => router.push(bibleHref(book.slug, Number(value)))}>
          {Array.from({ length: book.chapterCount }, (_, index) => (
            <option key={index + 1} value={index + 1}>Chapter {index + 1}</option>
          ))}
        </PillSelect>
        <span className="inline-flex h-11 shrink-0 items-center rounded-full border border-[#e6e6e6] bg-white px-4 text-sm font-semibold">WEB</span>
        <PillSelect label="Text size" value={size} onChange={(value) => chooseSize(value as Size)}>
          {SIZES.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </PillSelect>
        {canSpeak ? (
          <button
            type="button"
            onClick={toggleAudio}
            aria-pressed={speaking}
            aria-label={speaking ? "Stop reading" : "Read this chapter aloud"}
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border ${speaking ? "border-[#1976F3] bg-[#1976F3] text-white" : "border-[#e6e6e6] bg-white text-[#111]"}`}
          >
            {speaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        ) : null}
      </div>

      <header className="px-1 pt-8 text-center">
        <h1 className="text-[2rem] font-semibold tracking-[-0.03em] text-[#111]">{book.name.toUpperCase()} {chapter}</h1>
        <p className="mt-1 text-sm font-medium text-[#8aa0bd]">World English Bible (WEB)</p>
      </header>

      {error ? <p className="mt-8 text-center text-sm text-[#9a3412]">{error}</p> : null}
      {verses ? (
        <p className={`mx-auto mt-8 max-w-[42rem] font-serif leading-[1.75] text-[#1c1c1c] ${SIZE_CLASS[size]}`}>
          {verses.map((verse) => (
            <span key={verse.v} id={`verse-${verse.v}`}>
              <sup className="mr-1 text-[0.62em] font-sans font-semibold text-[#98a2b3]">{verse.v}</sup>
              {verse.t}{" "}
            </span>
          ))}
        </p>
      ) : error ? null : (
        <p className="mt-8 text-center text-sm text-[#667085]">Loading chapter…</p>
      )}

      <nav className="mx-auto mt-10 flex max-w-[42rem] items-center justify-between gap-3 border-t border-[#eef2f6] pt-5" aria-label="Chapters">
        {neighbors.prev ? (
          <Link href={bibleHref(neighbors.prev.slug, neighbors.prev.chapter)} className="inline-flex h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-[#1976F3]">
            <ChevronLeft size={18} aria-hidden />
            {neighbors.prev.label}
          </Link>
        ) : <span />}
        {neighbors.next ? (
          <Link href={bibleHref(neighbors.next.slug, neighbors.next.chapter)} className="inline-flex h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-[#1976F3]">
            {neighbors.next.label}
            <ChevronRight size={18} aria-hidden />
          </Link>
        ) : <span />}
      </nav>
    </article>
  );
}

function PillSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="relative inline-flex h-11 shrink-0 items-center">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 appearance-none rounded-full border border-[#e6e6e6] bg-white pr-9 pl-4 text-sm font-medium text-[#111]"
      >
        {children}
      </select>
      <ChevronDown size={16} aria-hidden className="pointer-events-none absolute right-3 text-[#667085]" />
    </label>
  );
}
