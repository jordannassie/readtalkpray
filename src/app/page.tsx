import { BookOpen, Check, MessageCircle } from "lucide-react";
import { Beliefs } from "@/components/home/Beliefs";
import { GroupFinder } from "@/components/home/GroupFinder";
import { HeroVideo } from "@/components/home/HeroVideo";
import { Multiply } from "@/components/home/Multiply";
import { WorldGlobe } from "@/components/home/WorldGlobe";
import { HERO_IMAGE } from "@/lib/demo/data";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { demoGroups } from "@/lib/groups/demo";
import { listApprovedGroups } from "@/lib/groups/queries";
import { placeLabel } from "@/lib/groups/types";

export const dynamic = "force-dynamic";

const STEPS = [
  { title: "Read", body: "Read the Bible together.", icon: BookOpen },
  { title: "Talk", body: "Discuss what it means.", icon: MessageCircle },
  { title: "Pray", body: "Pray and take a next step.", icon: PrayIcon },
] as const;

const PROMISES = ["No Donations", "No Paid Staff", "No Judgement", "Only the Bible"];

export default async function HomePage() {
  const realGroups = await listApprovedGroups();
  const groups = [...(await demoGroups()), ...realGroups];
  const places = globePlaces(realGroups);

  return (
    <div className="overflow-x-clip bg-[#eef3fb] text-[#111]">
      <SiteHeader activeHref="/#groups" />
      <section
        className="relative isolate overflow-hidden bg-cover bg-center bg-no-repeat text-white"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      >
        <div className="absolute inset-0 bg-[#041433]/25" />
        <div className="relative z-10 mx-auto grid max-w-[1280px] items-center gap-8 px-5 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12 lg:py-20">
          <div>
            <h1 className="max-w-[12ch] text-[2.7rem] leading-[0.95] font-semibold tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
              Read. Talk. Pray.
            </h1>
            <p className="mt-5 max-w-md text-lg text-white/85 sm:text-2xl">A simple way to follow Jesus together.</p>
            <ul className="mt-8 grid max-w-xl grid-cols-3 gap-2 sm:mt-10">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li
                    key={step.title}
                    className={`px-1 text-center text-white sm:px-4 ${index < STEPS.length - 1 ? "border-r border-white/25" : ""}`}
                  >
                    <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-white/15 text-white">
                      <Icon />
                    </span>
                    <span className="mt-2 block text-sm font-semibold tracking-wide uppercase sm:mt-3 sm:text-base">{step.title}</span>
                    <span className="mt-1 block text-[11px] leading-snug text-white/80 sm:text-sm">{step.body}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <HeroVideo />
        </div>
      </section>

      <section className="bg-[linear-gradient(100deg,#1565d8_0%,#3d9bff_46%,#1a6fe0_100%)] px-5 py-5 text-center text-white sm:py-6">
        <p className="mx-auto max-w-4xl text-lg font-semibold tracking-tight sm:text-2xl">
          A Bible Reading Church that's to big for a Building.
        </p>
        <ul className="mx-auto mt-3 flex max-w-3xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium sm:text-base">
          {PROMISES.map((item) => (
            <li key={item} className="inline-flex items-center gap-1.5">
              <Check size={16} aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <GroupFinder groups={groups} />

      <Multiply />
      <WorldGlobe places={places} />
      <Beliefs />
      <SiteFooter />
    </div>
  );
}

function globePlaces(groups: Awaited<ReturnType<typeof listApprovedGroups>>) {
  const seen = new Set<string>();
  return groups.flatMap((group) => {
    const name = placeLabel(group);
    if (seen.has(name)) return [];
    seen.add(name);
    return [{ name, lat: group.latitude, lon: group.longitude, label: "Meeting together" }];
  });
}

function PrayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9.2 11.2V6.2a1.3 1.3 0 0 1 2.6 0" />
      <path d="M12 9.2V4.6a1.3 1.3 0 0 1 2.6 0V13" />
      <path d="M14.6 12.2V7.4a1.3 1.3 0 0 1 2.6.1v5.8c0 3.5-2.3 6.3-5.2 7.4-3-.9-5.4-3.8-5.4-7.4V8.4a1.3 1.3 0 0 1 2.6 0v2.8" />
    </svg>
  );
}
