import { notFound } from "next/navigation";
import { BibleReader } from "@/components/bible/BibleReader";
import { getBook } from "@/lib/bible/books";

export default async function BibleChapterPage({ params }: { params: Promise<{ book: string; chapter: string }> }) {
  const { book: slug, chapter: raw } = await params;
  const book = getBook(slug);
  const chapter = Number(raw);
  if (!book || !Number.isInteger(chapter) || chapter < 1 || chapter > book.chapterCount) notFound();
  return <BibleReader book={book} chapter={chapter} />;
}
