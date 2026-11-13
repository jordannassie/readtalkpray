"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { ArrowRight, Calendar, Check, MapPin, Phone, User, Users } from "lucide-react";
import { LocationPreview } from "@/components/groups/LocationPreview";
import { isWebsitePhone } from "@/lib/leads/website";
import { meetingWhen, type PublicGroup } from "@/lib/groups/types";

const fieldClass =
  "h-12 w-full rounded-2xl border border-[#e6e6e6] bg-[#f7f7f7] pr-4 pl-11 text-base text-[#111] outline-none placeholder:text-[#8a8a8a] focus:border-[#16A34A] focus:bg-white";

export function JoinGroupForm({
  group,
  variant = "page",
  onFindAnother,
  preview = false,
}: {
  group: PublicGroup;
  variant?: "page" | "panel";
  onFindAnother?: () => void;
  preview?: boolean;
}) {
  const [firstName, setFirstName] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState<"new" | "duplicate" | "demo" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const lock = useRef(false);
  const home = group.location_type === "home";
  const when = meetingWhen(group) || "Time to be announced";
  const place = home ? `${group.public_location} · approximate` : group.public_location;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (preview || lock.current || done) return;
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
    if (group.is_demo) {
      setError("");
      setDone("demo");
      return;
    }
    lock.current = true;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ groupId: group.id, firstName: name, mobile: phone }),
      });
      const body = (await response.json()) as { ok?: boolean; duplicate?: boolean; demo?: boolean };
      if (body.demo || (group.is_demo && !body.ok)) {
        setDone("demo");
        lock.current = false;
        setSubmitting(false);
        return;
      }
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

  if (done) {
    return (
      <div className={variant === "page" ? "w-full rounded-[28px] bg-white p-6 text-[#111] shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:p-8" : "text-[#111]"}>
        <Confirmation done={done} leaderName={group.leader_name} groupName={group.name} onFindAnother={onFindAnother} />
      </div>
    );
  }

  return (
    <div className={variant === "page" ? "w-full rounded-[28px] bg-white p-6 text-[#111] shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:p-8" : "text-[#111]"}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className={`${variant === "page" ? "text-2xl" : "text-[22px]"} font-semibold tracking-tight`}>{group.name}</h2>
          <p className="mt-2 flex items-center gap-2 text-[15px] font-semibold text-[#142033]">
            <Calendar size={16} className="shrink-0 text-[#1976F3]" aria-hidden />
            {when}
          </p>
          <p className="mt-1 flex items-start gap-2 text-sm text-[#52627a]">
            <MapPin size={16} className="mt-0.5 shrink-0 text-[#1976F3]" aria-hidden />
            <span>{place}</span>
          </p>
        </div>
        <div className="relative shrink-0">
          <LeaderFace group={group} size={variant === "page" ? 56 : 72} />
          {preview || group.is_demo ? (
            <span className="absolute -top-1 -right-1 rounded-full bg-[#e7f0ff] px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-[#1976F3] uppercase">{preview ? "Preview" : "Demo"}</span>
          ) : null}
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-[#142033]">Led by {group.leader_name}</p>
      {variant === "page" ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#eee]">
          <iframe
            title={`Map of ${group.public_location}`}
            className="h-36 w-full"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${group.longitude - 0.08}%2C${group.latitude - 0.05}%2C${group.longitude + 0.08}%2C${group.latitude + 0.05}&layer=mapnik&marker=${group.latitude}%2C${group.longitude}`}
          />
        </div>
      ) : null}
      {home ? (
        <p className="mt-2 text-sm leading-relaxed text-[#52627a]">The exact address is shared after the leader confirms you are coming.</p>
      ) : null}
      {!home && group.address ? <p className="mt-2 text-sm text-[#333]">{group.address}</p> : null}
      {group.description ? <p className="mt-3 text-sm leading-relaxed text-[#52627a]">{group.description}</p> : null}
      {preview && Number.isFinite(group.latitude) && Number.isFinite(group.longitude) && (group.latitude !== 0 || group.longitude !== 0) ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#eee]">
          <LocationPreview latitude={group.latitude} longitude={group.longitude} photoUrl={group.leader_photo_url} name={group.leader_name} />
        </div>
      ) : null}

      <div className="mt-5 border-t border-[#e6ebf2] pt-5">
          <form className="space-y-3" onSubmit={onSubmit} noValidate>
            <h3 className="text-xl font-semibold tracking-tight">Join This Group</h3>
            <p className="text-sm leading-relaxed text-[#52627a]">Come as you are. We’d love to meet you.</p>
            <label className="block">
              <span className="sr-only">First Name</span>
              <span className="relative block">
                <User aria-hidden size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#b5b5b5]" />
                <input
                  required
                  name="firstName"
                  autoComplete="given-name"
                  enterKeyHint="next"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  disabled={preview}
                  className={fieldClass}
                />
              </span>
            </label>
            <label className="block">
              <span className="sr-only">Mobile Number</span>
              <span className="relative block">
                <Phone aria-hidden size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#b5b5b5]" />
                <input
                  required
                  type="tel"
                  inputMode="tel"
                  name="mobile"
                  autoComplete="tel"
                  enterKeyHint="done"
                  placeholder="Mobile Number"
                  value={mobile}
                  onChange={(event) => setMobile(event.target.value)}
                  disabled={preview}
                  className={fieldClass}
                />
              </span>
            </label>
            {error ? <p role="alert" className="text-sm text-[#c2410c]">{error}</p> : null}
            <button
              type={preview ? "button" : "submit"}
              disabled={preview || submitting}
              aria-busy={submitting}
              className="inline-flex h-14 min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#16A34A] text-base font-bold text-white disabled:opacity-70"
            >
              {submitting ? "Sending…" : "I’m Coming"}
              {submitting ? null : <ArrowRight size={18} aria-hidden />}
            </button>
          </form>
      </div>
    </div>
  );
}

function Confirmation({
  done,
  leaderName,
  groupName,
  onFindAnother,
}: {
  done: "new" | "duplicate" | "demo";
  leaderName: string;
  groupName: string;
  onFindAnother?: () => void;
}) {
  const demo = done === "demo";
  return (
    <div role="status" className="px-1 py-4 text-center">
      {demo ? (
        <p className="mx-auto mb-4 inline-flex rounded-full bg-[#e7f0ff] px-2.5 py-1 text-[11px] font-bold tracking-wide text-[#1976F3] uppercase">Demo preview</p>
      ) : (
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#dcfce7] text-[#16A34A]">
          <Check size={32} aria-hidden />
        </span>
      )}
      <h3 className="mt-4 text-3xl font-semibold tracking-tight text-[#142033]">
        {demo ? "This is a preview." : done === "duplicate" ? "You’re already on the list." : "You’re on the list!"}
      </h3>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[#52627a]">
        {demo
          ? "Nothing was saved, and no one was notified. Sample groups do not take reservations."
          : done === "duplicate"
            ? `${leaderName} already has your request for ${groupName}.`
            : "Your group leader will follow up with meeting details."}
      </p>
      {onFindAnother ? (
        <button
          type="button"
          onClick={onFindAnother}
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full border-2 border-[#1976F3] text-sm font-semibold text-[#1976F3]"
        >
          Find Another Group
        </button>
      ) : (
        <Link href="/#groups" className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full border-2 border-[#1976F3] text-sm font-semibold text-[#1976F3]">
          Find Another Group
        </Link>
      )}
      <div className="mt-8">
        <Users className="mx-auto text-[#1976F3]" size={28} aria-hidden />
        <p className="mt-2 text-sm font-semibold text-[#142033]">Don’t see a group near you?</p>
        <Link href="/app/start" className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-[#1976F3]">
          Start a Group
          <ArrowRight size={14} aria-hidden />
        </Link>
      </div>
    </div>
  );
}

function LeaderFace({ group, size }: { group: PublicGroup; size: number }) {
  if (group.leader_photo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={group.leader_photo_url} alt="" width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
    );
  }
  return (
    <span className="grid shrink-0 place-items-center rounded-full bg-[var(--sending-blue)] font-semibold text-white" style={{ width: size, height: size }}>
      {group.leader_name.slice(0, 1).toUpperCase()}
    </span>
  );
}
