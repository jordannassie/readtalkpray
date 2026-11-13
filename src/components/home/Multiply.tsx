import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GRAIN_BACKGROUND } from "@/lib/demo/data";

const GRAPHIC =
  "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/readtalkpray/background/Readtalk%20circle.png";

export function Multiply() {
  return (
    <section
      id="how"
      className="relative isolate scroll-mt-28 overflow-hidden bg-cover bg-center bg-no-repeat px-5 py-16 text-white sm:py-20"
      style={{ backgroundImage: `url(${GRAIN_BACKGROUND})` }}
    >
      <div className="absolute inset-0 bg-[#041433]/25" />
      <div className="relative mx-auto grid max-w-[1280px] items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-white/80">LEARN TO LEAD</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Anyone can start a group.</h2>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-white/85">
            Read the Bible. Talk about it. Pray together. Then help someone else do the same.
          </p>
          <Link
            href="/start"
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#1976F3]"
          >
            Start a Group
            <ArrowRight size={16} />
          </Link>
        </div>
        <Image
          src={GRAPHIC}
          alt="Read the Bible together, discuss what it means, pray and take a next step, then multiply by starting another group."
          width={1254}
          height={1254}
          className="mx-auto h-auto w-full max-w-[460px] sm:max-w-[560px] lg:max-w-[640px]"
        />
      </div>
    </section>
  );
}
