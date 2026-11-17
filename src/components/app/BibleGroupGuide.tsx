import Image from "next/image";
import { Download } from "lucide-react";
import { BibleGroupChecklist } from "@/components/app/BibleGroupChecklist";
import { GROUP_GUIDE_IMAGE, GROUP_GUIDE_PDF, HERO_VIDEO, HERO_VIDEO_POSTER } from "@/lib/demo/data";

export function BibleGroupGuide({ steps }: { steps: boolean[] }) {
  return (
    <section className="mt-8">
      <div className="grid items-stretch gap-5 lg:grid-cols-2 lg:gap-6">
        <div className="flex items-center justify-center overflow-hidden rounded-3xl bg-black">
          <video
            src={HERO_VIDEO}
            poster={HERO_VIDEO_POSTER}
            controls
            playsInline
            preload="metadata"
            className="aspect-video w-full bg-black object-contain"
            aria-label="How to run a Read Talk Pray group"
          />
        </div>
        <div className="flex flex-col items-center justify-center rounded-[28px] border border-[#e6ebf2] bg-white p-5 text-center">
          <Image
            src={GROUP_GUIDE_IMAGE}
            alt="How to Start a Bible Group guide"
            width={1199}
            height={1312}
            sizes="(max-width: 1024px) 280px, 320px"
            className="h-auto w-full max-w-[280px] lg:max-w-[320px]"
          />
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">How to Run a Bible Group</h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#555]">It&apos;s simple. Invite people, meet together, and Read. Talk. Pray.</p>
          <a
            href={GROUP_GUIDE_PDF}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex h-14 w-full max-w-xs items-center justify-center gap-2 rounded-full bg-[#1976F3] px-6 text-base font-semibold text-white"
          >
            <Download size={20} aria-hidden />
            Download Free Guide
          </a>
        </div>
      </div>
      <BibleGroupChecklist initial={steps} />
    </section>
  );
}
