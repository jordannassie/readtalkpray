import { getBookByOrder, type BookMeta } from "./books";

export type WebVerse = { v: number; t: string };

export type ChapterStop = { slug: string; chapter: number; label: string };

/** World English Bible chapter files. The text is public domain. */
export function chapterFile(order: number, chapter: number) {
  return `/bible/web/${String(order).padStart(2, "0")}-${String(chapter).padStart(3, "0")}.json`;
}

export function bibleHref(slug: string, chapter: number) {
  return `/app/bible/${slug}/${chapter}`;
}

export function chapterNeighbors(book: BookMeta, chapter: number) {
  let prev: ChapterStop | null = null;
  let next: ChapterStop | null = null;
  if (chapter > 1) prev = { slug: book.slug, chapter: chapter - 1, label: `${book.name} ${chapter - 1}` };
  else {
    const previous = getBookByOrder(book.order - 1);
    if (previous) prev = { slug: previous.slug, chapter: previous.chapterCount, label: `${previous.name} ${previous.chapterCount}` };
  }
  if (chapter < book.chapterCount) next = { slug: book.slug, chapter: chapter + 1, label: `${book.name} ${chapter + 1}` };
  else {
    const following = getBookByOrder(book.order + 1);
    if (following) next = { slug: following.slug, chapter: 1, label: `${following.name} 1` };
  }
  return { prev, next };
}
