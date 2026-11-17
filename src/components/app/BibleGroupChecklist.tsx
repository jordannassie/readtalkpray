"use client";

import { useRef, useState } from "react";
import { Check } from "lucide-react";

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

export function BibleGroupChecklist({ initial }: { initial: boolean[] }) {
  const [steps, setSteps] = useState(initial.length === STEPS.length ? initial : STEPS.map(() => false));
  const [error, setError] = useState(false);
  const requestId = useRef(0);
  const done = steps.filter(Boolean).length;

  async function persist(next: boolean[]) {
    const id = ++requestId.current;
    try {
      const response = await fetch("/api/checklist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ steps: next }),
      });
      if (id !== requestId.current) return;
      setError(!response.ok);
    } catch {
      if (id === requestId.current) setError(true);
    }
  }

  function toggle(index: number) {
    const next = steps.map((done, item) => (item === index ? !done : done));
    setSteps(next);
    void persist(next);
  }

  return (
    <div className="mt-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#142033]">Your Bible Group Checklist</p>
          <p className="mt-0.5 text-sm text-[#52627a]">Check off each step as you go.</p>
        </div>
        <p className="shrink-0 text-sm font-semibold text-[#142033]">{done}/6 Done</p>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#e6ebf2]" aria-hidden>
        <div className="h-full bg-[#1976F3] motion-safe:transition-[width] motion-safe:duration-200" style={{ width: `${(done / 6) * 100}%` }} />
      </div>
      <ol className="mt-3 space-y-2">
        {STEPS.map((step, index) => {
          const checked = steps[index];
          return (
            <li key={step.title} className={`rounded-2xl border border-[#e6ebf2] motion-safe:transition-colors motion-safe:duration-200 ${checked ? "bg-[#eef5ff]" : "bg-white"}`}>
              <button
                type="button"
                aria-pressed={checked}
                onClick={() => toggle(index)}
                className="flex w-full items-start gap-3 px-3 py-3 text-left motion-safe:transition motion-safe:duration-150 active:scale-[0.99] motion-reduce:active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1976F3]"
              >
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-md border-2 motion-safe:transition-colors motion-safe:duration-200 ${checked ? "border-[#1D74F5] bg-[#1D74F5]" : "border-[#98a2b3] bg-white"}`}>
                  <Check className={`text-white motion-safe:transition motion-safe:duration-200 ${checked ? "scale-100 opacity-100" : "scale-50 opacity-0"}`} size={20} strokeWidth={3} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className={`block text-sm font-semibold line-through decoration-2 motion-safe:transition-[color,text-decoration-color] motion-safe:duration-200 ${checked ? "text-[#142033] decoration-[#142033]" : "text-[#142033] decoration-transparent"}`}>{step.title}</span>
                  <span className={`mt-0.5 block text-sm leading-snug motion-safe:transition-colors motion-safe:duration-200 ${checked ? "text-[#94a3b8]" : "text-[#52627a]"}`}>{step.body}</span>
                </span>
              </button>
              {step.link ? (
                <a href={step.link.href} target="_blank" rel="noopener noreferrer" className="mt-[-4px] mb-3 ml-14 inline-flex text-sm font-semibold text-[#1976F3]">
                  {step.link.label}
                </a>
              ) : null}
            </li>
          );
        })}
      </ol>
      {done === STEPS.length ? (
        <p className="rtp-checklist-done mt-3 flex items-center gap-1.5 text-sm font-semibold text-[#16A34A]">
          <Check size={16} aria-hidden />
          All six steps completed!
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm text-[#b91c1c]">
          Couldn&apos;t save this checklist.{" "}
          <button type="button" onClick={() => void persist(steps)} className="font-semibold text-[#1976F3]">Retry</button>
        </p>
      ) : null}
    </div>
  );
}
