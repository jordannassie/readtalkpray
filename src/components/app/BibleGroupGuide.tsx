import Image from "next/image";
import { Download } from "lucide-react";
import { GROUP_GUIDE_IMAGE, GROUP_GUIDE_PDF, HERO_VIDEO, HERO_VIDEO_POSTER } from "@/lib/demo/data";

const STEPS = [
  {
    title: "PRAY FOR PEOPLE",
    body: "Ask God to show you three to eight people to invite. Pray for open hearts and genuine friendship.",
  },
  {
    title: "CHOOSE A TIME + PLACE",
    body: "Choose a consistent day and time. Meet for about one hour at a home or quiet public place. Arrive early.",
  },
  {
    title: "INVITE PERSONALLY",
    body: "Send a short text, invite a friend, or share your group link. Everyone is welcome.",
  },
  {
    title: "START WITH A GOSPEL",
    body: "Begin with John or Mark. Read through the Bible together, chapter by chapter, pausing to discuss what it means.",
  },
  {
    title: "STAY CONNECTED",
    body: "Use a group text or optional GroupMe group to communicate between meetings.",
  },
  {
    title: "HELP OTHERS BEGIN",
    body: "Encourage others to invite friends and eventually start another group. Keep the rhythm: Read. Talk. Pray.",
  },
];

export function BibleGroupGuide() {
  return (
    <section className="mt-8">
      <div className="grid items-center gap-5 rounded-[28px] border border-[#e6ebf2] bg-white p-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:p-6">
        <Image
          src={GROUP_GUIDE_IMAGE}
          alt="How to Start a Bible Group guide"
          width={1254}
          height={1254}
          sizes="(max-width: 640px) 240px, 220px"
          className="mx-auto h-auto w-full max-w-[240px]"
        />
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">How to Run a Bible Group</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#555]">It&apos;s simple. Invite people, meet together, and Read. Talk. Pray.</p>
          <a
            href={GROUP_GUIDE_PDF}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#1976F3] px-6 text-base font-semibold text-white sm:w-auto"
          >
            <Download size={20} aria-hidden />
            Download Free Guide
          </a>
        </div>
      </div>
      <div className="mx-auto mt-4 w-full max-w-[600px] overflow-hidden rounded-3xl bg-black shadow-sm">
        <video src={HERO_VIDEO} poster={HERO_VIDEO_POSTER} controls playsInline preload="metadata" className="aspect-video w-full" aria-label="How to run a Read Talk Pray group" />
      </div>
      <ol className="mt-4 space-y-2">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex items-start gap-3 rounded-2xl border border-[#e6ebf2] bg-white px-3 py-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#1976F3] text-sm font-semibold text-white">{index + 1}</span>
            <span>
              <span className="block text-sm font-semibold">{step.title}</span>
              <span className="mt-0.5 block text-sm leading-snug text-[#52627a]">{step.body}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
