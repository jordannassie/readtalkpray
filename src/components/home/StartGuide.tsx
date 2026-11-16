import Image from "next/image";
import { Download } from "lucide-react";
import { GROUP_GUIDE_IMAGE, GROUP_GUIDE_PDF } from "@/lib/demo/data";

export function StartGuide() {
  return (
    <section className="bg-white px-4 py-10 sm:px-5 sm:py-16">
      <div className="mx-auto grid max-w-[1100px] items-center gap-8 rounded-[32px] border border-[#e6ebf2] bg-[#f8fbff] p-6 sm:gap-10 sm:p-10 lg:grid-cols-[minmax(280px,440px)_minmax(0,1fr)] lg:gap-14 lg:p-12">
        <Image
          src={GROUP_GUIDE_IMAGE}
          alt="How to Start a Bible Group guide"
          width={1254}
          height={1254}
          sizes="(max-width: 1024px) 320px, 440px"
          className="mx-auto h-auto w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[440px]"
        />
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[#1976F3]">FREE GUIDE</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#142033] sm:text-5xl">How to Start a Bible Group</h2>
          <p className="mt-3 max-w-xl text-lg text-[#52627a]">Everything you need to start a simple, one-hour Bible group.</p>
          <a
            href={GROUP_GUIDE_PDF}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#1976F3] px-8 text-base font-semibold text-white sm:w-auto"
          >
            <Download size={20} aria-hidden />
            Download Free Guide
          </a>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#334155]">
            Invite people, read the Bible together, talk about what it means, and pray. No building. No paid staff. Just people and the Bible.
          </p>
        </div>
      </div>
    </section>
  );
}
