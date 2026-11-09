"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { WHY_SENDING } from "@/lib/demo/data";

export function WhySending() {
  return <Vision />;
}

export function Vision() {
  const [open, setOpen] = useState<"here" | "why" | "faith" | null>(null);

  return (
    <section id="vision" className="bg-[var(--sending-blue)]">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-white/70">
          Vision
        </p>
        <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-6xl sm:leading-[1.02]">
          A Church Where You Can
          <br />
          Belong. Grow. Be Sent.
        </h2>
        <p className="mt-6 max-w-md text-base leading-relaxed text-white/90">
          Come as you are.
          <br />
          Grow in your faith.
          <br />
          When you’re ready, we’ll help you live on mission.
        </p>

        <p className="mt-8 text-sm font-medium tracking-[0.18em] uppercase text-white">
          Belong → Grow → Send
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button href="/#sunday" variant="white" className="w-full sm:w-auto">
            Come This Sunday
            <ArrowRight size={15} />
          </Button>
          <Button
            href="/#how-it-works"
            variant="outline"
            className="w-full sm:w-auto"
          >
            How It Works
            <ArrowRight size={15} />
          </Button>
        </div>

        <p className="mt-8 text-sm text-white/70">
          Save the Lost. Train the Saved. Send the Trained.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <button
            type="button"
            aria-expanded={open === "here"}
            aria-controls="why-you-are-here"
            onClick={() => setOpen((value) => (value === "here" ? null : "here"))}
            className="inline-flex items-center gap-1.5 text-sm text-white/75 hover:text-white"
          >
            Why You Are Here
            <ChevronDown
              size={16}
              className={`transition-transform ${open === "here" ? "rotate-180" : ""}`}
            />
          </button>
          <button
            type="button"
            aria-expanded={open === "why"}
            aria-controls="why-sending"
            onClick={() => setOpen((value) => (value === "why" ? null : "why"))}
            className="inline-flex items-center gap-1.5 text-sm text-white/75 hover:text-white"
          >
            Our Uniqueness
            <ChevronDown
              size={16}
              className={`transition-transform ${open === "why" ? "rotate-180" : ""}`}
            />
          </button>
          <button
            type="button"
            aria-expanded={open === "faith"}
            aria-controls="statement-of-faith"
            onClick={() => setOpen((value) => (value === "faith" ? null : "faith"))}
            className="inline-flex items-center gap-1.5 text-sm text-white/75 hover:text-white"
          >
            Statement of Faith
            <ChevronDown
              size={16}
              className={`transition-transform ${open === "faith" ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {open === "here" ? (
          <div id="why-you-are-here" className="mt-8 max-w-2xl">
            <h3 className="text-2xl font-semibold tracking-tight text-white">
              You Belong Here
            </h3>
            <p className="mt-3 text-base leading-relaxed text-white/90">
              Come grow in your faith, find community, and learn about Jesus.
              When you’re ready, we’ll help you live on mission.
            </p>
          </div>
        ) : null}

        {open === "faith" ? (
          <div id="statement-of-faith" className="mt-8 max-w-2xl">
            <h3 className="text-2xl font-semibold tracking-tight text-white">
              What We Believe
            </h3>
            <p className="mt-3 text-base leading-relaxed text-white/90">
              We believe the Bible is the Word of God. We believe Jesus Christ
              is the Son of God, that He died for our sins and rose again, and
              that salvation is by grace through faith in Him alone. We believe
              the Church is sent to make disciples of all nations.
            </p>
          </div>
        ) : null}

        {open === "why" ? (
          <div id="why-sending" className="mt-8">
            <h3 className="max-w-3xl text-2xl font-semibold tracking-tight text-white">
              What Makes Sending Churches Unique
            </h3>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {WHY_SENDING.map((item) => (
                <article
                  key={item.number}
                  className="rounded-[24px] bg-white px-5 py-5"
                >
                  <p className="text-sm font-semibold text-[var(--sending-blue)]">
                    {item.number}
                  </p>
                  <h4 className="mt-2 text-sm font-semibold tracking-[0.08em] uppercase">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-[#666]">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
