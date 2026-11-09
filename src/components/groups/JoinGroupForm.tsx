"use client";

import { FormEvent, useRef, useState } from "react";
import { ArrowRight, Mail, Phone, User } from "lucide-react";
import { isWebsitePhone } from "@/lib/leads/website";
import { meetingWhen, type PublicGroup } from "@/lib/groups/types";

const fieldClass =
  "h-[52px] w-full rounded-2xl border border-[#e6e6e6] bg-[#f7f7f7] pr-4 pl-11 text-sm text-[#111] outline-none placeholder:text-[#8a8a8a] focus:border-[var(--sending-blue)] focus:bg-white";

export function JoinGroupForm({ group }: { group: PublicGroup }) {
  const [firstName, setFirstName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState<"new" | "duplicate" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const lock = useRef(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
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
    lock.current = true;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ groupId: group.id, firstName: name, mobile: phone, email }),
      });
      const body = (await response.json()) as { ok?: boolean; duplicate?: boolean };
      if (!response.ok || !body.ok) {
        setError("Something went wrong. Please try again.");
        lock.current = false;
        setSubmitting(false);
        return;
      }
      setDone(body.duplicate ? "duplicate" : "new");
    } catch {
      setError("Something went wrong. Please try again.");
      lock.current = false;
      setSubmitting(false);
    }
  }

  const home = group.location_type === "home";

  return (
    <div className="w-full rounded-[28px] bg-white p-6 text-[#111] shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:p-8">
      <p className="text-sm font-medium">Read Talk Pray · {group.city}</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{group.name}</h1>
      <p className="mt-2 text-lg font-semibold">{meetingWhen(group) || "Time to be announced"}</p>
      <div className="mt-4 overflow-hidden rounded-2xl border border-[#eee]">
        <iframe
          title={`Map of ${group.public_location}`}
          className="h-36 w-full"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${group.longitude - 0.08}%2C${group.latitude - 0.05}%2C${group.longitude + 0.08}%2C${group.latitude + 0.05}&layer=mapnik&marker=${group.latitude}%2C${group.longitude}`}
        />
      </div>
      <p className="mt-3 text-sm text-[#333]">
        <span className="font-medium">{home ? "Approximate area" : group.public_location}</span>
        {home ? <span className="mt-1 block">{group.public_location}. The exact address is shared after the leader confirms you are coming.</span> : null}
        {!home && group.address ? <span className="mt-1 block">{group.address}</span> : null}
      </p>
      <p className="mt-3 flex items-center gap-3 text-sm">
        {group.leader_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={group.leader_photo_url} alt="" className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--sending-blue)] font-semibold text-white">
            {group.leader_name.slice(0, 1)}
          </span>
        )}
        <span>{group.leader_name}</span>
      </p>
      {group.description ? <p className="mt-3 text-sm leading-relaxed text-[#444]">{group.description}</p> : null}
      <div className="my-6 h-px bg-black/10" />
      {done ? (
        <div role="status">
          <h2 className="text-2xl font-semibold tracking-tight">{done === "duplicate" ? "You’re already on the list." : "You’re in."}</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#444]">
            {done === "duplicate"
              ? `${group.leader_name} already has your request for ${group.name}.`
              : home
                ? `${group.leader_name} will follow up with the exact address and a reminder before you meet.`
                : `${group.leader_name} has your request and will send a reminder before you meet.`}
          </p>
        </div>
      ) : (
        <form className="space-y-3" onSubmit={onSubmit} noValidate>
          <h2 className="pb-1 text-xl font-semibold tracking-tight">I’m Coming</h2>
          <label className="block">
            <span className="sr-only">First Name</span>
            <span className="relative block">
              <User aria-hidden size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#b5b5b5]" />
              <input required name="firstName" autoComplete="given-name" placeholder="First Name" value={firstName} onChange={(event) => setFirstName(event.target.value)} className={fieldClass} />
            </span>
          </label>
          <label className="block">
            <span className="sr-only">Mobile Number</span>
            <span className="relative block">
              <Phone aria-hidden size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#b5b5b5]" />
              <input required type="tel" inputMode="tel" name="mobile" autoComplete="tel" placeholder="Mobile Number" value={mobile} onChange={(event) => setMobile(event.target.value)} className={fieldClass} />
            </span>
          </label>
          <label className="block">
            <span className="sr-only">Email, optional</span>
            <span className="relative block">
              <Mail aria-hidden size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#b5b5b5]" />
              <input type="email" name="email" autoComplete="email" placeholder="Email (optional)" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} />
            </span>
          </label>
          {error ? <p role="alert" className="text-sm text-[#c2410c]">{error}</p> : (
            <p className="text-sm leading-relaxed text-[#444]">The group leader will follow up with the details and a reminder.</p>
          )}
          <button type="submit" disabled={submitting} className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[var(--sending-blue)] text-[15px] font-semibold text-white disabled:opacity-70">
            {submitting ? "Sending…" : "I’m Coming"}
            {submitting ? null : <ArrowRight size={16} />}
          </button>
        </form>
      )}
      <p className="mt-5 text-sm text-[#444]">Come as you are. We’d love to meet you.</p>
    </div>
  );
}
