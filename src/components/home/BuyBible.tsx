import Image from "next/image";
import { BIBLE_AMAZON_URL, BOOK_AMAZON_LOGO } from "@/lib/demo/data";

export function BuyBible() {
  return (
    <section className="bg-[#1976F3] text-white">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-6 px-5 py-12 text-center sm:flex-row sm:items-center sm:justify-between sm:py-14 sm:text-left">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">Buy a Bible</h2>
          <p className="mt-3 text-lg text-white/90">NIV Economy Bible</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">$4.99</p>
        </div>
        <a
          href={BIBLE_AMAZON_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full bg-[#1464d4] px-6 py-4 ring-1 ring-white/20 transition hover:bg-[#125cbc]"
        >
          <Image
            src={BOOK_AMAZON_LOGO}
            alt="Buy the NIV Economy Bible on Amazon"
            width={1024}
            height={373}
            className="h-10 w-auto sm:h-12"
          />
        </a>
      </div>
    </section>
  );
}
