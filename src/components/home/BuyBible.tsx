import Image from "next/image";
import { BIBLE_AMAZON_URL, BOOK_AMAZON_LOGO } from "@/lib/demo/data";

export function BuyBible() {
  return (
    <section className="my-8 bg-[#1976F3] text-white sm:my-10">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-3 text-sm sm:justify-between sm:text-base">
        <h2 className="text-center font-semibold sm:text-left">
          Buy a Bible, Bring it to your Group
          <span className="ml-3">$4.99</span>
        </h2>
        <a
          href={BIBLE_AMAZON_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full bg-black px-4 py-2"
        >
          <Image
            src={BOOK_AMAZON_LOGO}
            alt="Buy on Amazon"
            width={1024}
            height={373}
            className="h-5 w-auto"
          />
        </a>
      </div>
    </section>
  );
}
