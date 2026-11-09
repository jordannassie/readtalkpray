import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HOW_IMAGE, TWELVE_WEEKS } from "@/lib/demo/data";

const PHASE_STYLES = {
  save: {
    wrap: "border-l-2 border-[var(--sending-blue)]",
    title: "text-[var(--sending-blue)]",
    badge: "bg-[var(--sending-blue)] text-white",
  },
  train: {
    wrap: "border-l-2 border-[#111]",
    title: "text-[#111]",
    badge: "bg-[#111] text-white",
  },
  send: {
    wrap: "border-l-2 border-[var(--sending-blue)] bg-[#f5f5f5] rounded-r-2xl py-4 pr-5",
    title: "text-[#111]",
    badge: "bg-[var(--sending-blue-light)] text-[var(--sending-blue-dark)]",
  },
} as const;

const TRACKS = [
  {
    label: "Church",
    path: "Belong → Grow → Send",
    points: [
      "Come to church.",
      "Find community.",
      "Grow in your faith.",
      "When you’re ready, take your next step.",
    ],
    cta: "Come This Sunday",
    href: "/#sunday",
    accent: "church",
  },
  {
    label: "Training",
    path: "Save → Train → Send",
    points: [
      "Learn to reach people.",
      "Make disciples.",
      "Develop leaders.",
      "Start and multiply churches.",
    ],
    cta: "Explore Training",
    href: "/#12-weeks",
    accent: "training",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-[1220px] px-5 py-20 lg:py-24">
      <div className="max-w-2xl">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#999]">
          How It Works
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Two Simple Tracks
        </h2>
        <p className="mt-5 text-base leading-relaxed text-[#666]">
          Choose where you are.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {TRACKS.map((track) => (
            <div
              key={track.label}
              className={`rounded-[28px] border bg-white px-7 py-8 ${
                track.accent === "church" ? "border-[var(--sending-blue-line)]" : "border-[#eee]"
              }`}
            >
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#999]">
                {track.label}
              </p>
              <p className="mt-4 text-sm font-medium tracking-[0.14em] uppercase text-[#111]">
                {track.path}
              </p>
              <ul className="mt-5 max-w-md space-y-1 text-base leading-relaxed text-[#666]">
                {track.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <div className="mt-6">
                <Button
                  href={track.href}
                  variant={track.accent === "church" ? "primary" : "secondary"}
                  className="w-full sm:w-auto"
                >
                  {track.cta}
                  <ArrowRight size={15} />
                </Button>
              </div>
            </div>
        ))}
      </div>

      <div
        id="12-weeks"
        className="mt-16 grid items-center gap-12 lg:grid-cols-[48%_52%] lg:gap-14"
      >
        <div className="flex justify-center lg:justify-start">
          <Image
            src={HOW_IMAGE}
            alt="Save, Train, Send, Multiply"
            width={1200}
            height={1200}
            className="h-auto w-full max-w-[560px] lg:max-w-[520px]"
          />
        </div>

        <div>
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#999]">
            The path
          </p>
          <h3 className="mt-3 text-4xl font-semibold tracking-tight sm:text-[44px] sm:leading-[1.05]">
            12 Weeks to Multiply
          </h3>
          <p className="mt-4 text-base leading-relaxed text-[#666]">
            This 12-week path is for people ready to be trained and sent.
            Sunday church is open to everyone.
          </p>

          <div className="mt-10 space-y-8">
            {TWELVE_WEEKS.map((group, groupIndex) => {
              const style = PHASE_STYLES[group.accent];
              return (
                <div key={group.title} className={`pl-5 ${style.wrap}`}>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <p className={`text-lg font-semibold tracking-wide ${style.title}`}>
                      {group.title}
                    </p>
                    <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#999]">
                      {group.weeks}
                    </p>
                  </div>
                  <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                    {group.steps.map((step, stepIndex) => {
                      const number = String(groupIndex * 4 + stepIndex + 1).padStart(
                        2,
                        "0",
                      );
                      return (
                        <li key={step} className="flex items-center gap-3">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${style.badge}`}
                          >
                            {number}
                          </span>
                          <span className="text-lg font-medium tracking-tight text-[#111]">
                            {step}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              );
            })}
          </div>

          <p className="mt-10 text-base font-medium tracking-tight text-[#111]">
            Learn it → Live it → Lead it →{" "}
            <span className="text-[var(--sending-blue)]">Multiply it.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
