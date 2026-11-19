import type { Metadata } from "next";
import { Gift, Megaphone, Users } from "lucide-react";
import { GivingForm } from "@/components/fund/GivingForm";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { IMPACT_EXAMPLE_CENTS, REACH_DISCLAIMER, estimatedClicks, formatCount, formatGiftAmount } from "@/lib/fund/donation";
import { SITE, publicMetadata } from "@/lib/groups/seo";

const FUND_IMAGE = "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/readtalkpray/Fund/Funds.png";
const AD_IMAGE = "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/readtalkpray/Fund/Biblestudy.png";
const TITLE = "Bible Group Marketing Fund | Read Talk Pray";
const DESCRIPTION =
  "Support marketing that helps people discover local Read Talk Pray Bible Groups. Learn how your giving can help introduce communities to Scripture, prayer, and fellowship.";

export const metadata: Metadata = {
  ...publicMetadata({ title: TITLE, description: DESCRIPTION, path: "/fund" }),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE}/fund`,
    siteName: "Read Talk Pray",
    type: "website",
    images: [{ url: FUND_IMAGE, width: 1670, height: 941, alt: "Illustration of a gift supporting advertising for local Read Talk Pray Bible groups" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [FUND_IMAGE],
  },
};

const STEPS = [
  {
    icon: Gift,
    title: "You Give",
    body: "Support the marketing fund with a one-time or monthly gift.",
  },
  {
    icon: Megaphone,
    title: "We Advertise",
    body: "Read Talk Pray uses the marketing fund to promote local Bible Groups through online advertising.",
  },
  {
    icon: Users,
    title: "People Find Community",
    body: "People click through to discover a nearby Bible Group and have an opportunity to sign up and attend.",
  },
];

const FAQ = [
  {
    question: "What does the Marketing Fund support?",
    answer: "The fund is intended to support advertising that helps people discover local Read Talk Pray Bible Groups.",
  },
  {
    question: "How much does it cost to reach someone?",
    answer: "We use $5 per advertising click as an initial planning estimate. Actual costs depend on the campaign, audience, location, and advertising performance.",
  },
  {
    question: "Does $5 guarantee someone joins a group?",
    answer: "No. A click brings someone to a Bible Group page, where they can learn about the group and choose whether to sign up.",
  },
  {
    question: "Do I have to give to join a group?",
    answer: "No. Read Talk Pray groups are free to join and participation does not require a donation.",
  },
  {
    question: "Can I give monthly?",
    answer: "The form is designed for both one-time and monthly giving. Online payments will be enabled when the secure checkout is connected.",
  },
];

export default function FundPage() {
  return (
    <div className="min-h-screen bg-white text-[#142033]">
      <SiteHeader />
      <main>
        <section className="bg-[#f4f8ff]">
          <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-5 py-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:py-20">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-[#1976F3]">BIBLE GROUP MARKETING FUND</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">Help More People Find a Bible Group.</h1>
              <p className="mt-5 text-xl font-semibold tracking-tight text-balance sm:text-2xl">
                Give to help local Bible-reading churches reach their communities through online advertising.
              </p>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#334155]">
                Your generosity helps introduce people to Bible Groups where they can read Scripture, talk about Jesus, pray together, and find community.
              </p>
              <a
                href="#give"
                className="mt-8 inline-flex h-14 items-center justify-center rounded-full bg-[#1976F3] px-6 text-base font-semibold text-white"
              >
                Fund Bible Group Marketing
              </a>
            </div>
            <figure className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-[#e6ebf2]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={FUND_IMAGE}
                alt="A gift dropped into the Read Talk Pray fund, then carried through online ads to people gathered for Bible groups"
                width={1670}
                height={941}
                className="h-auto w-full"
              />
            </figure>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-5 py-16 sm:py-20" aria-labelledby="how-it-works">
          <h2 id="how-it-works" className="text-3xl font-semibold tracking-tight sm:text-4xl">How the Marketing Fund works</h2>
          <ol className="mt-8 grid gap-4 lg:grid-cols-3">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
              <li key={step.title} className="rounded-3xl border border-[#e6ebf2] bg-[#f8fafc] p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e7f0ff] text-[#1976F3]">
                    <Icon size={20} aria-hidden />
                  </span>
                  <p className="text-xs font-semibold tracking-[0.14em] text-[#1976F3]">{index + 1}</p>
                </div>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-[#334155]">{step.body}</p>
              </li>
              );
            })}
          </ol>
        </section>

        <section className="bg-[#f4f8ff]">
          <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-5 py-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] sm:py-20">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">This Is What Your Giving Helps Promote.</h2>
              <p className="mt-4 text-lg leading-relaxed text-[#334155]">
                We promote Bible Groups to people in local communities through platforms such as Facebook and Instagram, connecting them to group-specific signup pages.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-[#52627a]">
                The image is an example of that kind of advertisement. This page does not report that a particular campaign is running.
              </p>
            </div>
            <figure className="mx-auto w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-[#e6ebf2]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={AD_IMAGE}
                alt="Example Bible study advertisement for a Nashville group, with photos, a Sunday meeting time, and a join button"
                width={1199}
                height={1312}
                className="h-auto w-full"
              />
            </figure>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1280px] items-start gap-10 px-5 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(320px,440px)] sm:py-20">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">A $5 planning estimate per click</h2>
            <p className="mt-4 text-lg leading-relaxed text-[#334155]">
              $5.00 is an estimated paid click to a Bible Group landing or signup page. Estimated clicks equal the gift amount divided by $5, rounded down.
            </p>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {IMPACT_EXAMPLE_CENTS.map((cents) => (
                <li key={cents} className="rounded-2xl border border-[#e6ebf2] bg-white px-4 py-3 text-sm font-medium">
                  {formatGiftAmount(cents)} = Approximately {formatCount(estimatedClicks(cents))} clicks
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-[#52627a]">
              These are estimated paid clicks to Bible Group pages, not confirmed signups. A click does not guarantee that someone joins, attends, or that a campaign produces a fixed result.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#52627a]">{REACH_DISCLAIMER}</p>
            <div className="mt-8 rounded-3xl bg-[#f4f8ff] p-5">
              <p className="text-lg font-semibold tracking-tight">Joining or starting a Read Talk Pray group is free. Giving to the Marketing Fund is completely optional.</p>
              <p className="mt-3 text-sm leading-relaxed text-[#334155]">
                This page is voluntary support for centralized advertising and outreach. It is not a fee for attending or leading a local group. Gifts are not described here as tax deductible, and this page does not establish a legally restricted charitable fund or promise that every dollar is spent on ads.
              </p>
            </div>
          </div>
          <GivingForm />
        </section>

        <section className="border-t border-[#e6ebf2]" aria-labelledby="fund-faq">
          <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
            <h2 id="fund-faq" className="text-3xl font-semibold tracking-tight">Questions</h2>
            <div className="mt-6 divide-y divide-[#e6ebf2] rounded-3xl border border-[#e6ebf2]">
              {FAQ.map((item) => (
                <details key={item.question} className="group px-5 py-4">
                  <summary className="cursor-pointer list-none text-base font-semibold tracking-tight [&::-webkit-details-marker]:hidden">
                    {item.question}
                  </summary>
                  <p className="mt-2 text-base leading-relaxed text-[#334155]">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
