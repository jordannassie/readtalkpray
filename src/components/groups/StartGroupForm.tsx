"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { LeaderPhotoField } from "@/components/groups/LeaderPhotoField";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isWebsitePhone } from "@/lib/leads/website";
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
  application,
}: {
  email: string;
  name?: string;
  application?: { status: string; review_message: string | null } | null;
}) {
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [timeZone, setTimeZone] = useState(LAUNCH_TIME_ZONE);
  const [meetingDay, setMeetingDay] = useState("Sunday");
  const [meetingTime, setMeetingTime] = useState("09:00");
  const [duration, setDuration] = useState("1 hour");
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

  async function uploadPhoto(file: File) {
    if (!isSupabaseConfigured()) return null;
    if (file.size > 2_000_000) throw new Error("Use a photo under 2 MB.");
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    if (!["jpg", "jpeg", "png", "webp"].includes(ext)) throw new Error("Use a JPG, PNG, or WebP photo.");
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error("Sign in before adding a photo.");
    const path = `applications/${auth.user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("rtp-photos").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (uploadError) return null;
    return supabase.storage.from("rtp-photos").getPublicUrl(path).data.publicUrl;
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
      let leaderPhotoUrl: string | null = null;
      if (photoFile && photoFile.size > 0) {
        leaderPhotoUrl = await uploadPhoto(photoFile);
      }
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
          attended: form.get("attended") === "on",
          faithAgreed: form.get("faithAgreed") === "on",
          commitmentsAgreed: form.get("commitmentsAgreed") === "on",
          zoomAgreed: form.get("zoomAgreed") === "on",
          privacyAgreed: form.get("privacyAgreed") === "on",
        }),
      });
      const body = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !body.ok) {
        setError(body.error || "Something went wrong. Please try again.");
        lock.current = false;
        setSubmitting(false);
        return;
      }
      setSaved(true);
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

  if (saved) {
    return (
      <p role="status" className="rounded-[28px] bg-white p-8 text-lg font-medium shadow-sm">
        Thank you. Your group is pending approval. It will appear on the map after it is reviewed.
      </p>
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
      <LeaderPhotoField onChange={setPhotoFile} />
      <Field label="Your name" name="name" required autoComplete="name" defaultValue={name} />
      <label className="block text-sm font-medium">
        Email
        <input name="email" type="email" readOnly value={email} className={fieldClass} />
      </label>
      <Field label="Group name" name="groupName" required />
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
      <Check name="attended" label="I have attended a Read Talk Pray group at least once." />
      <Check name="faithAgreed" label="I agree to the Read Talk Pray statement of faith." />
      <Check name="commitmentsAgreed" label="I agree to the leader commitments: live in a way that reflects Jesus, teach from Scripture, serve people, and stay accountable." />
      <Check name="zoomAgreed" label="I agree to join the monthly leader Zoom meeting." />
      <Check name="privacyAgreed" label="I agree that Read Talk Pray may contact me about this application, and that people who ask to join my group may share their name and phone number with me." />
      {error ? <p role="alert" className="text-sm text-[#c2410c]">{error}</p> : null}
      <button type="submit" disabled={submitting} className="inline-flex h-[52px] w-full items-center justify-center rounded-full bg-[var(--sending-blue)] font-semibold text-white disabled:opacity-70">
        {submitting ? "Sending…" : "Submit group"}
      </button>
    </form>
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
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  onBlur?: () => void;
  defaultValue?: string;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input name={name} type={type} required={required} placeholder={placeholder} autoComplete={autoComplete} onBlur={onBlur} defaultValue={defaultValue} className={fieldClass} />
    </label>
  );
}

function Check({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex items-start gap-3 text-sm leading-relaxed">
      <input name={name} type="checkbox" required className="mt-1" />
      <span>{label}</span>
    </label>
  );
}
