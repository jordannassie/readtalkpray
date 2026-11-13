import { BookOpen, MapPin, MessageSquare, Users } from "lucide-react";
import { HERO_VIDEO } from "@/lib/demo/data";

const STEPS = [
  {
    title: "Invite People",
    body: "Invite people by text, or start a GroupMe group so everyone can stay connected and communicate.",
    icon: MessageSquare,
  },
  {
    title: "Pick a Time & Place",
    body: "Choose a welcoming location and meeting time. Arrive early to greet everyone.",
    icon: MapPin,
  },
  {
    title: "Read. Talk. Pray. — About 1 Hour",
    body: "Open with a prayer asking God to speak through His Word. Read through the Bible chapter by chapter, taking turns reading aloud. Pause after each paragraph to talk about what you read and what it means.",
    icon: BookOpen,
  },
  {
    title: "Pray Together",
    body: "End by praying for one another and for the group. Encourage everyone to invite someone next time.",
    icon: Users,
  },
];

export function BibleGroupGuide() {
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-semibold tracking-tight">How to Run a Bible Group</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#555]">It&apos;s simple. Invite people, meet together, and Read. Talk. Pray.</p>
      <div className="mt-4 overflow-hidden rounded-3xl bg-black shadow-sm">
        <video src={HERO_VIDEO} controls playsInline preload="metadata" className="aspect-video w-full" aria-label="How to run a Read Talk Pray group" />
      </div>
      <ol className="mt-4 space-y-3">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <li key={step.title} className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e7f0ff] text-[#1976F3]">
                  <Icon size={18} aria-hidden />
                </span>
                <div>
                  <h3 className="font-semibold">{index + 1}. {step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#444]">{step.body}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
