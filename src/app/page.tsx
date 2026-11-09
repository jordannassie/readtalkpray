import Image from "next/image";
import Link from "next/link";
import { BookOpen, Check, MapPin, MessageCircle } from "lucide-react";
import { Beliefs } from "@/components/home/Beliefs";
import { GroupFinder } from "@/components/home/GroupFinder";
import { Multiply } from "@/components/home/Multiply";
import { WorldGlobe } from "@/components/home/WorldGlobe";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
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
  const groups = await listApprovedGroups();
  const places = globePlaces(groups);

  return (
    <div className="overflow-x-hidden bg-[#eef3fb] text-[#111]">
      <section className="relative isolate min-h-[640px] overflow-hidden text-white sm:min-h-[720px]">
        <Image
          src="/hero-nashville.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,22,48,0.55),rgba(10,22,48,0.28)_42%,rgba(10,22,48,0.45))]" />
        <SiteHeader tone="overlay" />
        <div className="relative z-10 mx-auto max-w-6xl px-5 pb-28 pt-8 sm:pb-36 sm:pt-12">
          <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.045em] sm:text-7xl">
            Read. Talk. <span className="underline decoration-[var(--sending-blue)] decoration-4 underline-offset-8">Pray.</span>
          </h1>
          <p className="mt-5 max-w-xl text-xl text-white/90 sm:text-2xl">A simple way to follow Jesus together.</p>
          <ul className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-3">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/15">
                    <Icon />
                  </span>
                  <span>
                    <span className="block font-semibold">{step.title}</span>
                    <span className="mt-1 block text-sm text-white/80">{step.body}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium backdrop-blur">
            <MapPin size={15} />
            Nashville
          </p>
        </div>
      </section>

      <GroupFinder groups={groups} />

      <div className="mx-auto mt-5 max-w-6xl px-4 sm:px-5">
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
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
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
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M12 21c-2-2.2-6-5.2-6-9.2 0-1.8 1.2-3.2 2.8-3.2 1.2 0 2.1.6 3.2 1.8 1.1-1.2 2-1.8 3.2-1.8 1.6 0 2.8 1.4 2.8 3.2 0 4-4 7-6 9.2Z" />
      <path d="M9 7.2 8 3.5M15 7.2 16 3.5" strokeLinecap="round" />
    </svg>
  );
}
