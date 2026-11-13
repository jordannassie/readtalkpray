"use client";

import { FormEvent, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { ProfilePhoto } from "@/components/account/ProfilePhoto";
import { BELIEFS } from "@/components/home/Beliefs";
import { isWebsitePhone } from "@/lib/leads/website";
import { APPLICATION_PRIVACY, LEADER_COMMITMENTS, LEADER_COMMITMENT_SCRIPTURE } from "@/lib/groups/commitments";
import { MEETING_DAYS, MEETING_DURATIONS } from "@/lib/groups/schedule";
import { LAUNCH_TIME_ZONE, isIanaTimeZone } from "@/lib/groups/sunday";
import { LOCATION_TYPES } from "@/lib/groups/types";

const fieldClass =
  "mt-2 h-[52px] w-full rounded-2xl border border-[#e6e6e6] bg-[#f7f7f7] px-4 text-sm outline-none focus:border-[var(--sending-blue)] focus:bg-white";

const TIME_ZONES = [
  "America/Chicago",
  "America/New_York",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Africa/Lagos",
  "Asia/Manila",
  "Asia/Seoul",
  "Australia/Sydney",
  "Pacific/Auckland",
];

export function StartGroupForm({
  email,
  name = "",
  userId,
  photoUrl = null,
  googlePhotoUrl = null,
  phone = null,
  application,
}: {
  email: string;
  name?: string;
  userId: string;
  photoUrl?: string | null;
  googlePhotoUrl?: string | null;
  phone?: string | null;
  application?: { status: string; review_message: string | null } | null;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [leaderPhotoUrl, setLeaderPhotoUrl] = useState(photoUrl);
  const [timeZone, setTimeZone] = useState(LAUNCH_TIME_ZONE);
  const [meetingDay, setMeetingDay] = useState("Sunday");
  const [meetingTime, setMeetingTime] = useState("09:00");
  const [duration, setDuration] = useState("1 hour");
  const [leaderAgreed, setLeaderAgreed] = useState(false);
  const zoneTouched = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const lock = useRef(false);

  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (isIanaTimeZone(detected)) setTimeZone(detected);
  }, []);

  async function suggestZone() {
    if (zoneTouched.current || !formRef.current) return;
    const data = new FormData(formRef.current);
    const city = String(data.get("city") ?? "").trim();
    if (city.length < 2) return;
    const query = [city, data.get("state"), data.get("country")].filter(Boolean).join(", ");
    try {
      const response = await fetch(`/api/places?q=${encodeURIComponent(query)}&zone=1`);
      const body = (await response.json()) as { place?: { timeZone?: string | null } };
      const next = body.place?.timeZone;
      if (next && isIanaTimeZone(next) && !zoneTouched.current) setTimeZone(next);
    } catch {
      // The visitor can still choose a time zone by hand.
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    const form = new FormData(event.currentTarget);
    const mobile = String(form.get("mobile") ?? "");
    if (!isWebsitePhone(mobile)) {
      setError("Enter a valid mobile number, including the country code outside the US.");
      return;
    }
    lock.current = true;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/groups/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          leaderName: form.get("name"),
          groupName: form.get("groupName"),
          email,
          mobile,
          city: form.get("city"),
          state: form.get("state"),
          country: form.get("country"),
          locationType: form.get("locationType"),
          meetingLocation: form.get("meetingLocation"),
          meetingDay,
          meetingTime,
          duration,
          timezone: timeZone,
          description: form.get("description"),
          leaderPhotoUrl,
          leaderAgreement: leaderAgreed,
        }),
      });
      const body = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !body.ok) {
        setError(body.error || "Something went wrong. Please try again.");
        lock.current = false;
        setSubmitting(false);
        return;
      }
      router.push("/app");
      router.refresh();
      return;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
      lock.current = false;
      setSubmitting(false);
    }
  }

  if (application?.status === "pending" || application?.status === "approved" || application?.status === "suspended") {
    return (
      <div className="rounded-[28px] bg-white p-8 shadow-sm">
        <p className="text-lg font-medium">
          {application.status === "pending"
            ? "Your application is being reviewed. Our team will contact you before your group is approved."
            : "Your application is already on file. Open your dashboard to see the status."}
        </p>
        <a href="/app" className="mt-4 inline-flex min-h-12 items-center text-sm font-semibold text-[#1976F3]">Open the app</a>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4 rounded-[28px] bg-white p-6 shadow-sm sm:p-8" noValidate>
      {application?.status === "changes_requested" ? (
        <p className="rounded-2xl bg-[#fff7ed] px-4 py-3 text-sm text-[#9a3412]">{application.review_message || "A reviewer asked for changes."}</p>
      ) : null}
      {application?.status === "rejected" ? (
        <p className="rounded-2xl bg-[#fff7ed] px-4 py-3 text-sm text-[#9a3412]">{application.review_message || "The last application was not approved. You can submit a new one."}</p>
      ) : null}
      <ProfilePhoto
        userId={userId}
        name={name || null}
        email={email}
        photoUrl={leaderPhotoUrl}
        googlePhotoUrl={googlePhotoUrl}
        fullName={name || null}
        phone={phone}
        size={144}
        onSaved={setLeaderPhotoUrl}
      />
      <Field label="Your name" name="name" required autoComplete="name" defaultValue={name} />
      <label className="block text-sm font-medium">
        Email
        <input name="email" type="email" readOnly value={email} className={fieldClass} />
      </label>
      <Field
        label="Group Name"
        name="groupName"
        required
        placeholder="e.g. Nashville Bible Group"
        hint="Use your city or neighborhood so people can easily find your group."
      />
      <Field label="Mobile number" name="mobile" type="tel" required autoComplete="tel" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="City" name="city" required onBlur={() => void suggestZone()} />
        <Field label="State" name="state" />
        <Field label="Country" name="country" required placeholder="United States" />
      </div>
      <label className="block text-sm font-medium">
        Location type
        <select name="locationType" required className={fieldClass} defaultValue="public_venue">
          {LOCATION_TYPES.map((type) => (
            <option key={type} value={type}>
              {type === "public_venue" ? "Public place" : type === "home" ? "Home" : "Other"}
            </option>
          ))}
        </select>
      </label>
      <Field label="Meeting location" name="meetingLocation" required placeholder="Coffee shop, workplace, or home" />
      <p className="-mt-2 text-sm text-[#666]">For a home group, the public map shows the city area. The street address stays private until you confirm someone is coming.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Meeting day
          <select name="meetingDay" required className={fieldClass} value={meetingDay} onChange={(event) => setMeetingDay(event.target.value)}>
            {MEETING_DAYS.map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Meeting time
          <input name="meetingTime" type="time" required value={meetingTime} onChange={(event) => setMeetingTime(event.target.value)} className={fieldClass} />
        </label>
      </div>
      <label className="block text-sm font-medium">
        Meeting duration
        <select name="duration" className={fieldClass} value={duration} onChange={(event) => setDuration(event.target.value)}>
          {MEETING_DURATIONS.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <span className="mt-1 block text-sm font-normal text-[#666]">Optional. Most groups meet for about one hour.</span>
      </label>
      <label className="block text-sm font-medium">
        Local time zone
        <select
          name="timezone"
          required
          className={fieldClass}
          value={timeZone}
          onChange={(event) => {
            zoneTouched.current = true;
            setTimeZone(event.target.value);
          }}
        >
          {timeZone && !TIME_ZONES.includes(timeZone) ? <option value={timeZone}>{timeZone}</option> : null}
          {TIME_ZONES.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium">
        Group description
        <textarea name="description" rows={4} className="mt-2 w-full rounded-2xl border border-[#e6e6e6] bg-[#f7f7f7] px-4 py-3 text-sm outline-none focus:border-[var(--sending-blue)] focus:bg-white" placeholder="Who the group is for, and what you read together." />
      </label>
      <fieldset className="space-y-3">
        <legend className="text-base font-semibold">Leader Agreement</legend>
        <Accordion title="Statement of Faith">
          <p>We believe the Bible is God&apos;s Word, Jesus Christ is Lord, and every believer is called to follow Jesus, make disciples, and share the gospel with the world.</p>
          <ol className="mt-3 space-y-3">
            {BELIEFS.map((item, index) => (
              <li key={item.title}>
                <p className="font-semibold">{index + 1}. {item.title}</p>
                <p>{item.body}</p>
                <p className="text-[#666]">Scripture: {item.scripture}</p>
              </li>
            ))}
          </ol>
        </Accordion>
        <Accordion title="Leader Commitments">
          {LEADER_COMMITMENTS.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p className="text-[#666]">{LEADER_COMMITMENT_SCRIPTURE}</p>
        </Accordion>
        <Accordion title="Privacy">
          {APPLICATION_PRIVACY.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </Accordion>
        <label className="flex items-start gap-3 text-sm leading-relaxed">
          <input
            name="leaderAgreement"
            type="checkbox"
            required
            checked={leaderAgreed}
            onChange={(event) => setLeaderAgreed(event.target.checked)}
            className="mt-1"
          />
          <span>I have read and agree to the Statement of Faith and Leader Commitments.</span>
        </label>
      </fieldset>
      {error ? <p role="alert" className="text-sm text-[#c2410c]">{error}</p> : null}
      <button type="submit" disabled={!leaderAgreed || submitting} className="inline-flex h-[52px] w-full items-center justify-center rounded-full bg-[var(--sending-blue)] font-semibold text-white disabled:opacity-70">
        {submitting ? "Sending…" : "Submit group"}
      </button>
    </form>
  );
}

function Accordion({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="rounded-2xl border border-[#e6e6e6] bg-[#f7f7f7] px-4 py-3 text-sm leading-relaxed">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">
        {title}
        <ChevronDown size={16} aria-hidden />
      </summary>
      <div className="mt-3 space-y-2">{children}</div>
    </details>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  autoComplete,
  onBlur,
  defaultValue,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  onBlur?: () => void;
  defaultValue?: string;
  hint?: string;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input name={name} type={type} required={required} placeholder={placeholder} autoComplete={autoComplete} onBlur={onBlur} defaultValue={defaultValue} className={fieldClass} />
      {hint ? <span className="mt-1 block text-sm font-normal text-[#666]">{hint}</span> : null}
    </label>
  );
}

