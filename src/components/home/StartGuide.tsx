import Image from "next/image";
import { Download } from "lucide-react";
import { GROUP_GUIDE_IMAGE, GROUP_GUIDE_PDF } from "@/lib/demo/data";

export function StartGuide() {
  return (
    <section className="bg-white px-5 py-8 sm:py-14">
      <div className="mx-auto grid max-w-[1080px] items-center gap-6 rounded-[28px] border border-[#e6ebf2] bg-[#f8fbff] p-5 sm:gap-10 sm:p-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:p-10">
        <Image
          src={GROUP_GUIDE_IMAGE}
          alt="How to Start a Bible Group guide"
          width={1254}
          height={1254}
          sizes="(max-width: 1024px) 200px, 280px"
          className="mx-auto h-auto w-full max-w-[200px] lg:max-w-[280px]"
        />
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[#1976F3]">FREE GUIDE</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#142033] sm:text-4xl">How to Start a Bible Group</h2>
          <p className="mt-2 text-base text-[#52627a] sm:text-lg">Everything you need to start a simple, one-hour Bible group.</p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#334155] sm:text-base">
            Invite people, read the Bible together, talk about what it means, and pray.
          </p>
          <p className="mt-2 text-sm font-medium text-[#142033]">No building. No paid staff. Just people and the Bible.</p>
          <a
            href={GROUP_GUIDE_PDF}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1976F3] px-5 text-sm font-semibold text-white sm:w-auto"
          >
            <Download size={18} aria-hidden />
            Get Free Guide
          </a>
        </div>
      </div>
    </section>
  );
}
