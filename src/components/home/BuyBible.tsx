import Image from "next/image";
import { BIBLE_AMAZON_URL, BOOK_AMAZON_LOGO } from "@/lib/demo/data";

export function BuyBible() {
  return (
    <section className="bg-[#1976F3] text-white">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-1.5 text-sm sm:justify-between">
        <h2 className="flex flex-wrap items-center justify-center gap-x-3 font-semibold">
          Buy a Bible
          <span className="font-normal text-white/80">NIV Economy Bible</span>
          <span>$4.99</span>
        </h2>
        <a
          href={BIBLE_AMAZON_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center"
        >
          <Image
            src={BOOK_AMAZON_LOGO}
            alt="Buy the NIV Economy Bible on Amazon"
            width={1024}
            height={373}
            className="h-5 w-auto"
          />
        </a>
      </div>
    </section>
  );
}
