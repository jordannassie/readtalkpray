"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowRight, MapPin, Phone, User } from "lucide-react";
import { PASTORS, STAR_IMAGE } from "@/lib/demo/data";
import { formatTimeRange, getLocations } from "@/lib/locations";
import type { SendingLocation } from "@/lib/locations/types";
import { isWebsitePhone } from "@/lib/leads/website";
import { rsvpConfirmationText } from "@/lib/rsvp/messages";
import { submitSundayRsvp, syncStoredSundayRsvps } from "@/lib/rsvp/save";

function sundayTime(location: SendingLocation) {
  return formatTimeRange(
    location.church_start_time,
    location.church_end_time,
  ).replace("–", " – ");
}

export function SundayRsvp() {
  const locations = getLocations();
  const [locationId, setLocationId] = useState(locations[0]?.location_id ?? "");
  const [firstName, setFirstName] = useState("");
  const [mobile, setMobile] = useState("");
  const [savedName, setSavedName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const location =
    locations.find((item) => item.location_id === locationId) ?? locations[0];

  useEffect(() => {
    void syncStoredSundayRsvps();
  }, []);

  if (!location) return null;

  function resetSubmission() {
    submittingRef.current = false;
    setSubmitting(false);
    setSavedName("");
    setError("");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    const name = firstName.trim();
    const phone = mobile.trim();

    if (!name || !phone) {
      setError("First name and mobile number are needed.");
      return;
    }

    if (!isWebsitePhone(phone)) {
      setError("Enter a valid mobile number.");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setError("");

    try {
      const saved = await submitSundayRsvp({
        first_name: name,
        mobile: phone,
        location_id: location.location_id,
      });
      if (!saved) {
        submittingRef.current = false;
        setSubmitting(false);
        setError("Something went wrong. Please try again.");
        return;
      }
      setSavedName(name);
    } catch {
      submittingRef.current = false;
      setSubmitting(false);
      setError("Something went wrong. Please try again.");
    }
  }

  const fieldClass =
    "h-[52px] w-full rounded-2xl border border-[#e6e6e6] bg-[#f7f7f7] pr-4 pl-11 text-sm text-[#111] outline-none placeholder:text-[#8a8a8a] focus:border-[var(--sending-blue)] focus:bg-white focus:ring-2 focus:ring-[var(--sending-blue)]/25";

  return (
    <section
      id="sunday"
      aria-labelledby="sunday-heading"
      className="scroll-mt-20 bg-black text-white"
    >
      <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-16 lg:py-24">
        <h2
          id="sunday-heading"
          className="text-center text-5xl font-semibold tracking-[-0.04em] text-white sm:text-7xl sm:leading-[0.92]"
        >
          Join us on Sundays.
        </h2>
        <p className="mt-4 max-w-md text-center text-lg leading-snug text-balance text-white/70 sm:mt-5 sm:text-xl">
          A Bible study. A community. A place for you.
        </p>

        <div
          id="sunday-rsvp"
          className="mt-10 w-full rounded-[28px] border border-black/5 bg-white p-6 text-[#111] shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:p-8"
        >
          {locations.length > 1 ? (
            <label className="mb-5 block">
              <span className="text-[11px] font-medium tracking-[0.16em] text-[#777] uppercase">
                Select Location
              </span>
              <select
                value={location.location_id}
                onChange={(event) => {
                  setLocationId(event.target.value);
                  resetSubmission();
                }}
                className="mt-2 h-12 w-full rounded-2xl border border-[#e6e6e6] bg-[#f7f7f7] px-4 text-sm text-[#111] outline-none focus:border-[var(--sending-blue)]"
              >
                {locations.map((item) => (
                  <option key={item.location_id} value={item.location_id}>
                    {item.location_name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <p className="text-sm font-medium text-[#111]">
            Sending · {location.city}
          </p>
          <p className="mt-3 text-lg font-semibold tracking-tight">
            {location.church_day} · {sundayTime(location)}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Image
              src={STAR_IMAGE}
              alt="The Star in Frisco"
              width={560}
              height={360}
              className="h-32 w-48 shrink-0 rounded-xl object-cover"
            />
            <a
              href={location.map_url}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 rounded-sm text-sm text-[#333] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sending-blue)]"
            >
              <span className="flex items-center gap-1.5 font-medium text-[#111]">
                <MapPin aria-hidden size={14} className="shrink-0 text-[var(--sending-blue)]" />
                {location.venue_name}
              </span>
              <span className="mt-0.5 block text-[#333]">{location.address}</span>
            </a>
          </div>
          {location.leader_name ? (
            <p className="mt-3 flex items-center gap-3 text-sm text-[#333]">
              <span className="flex shrink-0 items-center gap-2">
                {location.leader_photo_url ? (
                  <Image
                    src={location.leader_photo_url}
                    alt=""
                    width={128}
                    height={128}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : null}
                <Image
                  src={PASTORS.susieImage}
                  alt=""
                  width={128}
                  height={128}
                  className="h-16 w-16 rounded-full object-cover"
                />
              </span>
              <span>Jordan &amp; Susie</span>
            </p>
          ) : null}

          <div className="my-6 h-px bg-black/10" />

          {savedName ? (
            <div role="status">
              <h3 className="text-2xl font-semibold tracking-tight">You’re in.</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#444]">
                We’ll text you the location details and a reminder before Sunday.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#555]">
                {rsvpConfirmationText(savedName)}
              </p>
            </div>
          ) : (
            <form className="space-y-3" onSubmit={onSubmit} noValidate>
              <h3 className="pb-1 text-xl font-semibold tracking-tight">I’m Coming Sunday</h3>
              <label className="block">
                <span className="sr-only">First Name</span>
                <span className="relative block">
                  <User
                    aria-hidden
                    size={18}
                    strokeWidth={1.75}
                    className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#b5b5b5]"
                  />
                  <input
                    required
                    name="firstName"
                    autoComplete="given-name"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    aria-invalid={error ? true : undefined}
                    className={fieldClass}
                  />
                </span>
              </label>
              <label className="block">
                <span className="sr-only">Mobile Number</span>
                <span className="relative block">
                  <Phone
                    aria-hidden
                    size={18}
                    strokeWidth={1.75}
                    className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#b5b5b5]"
                  />
                  <input
                    required
                    type="tel"
                    inputMode="tel"
                    name="mobile"
                    autoComplete="tel"
                    placeholder="Mobile Number"
                    value={mobile}
                    onChange={(event) => setMobile(event.target.value)}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? "sunday-rsvp-error" : "sunday-rsvp-note"}
                    className={fieldClass}
                  />
                </span>
              </label>
              {error ? (
                <p id="sunday-rsvp-error" role="alert" className="text-sm text-[#c2410c]">
                  {error}
                </p>
              ) : (
                <p id="sunday-rsvp-note" className="text-sm leading-relaxed text-[#444]">
                  We’ll text you the location details and a reminder before Sunday.
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                aria-busy={submitting}
                className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[var(--sending-blue)] text-[15px] font-semibold text-white transition-colors hover:bg-[var(--sending-blue-hover)] active:bg-[var(--sending-blue-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sending-blue)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Sending…" : "I’m Coming Sunday"}
                {submitting ? null : <ArrowRight aria-hidden size={16} />}
              </button>
            </form>
          )}
          <p className="mt-5 text-sm text-[#444]">Come as you are. We’d love to meet you.</p>
        </div>
      </div>
    </section>
  );
}
