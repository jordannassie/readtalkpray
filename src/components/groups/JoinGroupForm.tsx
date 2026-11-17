"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Calendar, Check, MapPin, User, Users } from "lucide-react";
import { GroupMembersDisplay } from "@/components/groups/GroupMembersDisplay";
import { PhoneInput } from "@/components/phone/PhoneInput";
import { LeaderFaces } from "@/components/groups/LeaderFaces";
import { LocationPreview } from "@/components/groups/LocationPreview";
import { normalizePhone } from "@/lib/phone";
import { LiveStatus } from "@/components/groups/LiveStatus";
import { cityState, groupMeUrl, leaderLine, meetingWhen, venueName, type PublicGroup } from "@/lib/groups/types";

const fieldClass =
  "h-12 w-full rounded-2xl border border-[#e6e6e6] bg-[#f7f7f7] pr-4 pl-11 text-base text-[#111] outline-none placeholder:text-[#8a8a8a] focus:border-[#16A34A] focus:bg-white";

export function JoinGroupForm({
  group,
  variant = "page",
  onFindAnother,
  preview = false,
  hideJoin = false,
  compact = false,
  statusLabel,
  availability,
  footer,
  faces,
}: {
  group: PublicGroup;
  variant?: "page" | "panel";
  onFindAnother?: () => void;
  preview?: boolean;
  hideJoin?: boolean;
  compact?: boolean;
  statusLabel?: string;
  availability?: "live" | "paused";
  footer?: ReactNode;
  faces?: "sm" | "md" | "lg" | "profile";
}) {
  const [firstName, setFirstName] = useState("");
  const [mobile, setMobile] = useState("");
  const [errors, setErrors] = useState<{ firstName?: string; mobile?: string; form?: string }>({});
  const [done, setDone] = useState<"new" | "duplicate" | "demo" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const lock = useRef(false);
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (hideJoin || preview || done) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    nameRef.current?.focus({ preventScroll: true });
  }, [hideJoin, preview, done]);
  const home = group.location_type === "home";
  const when = meetingWhen(group) || "Time to be announced";
  const place = home ? `${cityState(group) || group.city} area` : cityState(group) || group.public_location;
  const venue = venueName(group);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (preview || lock.current || done) return;
    const name = firstName.trim();
    const phone = mobile.trim();
    const next: { firstName?: string; mobile?: string } = {};
    if (!name) next.firstName = "Enter your first name.";
    if (!normalizePhone(phone)) next.mobile = "Enter a valid mobile number.";
    if (next.firstName || next.mobile) {
      setErrors(next);
      return;
    }
    if (group.is_demo) {
      setErrors({});
      setDone("demo");
      return;
    }
    lock.current = true;
    setSubmitting(true);
    setErrors({});
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
        setErrors({ form: "Something went wrong. Please try again." });
        lock.current = false;
        setSubmitting(false);
        return;
      }
      setDone(body.duplicate ? "duplicate" : "new");
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
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
          <h2 className={`${variant === "page" ? "text-2xl" : "line-clamp-2 text-[22px]"} font-semibold tracking-tight`}>{group.name}</h2>
          <p className="mt-2 flex items-center gap-2 text-[15px] font-semibold text-[#142033]">
            <Calendar size={16} className="shrink-0 text-[#1976F3]" aria-hidden />
            {when}
          </p>
          <p className="mt-1 flex items-start gap-2 text-sm text-[#52627a]">
            <MapPin size={16} className="mt-0.5 shrink-0 text-[#1976F3]" aria-hidden />
            <span>{place}</span>
          </p>
          {venue ? <p className="mt-1 pl-6 text-sm text-[#52627a]">{venue}</p> : null}
          {typeof group.members === "number" ? (
            <div className="mt-2">
              <GroupMembersDisplay groupId={group.id} count={group.members} example={group.is_demo} compact={variant === "panel"} />
            </div>
          ) : null}
          {availability ? <p className="mt-3"><LiveStatus live={availability === "live"} /></p> : statusLabel ? <p className="mt-3"><span className="inline-flex rounded-full bg-[#e8f8ee] px-3 py-1 text-xs font-semibold text-[#157a3a]">{statusLabel}</span></p> : null}
        </div>
        <div className="relative shrink-0">
          <LeaderFaces leaderName={group.leader_name} leaderPhoto={group.leader_photo_url} coLeaderName={group.co_leader_name} coLeaderPhoto={group.co_leader_photo_url} size={faces ?? (variant === "panel" ? "md" : "lg")} />
          {!hideJoin && group.is_demo ? (
            <span className="absolute -top-1 -right-1 rounded-full bg-[#e7f0ff] px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-[#1976F3] uppercase">Demo</span>
          ) : null}
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-[#142033]">Led by {leaderLine(group)}</p>
      {variant === "page" ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#eee]">
          <iframe
            title={`Map of ${group.public_location}`}
            className="h-36 w-full"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${group.longitude - 0.08}%2C${group.latitude - 0.05}%2C${group.longitude + 0.08}%2C${group.latitude + 0.05}&layer=mapnik&marker=${group.latitude}%2C${group.longitude}`}
          />
        </div>
      ) : null}
      {!compact && home ? (
        <p className="mt-2 text-sm leading-relaxed text-[#52627a]">The exact address is shared after the leader confirms you are coming.</p>
      ) : null}
      {!compact && variant === "page" && !home && group.address && group.address !== venue ? <p className="mt-2 text-sm text-[#333]">{group.address}</p> : null}
      {!compact && group.description ? <p className={`mt-3 text-sm leading-relaxed text-[#52627a] ${variant === "panel" ? "line-clamp-2" : ""}`}>{group.description}</p> : null}
      {!hideJoin && groupMeUrl(group.groupme_url) ? (
        <a href={groupMeUrl(group.groupme_url) ?? undefined} className="mt-4 inline-flex h-11 items-center text-sm font-semibold text-[#1976F3]">Join GroupMe</a>
      ) : null}
      {preview && Number.isFinite(group.latitude) && Number.isFinite(group.longitude) && (group.latitude !== 0 || group.longitude !== 0) ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#eee]">
          <LocationPreview latitude={group.latitude} longitude={group.longitude} photoUrl={group.leader_photo_url} name={group.leader_name} />
        </div>
      ) : null}

      {hideJoin ? (
        footer ? <div className="mt-5 border-t border-[#e6ebf2] pt-5">{footer}</div> : null
      ) : (
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
                  ref={nameRef}
                  placeholder="First Name"
                  value={firstName}
                  onChange={(event) => {
                    setFirstName(event.target.value);
                    setErrors((current) => ({ ...current, firstName: undefined, form: undefined }));
                  }}
                  aria-invalid={Boolean(errors.firstName)}
                  disabled={preview}
                  className={fieldClass}
                />
              </span>
              {errors.firstName ? <span className="mt-1 block text-sm text-[#c2410c]">{errors.firstName}</span> : null}
            </label>
            <label className="block">
              <span className="sr-only">Mobile Number</span>
              <PhoneInput
                name="mobile"
                required
                placeholder="Mobile Number"
                value={mobile}
                onChange={(value) => {
                  setMobile(value);
                  setErrors((current) => ({ ...current, mobile: undefined, form: undefined }));
                }}
                invalid={Boolean(errors.mobile)}
                disabled={preview}
                className={fieldClass}
              />
              {errors.mobile ? <span className="mt-1 block text-sm text-[#c2410c]">{errors.mobile}</span> : null}
            </label>
            {errors.form ? <p role="alert" className="text-sm text-[#c2410c]">{errors.form}</p> : null}
            <button
              type={preview ? "button" : "submit"}
              disabled={preview || submitting}
              aria-busy={submitting}
              className="group inline-flex h-14 min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#16A34A] text-base font-bold text-white disabled:opacity-70"
            >
              {submitting ? "Sending…" : "I’m Coming"}
              {submitting ? null : <ArrowRight size={18} aria-hidden className="transition-transform duration-200 ease-out group-hover:translate-x-1.5 group-active:translate-x-1.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-active:translate-x-0" />}
            </button>
          </form>
      </div>
      )}
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
        {demo ? "This is a preview." : done === "duplicate" ? "You’re already on the list." : "You’re coming!"}
      </h3>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[#52627a]">
        {demo
          ? "Nothing was saved, and no one was notified. Sample groups do not take reservations."
          : done === "duplicate"
            ? `${leaderName} already has your request for ${groupName}.`
            : "Your group leader will be in touch."}
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

