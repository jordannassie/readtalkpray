"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, ChevronRight, MapPin, Rocket } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/Button";
import {
  DEMO_CHURCH,
  DEMO_EVENT,
  PATH_CARDS,
  START_CHECKLIST,
} from "@/lib/demo/data";
import { useDemoAuth } from "@/lib/demo/auth";

export default function DashboardPage() {
  const { user } = useDemoAuth();

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm text-[#777]">Welcome back,</p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight sm:text-5xl">
            {user?.name ?? "Jordan"}!
          </h1>
          <p className="mt-3 text-sm text-[#777]">
            Save the Lost. Train the Saved. Send the Trained.
          </p>
        </div>
        <Link
          href="/my-church"
          className="flex items-center justify-between gap-4 rounded-2xl border border-[#eee] bg-white px-4 py-3 lg:min-w-[220px]"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--sending-blue-light)] text-[var(--sending-blue)]">
              <MapPin size={16} />
            </span>
            <span>
              <span className="block text-xs text-[#888]">Your Church</span>
              <span className="text-sm font-medium">{DEMO_CHURCH.city}</span>
            </span>
          </span>
          <ChevronRight size={16} className="text-[#bbb]" />
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {PATH_CARDS.map((card) => (
          <article key={card.title} className="relative min-h-[320px] overflow-hidden rounded-[28px]">
            <Image
              src={card.image}
              alt={card.title}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 33vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
            <div className="relative flex h-full min-h-[320px] flex-col p-6 text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#111]">
                {card.number}
              </span>
              <h2 className="mt-auto text-3xl font-semibold tracking-tight">{card.title}</h2>
              <p className="mt-2 text-sm text-white/80">{card.body}</p>
              <Link
                href={card.href}
                className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#111]"
              >
                {card.cta}
                <ArrowRight size={14} />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div id="next-step" className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[28px] border border-[#eee] bg-white p-6">
          <h2 className="text-xl font-semibold tracking-tight">Your Next Step</h2>
          <p className="mt-1 text-sm text-[#777]">Take one step this week.</p>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--sending-blue-light)] text-[var(--sending-blue)]">
                <Rocket size={18} />
              </span>
              <div>
                <p className="font-medium">Join the Frisco Sending Team</p>
                <p className="mt-1 text-sm text-[#777]">
                  Be part of the local launch team and help reach the city.
                </p>
              </div>
            </div>
            <Button href="/start-a-church" className="shrink-0">
              Join Now
              <ArrowRight size={14} />
            </Button>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#eee] bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
              <Calendar size={18} className="text-[#999]" />
              Upcoming Event
            </h2>
            <Link href="/events" className="text-sm text-[#888]">
              View all
            </Link>
          </div>
          <Link href="/events" className="mt-5 flex items-center gap-4">
            <Image
              src={DEMO_EVENT.image}
              alt={DEMO_EVENT.title}
              width={88}
              height={72}
              className="h-[72px] w-[88px] rounded-2xl object-cover"
            />
            <div className="flex-1">
              <p className="font-medium">{DEMO_EVENT.title}</p>
              <p className="mt-1 text-sm text-[#777]">
                {DEMO_EVENT.day} · {DEMO_EVENT.time}
              </p>
              <p className="text-sm text-[#777]">{DEMO_EVENT.location}</p>
            </div>
            <ChevronRight size={16} className="text-[#bbb]" />
          </Link>
        </section>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-[28px] border border-[#eee] bg-white p-6">
          <h2 className="text-xl font-semibold tracking-tight">Your Sending Church</h2>
          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-[#888]">City</dt>
              <dd className="mt-1 font-medium">{DEMO_CHURCH.city}</dd>
            </div>
            <div>
              <dt className="text-[#888]">Leader</dt>
              <dd className="mt-1 font-medium">{DEMO_CHURCH.leader}</dd>
            </div>
            <div>
              <dt className="text-[#888]">Meeting</dt>
              <dd className="mt-1 font-medium">{DEMO_CHURCH.meeting}</dd>
            </div>
            <div>
              <dt className="text-[#888]">Current Team</dt>
              <dd className="mt-1 font-medium">{DEMO_CHURCH.team}</dd>
            </div>
            <div>
              <dt className="text-[#888]">People Reached</dt>
              <dd className="mt-1 font-medium">{DEMO_CHURCH.reached}</dd>
            </div>
            <div>
              <dt className="text-[#888]">Baptized</dt>
              <dd className="mt-1 font-medium">{DEMO_CHURCH.baptized}</dd>
            </div>
            <div>
              <dt className="text-[#888]">Trained</dt>
              <dd className="mt-1 font-medium">{DEMO_CHURCH.trained}</dd>
            </div>
            <div>
              <dt className="text-[#888]">Sent</dt>
              <dd className="mt-1 font-medium">{DEMO_CHURCH.sent}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-[28px] border border-[#eee] bg-white p-6">
          <h2 className="text-xl font-semibold tracking-tight">Start Your Church</h2>
          <ol className="mt-5 space-y-3">
            {START_CHECKLIST.map((item, index) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--sending-blue-light)] text-xs font-semibold text-[var(--sending-blue)]">
                  {index + 1}
                </span>
                <span className="pt-0.5">{item}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6">
            <Button href="/start-a-church">
              Start My Sending Church
              <ArrowRight size={14} />
            </Button>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
