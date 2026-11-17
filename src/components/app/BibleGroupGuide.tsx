import Image from "next/image";
import { Download } from "lucide-react";
import { GROUP_GUIDE_PDF, HERO_VIDEO, HERO_VIDEO_POSTER } from "@/lib/demo/data";

const APP_GUIDE_IMAGE =
  "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/readtalkpray/bible/book%20(1).png";

const STEPS: { title: string; body: string; link?: { href: string; label: string } }[] = [
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
    body: "Keep everyone connected between meetings. Start a group chat using GroupMe to share updates, prayer requests, and meeting reminders.",
    link: { href: "https://groupme.com/", label: "Start a GroupMe Chat" },
  },
  {
    title: "HELP OTHERS BEGIN",
    body: "Encourage others to invite friends and eventually start another group. Keep the rhythm: Read. Talk. Pray.",
  },
];

export function BibleGroupGuide() {
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
            src={APP_GUIDE_IMAGE}
            alt="How to Start a Bible Group guide"
            width={1672}
            height={941}
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
      <ol className="mt-4 space-y-2">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex items-start gap-3 rounded-2xl border border-[#e6ebf2] bg-white px-3 py-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#1976F3] text-sm font-semibold text-white">{index + 1}</span>
            <span>
              <span className="block text-sm font-semibold">{step.title}</span>
              <span className="mt-0.5 block text-sm leading-snug text-[#52627a]">{step.body}</span>
              {step.link ? (
                <a href={step.link.href} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex text-sm font-semibold text-[#1976F3]">
                  {step.link.label}
                </a>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
