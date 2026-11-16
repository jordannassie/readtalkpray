"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BOOKS } from "@/lib/bible/books";
import { bibleHref } from "@/lib/bible/chapter";

export default function BibleIndexPage() {
  const router = useRouter();
  useEffect(() => {
    const saved = window.localStorage.getItem("rtp-bible-place") ?? "john/1";
    const [slug, raw] = saved.split("/");
    const book = BOOKS.find((item) => item.slug === slug);
    const chapter = Number(raw);
    router.replace(book && chapter >= 1 && chapter <= book.chapterCount ? bibleHref(book.slug, chapter) : bibleHref("john", 1));
  }, [router]);
  return <p className="py-16 text-center text-sm text-[#667085]">Opening the Bible…</p>;
}
