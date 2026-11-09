"use client";

import { FormEvent, useRef, useState } from "react";
import { ArrowRight, MapPin, Phone, User } from "lucide-react";
import { cleanLeadPhone } from "@/lib/leads/phone";
import { saveStartSignup } from "@/lib/leads/start";
import { isWebsitePhone } from "@/lib/leads/website";

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sending-blue)]";

export function StartBibleStudy() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    const nextName = name.trim();
    const nextLocation = location.trim();
    const phone = cleanLeadPhone(mobile);
    if (!nextName || !mobile.trim() || !nextLocation) {
      setError("Name, mobile number, and location are needed.");
      return;
    }
    if (!phone.ok || !isWebsitePhone(phone.phone)) {
      setError("Enter a mobile number, including the country code if you are outside the US.");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setError("");

    try {
      const result = await saveStartSignup({ name: nextName, mobile, location: nextLocation });
      if (!result.ok || !result.phones.includes(phone.phone)) {
        submittingRef.current = false;
        setSubmitting(false);
        setError("Something went wrong. Please try again.");
        return;
      }
      setSaved(true);
    } catch {
      submittingRef.current = false;
      setSubmitting(false);
      setError("Something went wrong. Please try again.");
    }
  }

  const fieldClass = `h-[52px] w-full rounded-2xl border border-[#e6e6e6] bg-[#f7f7f7] pr-4 pl-11 text-sm text-[#111] outline-none placeholder:text-[#8a8a8a] focus:border-[var(--sending-blue)] focus:bg-white focus:ring-2 focus:ring-[var(--sending-blue)]/25 ${FOCUS}`;

  return (
    <section id="start-bible-study" className="scroll-mt-24 bg-white">
      <div className="mx-auto max-w-xl px-5 py-14 sm:py-20">
        <h2 className="text-center text-4xl font-semibold tracking-tight sm:text-5xl">
          Start Your Bible Study Church.
        </h2>
        <p className="mt-4 text-center text-base leading-relaxed text-[#555] sm:text-lg">
          Want to start a Bible study church in your community? Share your details, and we’ll help you take the next step.
        </p>
        {saved ? (
          <p className="mt-8 text-center text-lg font-medium text-[#111]" role="status">
            Thank you! We’ve received your interest and will be in touch about starting a Bible study church.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
            <label className="block">
              <span className="text-sm font-medium">Name</span>
              <span className="relative mt-2 block">
                <User aria-hidden size={18} strokeWidth={1.75} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#b5b5b5]" />
                <input
                  required
                  name="name"
                  autoComplete="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  aria-invalid={error ? true : undefined}
                  className={fieldClass}
                />
              </span>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Mobile Number</span>
              <span className="relative mt-2 block">
                <Phone aria-hidden size={18} strokeWidth={1.75} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#b5b5b5]" />
                <input
                  required
                  type="tel"
                  inputMode="tel"
                  name="mobile"
                  autoComplete="tel"
                  placeholder="Mobile number"
                  value={mobile}
                  onChange={(event) => setMobile(event.target.value)}
                  aria-invalid={error ? true : undefined}
                  className={fieldClass}
                />
              </span>
            </label>
            <label className="block">
              <span className="text-sm font-medium">City, State / Region, Country</span>
              <span className="relative mt-2 block">
                <MapPin aria-hidden size={18} strokeWidth={1.75} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#b5b5b5]" />
                <input
                  required
                  name="location"
                  autoComplete="address-level2"
                  placeholder="Frisco, Texas, USA"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  aria-invalid={error ? true : undefined}
                  className={fieldClass}
                />
              </span>
            </label>
            {error ? (
              <p role="alert" className="text-sm text-[#c2410c]">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className={`inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[var(--sending-blue)] text-[15px] font-semibold text-white hover:bg-[var(--sending-blue-hover)] active:bg-[var(--sending-blue-hover)] disabled:cursor-not-allowed disabled:opacity-70 ${FOCUS}`}
            >
              {submitting ? "Sending…" : "Get Started"}
              {submitting ? null : <ArrowRight aria-hidden size={16} />}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
