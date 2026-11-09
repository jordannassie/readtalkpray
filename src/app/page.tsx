import Image from "next/image";
import Link from "next/link";
import { BookOpen, Check, MapPin, MessageCircle } from "lucide-react";
import { Beliefs } from "@/components/home/Beliefs";
import { GroupFinder } from "@/components/home/GroupFinder";
import { Multiply } from "@/components/home/Multiply";
import { WorldGlobe } from "@/components/home/WorldGlobe";
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

const PROMISES = ["No Donations", "No Paid Staff", "No Building", "Only the Bible"];

export default async function HomePage() {
  const realGroups = await listApprovedGroups();
  const groups = [...demoGroups(), ...realGroups];
  const places = globePlaces(realGroups);

  return (
    <div className="overflow-x-hidden bg-[#eef3fb] text-[#111]">
      <section className="relative isolate overflow-hidden text-white">
        <Image
          src="/hero-nashville.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[68%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,16,36,0.72)_0%,rgba(7,16,36,0.42)_46%,rgba(7,16,36,0.12)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(7,16,36,0.28))]" />
        <SiteHeader tone="overlay" activeHref="/#groups" />
        <div className="relative z-10 mx-auto max-w-[1320px] px-5 pb-28 pt-16 sm:pb-40 sm:pt-20 lg:pb-44 lg:pt-24">
          <h1 className="max-w-[15ch] text-[2.55rem] leading-[0.95] font-semibold tracking-[-0.045em] sm:max-w-none sm:text-7xl lg:text-[5.35rem]">
            Read. Talk.{" "}
            <span className="underline decoration-[var(--sending-blue)] decoration-[6px] underline-offset-[10px]">Pray.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/95 sm:text-2xl lg:text-[1.7rem]">A simple way to follow Jesus together.</p>
          <ul className="mt-8 grid max-w-3xl grid-cols-3 gap-2 sm:mt-10 sm:gap-0">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.title}
                  className={`px-1 text-center sm:px-5 ${index < STEPS.length - 1 ? "sm:border-r sm:border-white/30" : ""}`}
                >
                  <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-white/15 sm:h-12 sm:w-12">
                    <Icon />
                  </span>
                  <span className="mt-2 block text-sm font-semibold sm:mt-3 sm:text-lg">{step.title}</span>
                  <span className="mt-1 block text-[11px] leading-snug text-white/85 sm:text-sm">{step.body}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="pointer-events-none absolute top-[42%] right-12 z-10 hidden items-center gap-2 text-3xl font-semibold tracking-tight text-white drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)] xl:flex">
          <MapPin size={28} aria-hidden />
          <span className="italic">Nashville</span>
        </p>
      </section>

      <GroupFinder groups={groups} />

      <div className="mx-auto mt-4 max-w-[1320px] px-4 sm:px-5">
        <div className="flex flex-col gap-3 rounded-full bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--sending-blue-light)] text-[var(--sending-blue)]">
              <BookOpen size={16} />
            </span>
            A Bible Study Church for Everyone.
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {PROMISES.map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <Check size={16} className="text-[var(--sending-blue)]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-10">
        <WorldGlobe places={places} />
      </div>
      <Multiply />
      <Beliefs />
      <section className="bg-[var(--sending-blue)] text-white">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-white/80">This week</p>
            <p className="text-4xl font-semibold tracking-tight">Come as you are.</p>
          </div>
          <Link href="#join" className="inline-flex h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-[#111]">
            Join a Group
          </Link>
        </div>
      </section>
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
