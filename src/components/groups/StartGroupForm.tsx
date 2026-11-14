"use client";

import { FormEvent, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { ProfilePhoto } from "@/components/account/ProfilePhoto";
import { JoinGroupForm } from "@/components/groups/JoinGroupForm";
import { publicLocationLabel } from "@/lib/groups/geo";
import { displayMeetingTime } from "@/lib/groups/schedule";
import type { PublicGroup } from "@/lib/groups/types";
import { BELIEFS } from "@/components/home/Beliefs";
import { isWebsitePhone } from "@/lib/leads/website";
import { APPLICATION_PRIVACY, LEADER_COMMITMENTS, LEADER_COMMITMENT_SCRIPTURE } from "@/lib/groups/commitments";
import { MEETING_DAYS, MEETING_DURATIONS } from "@/lib/groups/schedule";
import { LAUNCH_TIME_ZONE, isIanaTimeZone } from "@/lib/groups/sunday";
import { LOCATION_TYPES, type CoLeaderInvite, type OwnedApplication } from "@/lib/groups/types";

type FoundPlace = {
  placeId?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  label: string;
  city: string;
  state: string;
  country: string;
};

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
  invite = null,
}: {
  email: string;
  name?: string;
  userId: string;
  photoUrl?: string | null;
  googlePhotoUrl?: string | null;
  phone?: string | null;
  application?: OwnedApplication | null;
  invite?: CoLeaderInvite | null;
}) {
  const router = useRouter();
  const editing = application?.status === "pending" || application?.status === "changes_requested";
  const savedPoint = editing ? savedPlace(application) : null;
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [leaderPhotoUrl, setLeaderPhotoUrl] = useState(editing ? application?.leader_photo_url || photoUrl : photoUrl);
  const [leaderName, setLeaderName] = useState(editing ? application?.leader_name || name : name);
  const [groupName, setGroupName] = useState(editing ? application?.group_name ?? "" : "");
  const [mobile, setMobile] = useState(editing ? application?.phone || phone || "" : phone || "");
  const [city, setCity] = useState(editing ? application?.city ?? "" : "");
  const [stateName, setStateName] = useState(editing ? application?.state ?? "" : "");
  const [country, setCountry] = useState(editing ? application?.country ?? "" : "");
  const [locationType, setLocationType] = useState(editing && application?.location_type ? application.location_type : "public_venue");
  const [meetingLocation, setMeetingLocation] = useState(editing ? application?.meeting_location ?? "" : "");
  const [suggestions, setSuggestions] = useState<FoundPlace[]>([]);
  const [searchNote, setSearchNote] = useState("");
  const searchTimer = useRef<number | null>(null);
  const searchSeq = useRef(0);
  const [preview, setPreview] = useState<FoundPlace | null>(savedPoint);
  const [selectedPlace, setSelectedPlace] = useState<FoundPlace | null>(savedPoint);
  const [description, setDescription] = useState(editing ? application?.description ?? "" : "");
  const nameEdited = useRef(editing);
  const [timeZone, setTimeZone] = useState(editing && application?.timezone && isIanaTimeZone(application.timezone) ? application.timezone : LAUNCH_TIME_ZONE);
  const [meetingDay, setMeetingDay] = useState(editing && MEETING_DAYS.includes(application?.meeting_day as (typeof MEETING_DAYS)[number]) ? application?.meeting_day ?? "Sunday" : "Sunday");
  const [meetingTime, setMeetingTime] = useState(clockValue(editing ? application?.meeting_time : null));
  const [duration, setDuration] = useState(editing && MEETING_DURATIONS.includes(application?.duration as (typeof MEETING_DURATIONS)[number]) ? application?.duration ?? "1 hour" : "1 hour");
  const zoneTouched = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const lock = useRef(false);
  const [savedId, setSavedId] = useState(editing ? application?.id ?? "" : "");
  const [coLeaderOn, setCoLeaderOn] = useState(Boolean(invite && (invite.status === "pending" || invite.status === "accepted")));
  const [coLeaderName, setCoLeaderName] = useState(invite?.name ?? "");
  const [coLeaderEmail, setCoLeaderEmail] = useState(invite?.email ?? "");

  useEffect(() => {
    if (editing) return;
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (isIanaTimeZone(detected)) setTimeZone(detected);
  }, [editing]);

  useEffect(() => {
    if (editing || nameEdited.current || !name) return;
    setLeaderName(name);
  }, [editing, name]);

  function clearField(key: string) {
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

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

  function queueLocationSearch(query: string) {
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => { void searchLocation(query); }, 250);
  }

  async function searchLocation(query: string) {
    const seq = ++searchSeq.current;
    if (query.trim().length < 3) {
      setSuggestions([]);
      setSearchNote("");
      return;
    }
    const response = await fetch(`/api/places?suggest=1&q=${encodeURIComponent(query.trim())}`);
    if (seq !== searchSeq.current) return;
    const body = (await response.json()) as { places?: FoundPlace[]; error?: string };
    if (seq !== searchSeq.current) return;
    if (!response.ok || !body.places?.length) {
      setSuggestions([]);
      setSearchNote("No locations found. Try a business name or address.");
      return;
    }
    setSearchNote("");
    setSuggestions(body.places);
  }

  async function choosePlace(place: FoundPlace) {
    setSuggestions([]);
    setSearchNote("");
    let selected = place;
    if (place.placeId && !Number.isFinite(place.latitude)) {
      const response = await fetch(`/api/places?id=${encodeURIComponent(place.placeId)}`);
      const body = (await response.json()) as { place?: FoundPlace; error?: string };
      if (!response.ok || !body.place || !Number.isFinite(body.place.latitude) || !Number.isFinite(body.place.longitude)) {
        setError(body.error || "That place could not be confirmed, so it was not added.");
        return;
      }
      selected = body.place;
    }
    if (!Number.isFinite(selected.latitude) || !Number.isFinite(selected.longitude)) {
      setError("That place did not include a verified location, so it was not added.");
      return;
    }
    setSelectedPlace(selected);
    setMeetingLocation([selected.name, selected.address].filter(Boolean).join(", ") || selected.label);
    if (selected.city) setCity(selected.city);
    if (selected.state) setStateName(selected.state);
    if (selected.country) setCountry(selected.country);
    clearField("meetingLocation");
    clearField("city");
    clearField("country");
    if (locationType === "home") {
      const cityQuery = [selected.city, selected.state, selected.country].filter(Boolean).join(", ");
      const response = await fetch(`/api/places?q=${encodeURIComponent(cityQuery)}`);
      const body = (await response.json()) as { place?: { latitude: number; longitude: number; label: string } };
      setPreview(body.place ? { ...selected, latitude: body.place.latitude, longitude: body.place.longitude, label: body.place.label } : null);
      if (!body.place) setError("The city area for this home group could not be confirmed.");
      return;
    }
    setPreview(selected);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    const nextErrors: Record<string, string> = {};
    if (!leaderName.trim()) nextErrors.leaderName = "Enter your name.";
    if (!groupName.trim()) nextErrors.groupName = "Enter a group name.";
    if (!email.trim()) nextErrors.email = "Email is missing from this sign-in.";
    if (!city.trim()) nextErrors.city = "Enter a city.";
    if (!country.trim()) nextErrors.country = "Enter a country.";
    if (!selectedPlace || !Number.isFinite(selectedPlace.latitude) || !Number.isFinite(selectedPlace.longitude)) {
      nextErrors.meetingLocation = "Choose a location from the suggestions.";
    }
    if (!isWebsitePhone(mobile)) nextErrors.mobile = "Enter a valid mobile number.";
    if (coLeaderOn && !coLeaderName.trim()) nextErrors.coLeaderName = "Enter the co-leader's name.";
    if (coLeaderOn && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(coLeaderEmail.trim())) nextErrors.coLeaderEmail = "Enter the co-leader's email.";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setError("");
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
          leaderName: leaderName.trim(),
          groupName: groupName.trim(),
          email,
          mobile: mobile.trim(),
          city: city.trim(),
          state: stateName.trim(),
          country: country.trim(),
          locationType,
          meetingLocation: meetingLocation.trim(),
          latitude: selectedPlace?.latitude,
          longitude: selectedPlace?.longitude,
          meetingDay,
          meetingTime,
          duration,
          timezone: timeZone,
          description: description.trim(),
          leaderPhotoUrl,
          leaderAgreement: true,
          applicationId: savedId || undefined,
          coLeader: coLeaderOn,
          coLeaderName: coLeaderName.trim(),
          coLeaderEmail: coLeaderEmail.trim(),
        }),
      });
      const body = (await response.json()) as { ok?: boolean; error?: string; fields?: Record<string, string>; warning?: string | null; applicationId?: string };
      if (!response.ok || !body.ok) {
        setFieldErrors(body.fields ?? {});
        setError(body.fields ? "" : body.error || "The application was not saved.");
        lock.current = false;
        setSubmitting(false);
        return;
      }
      if (body.applicationId) setSavedId(body.applicationId);
      if (body.warning) {
        setError(body.warning);
        lock.current = false;
        setSubmitting(false);
        return;
      }
      router.push("/app/group");
      router.refresh();
      return;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The application was not saved.");
      lock.current = false;
      setSubmitting(false);
    }
  }

  if (application?.status === "approved" || application?.status === "suspended") {
    return (
      <div className="rounded-[28px] bg-white p-8 shadow-sm">
        <p className="text-lg font-medium">Your application is already on file. Open your dashboard to see the status.</p>
        <a href="/app/group" className="mt-4 inline-flex min-h-12 items-center text-sm font-semibold text-[#1976F3]">My Groups</a>
      </div>
    );
  }

  const previewGroup: PublicGroup = {
    id: "preview",
    name: groupName.trim() || "Your Bible Group",
    description: description.trim() || null,
    city,
    state: stateName || null,
    country,
    location_type: locationType === "home" || locationType === "other" ? locationType : "public_venue",
    public_location: locationType === "home"
      ? publicLocationLabel({ locationType, meetingLocation: "", city: city.trim() || "Your city", state: stateName.trim() })
      : meetingLocation.trim() || [city.trim(), stateName.trim()].filter(Boolean).join(", ") || "Location to be announced",
    address: null,
    latitude: preview?.latitude ?? 0,
    longitude: preview?.longitude ?? 0,
    meeting_day: meetingDay,
    meeting_time: displayMeetingTime(meetingTime),
    leader_name: leaderName.trim() || "Group leader",
    leader_photo_url: leaderPhotoUrl || googlePhotoUrl,
  };

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start lg:gap-8">
    <form ref={formRef} onSubmit={onSubmit} className="min-w-0 space-y-4 rounded-[28px] bg-white p-6 shadow-sm sm:p-8" noValidate>
      {editing ? (
        <p className="rounded-2xl bg-[#e8f8ee] px-4 py-3 text-sm text-[#157a3a]">This updates this application. It does not create another group.</p>
      ) : null}
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
      <Field label="Your name" name="name" required autoComplete="name" value={leaderName} error={fieldErrors.leaderName} onChange={(value) => { nameEdited.current = true; setLeaderName(value); clearField("leaderName"); }} />
      <label className="block text-sm font-medium">
        Email
        <input name="email" type="email" readOnly value={email} className={fieldClass} />
        {fieldErrors.email ? <span className="mt-1 block text-sm font-normal text-[#c2410c]">{fieldErrors.email}</span> : null}
      </label>
      <Field
        label="Group Name"
        name="groupName"
        required
        placeholder="e.g. Nashville Bible Group"
        hint="Use your city or neighborhood so people can easily find your group."
        value={groupName}
        error={fieldErrors.groupName}
        onChange={(value) => { setGroupName(value); clearField("groupName"); }}
      />
      <Field label="Mobile number" name="mobile" type="tel" required autoComplete="tel" value={mobile} error={fieldErrors.mobile} onChange={(value) => { setMobile(value); clearField("mobile"); }} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="City" name="city" required value={city} error={fieldErrors.city} onChange={(value) => { setCity(value); clearField("city"); }} onBlur={() => void suggestZone()} />
        <Field label="State" name="state" value={stateName} onChange={setStateName} />
        <Field label="Country" name="country" required placeholder="United States" value={country} error={fieldErrors.country} onChange={(value) => { setCountry(value); clearField("country"); }} />
      </div>
      <label className="block text-sm font-medium">
        Location type
        <select name="locationType" required className={fieldClass} value={locationType} onChange={(event) => setLocationType(event.target.value)}>
          {LOCATION_TYPES.map((type) => (
            <option key={type} value={type}>
              {type === "public_venue" ? "Public place" : type === "home" ? "Home" : "Other"}
            </option>
          ))}
        </select>
      </label>
      <div className={`relative ${suggestions.length > 0 ? "z-30" : ""}`}>
        <Field
          label="Meeting location"
          name="meetingLocation"
          required
          placeholder="Search a public place or address"
          value={meetingLocation}
          error={fieldErrors.meetingLocation}
          onChange={(value) => {
            setMeetingLocation(value);
            setSelectedPlace(null);
            setPreview(null);
            clearField("meetingLocation");
            queueLocationSearch(value);
          }}
        />
        {searchNote ? <p className="mt-1 text-sm text-[#9a3412]">{searchNote}</p> : null}
        {suggestions.length > 0 ? (
          <ul className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-2xl border border-[#e6e6e6] bg-white shadow-lg">
            {suggestions.map((place) => (
              <li key={place.placeId || `${place.latitude}-${place.longitude}-${place.label}`}>
                <button type="button" className="block w-full px-4 py-3 text-left text-sm hover:bg-[#f4f7fb]" onClick={() => void choosePlace(place)}>
                  <span className="block font-semibold">{place.name || place.label}</span>
                  {place.address ? <span className="mt-0.5 block text-xs text-[#667085]">{place.address}</span> : null}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <p className="-mt-2 text-sm text-[#666]">For a home group, the preview and public map show the city area. The street address stays private until an admin approves the group.</p>
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
        <textarea name="description" rows={4} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 w-full rounded-2xl border border-[#e6e6e6] bg-[#f7f7f7] px-4 py-3 text-sm outline-none focus:border-[var(--sending-blue)] focus:bg-white" placeholder="Who the group is for, and what you read together." />
      </label>
      <div className="rounded-2xl border border-[#e6ebf2] p-4">
        <label className="flex min-h-11 items-center justify-between gap-3">
          <span>
            <span className="block text-sm font-semibold">Add a Co-Leader</span>
            <span className="mt-1 block text-sm font-normal text-[#667085]">Leading this group with someone else?</span>
          </span>
          <input type="checkbox" className="h-5 w-5" checked={coLeaderOn} onChange={(event) => setCoLeaderOn(event.target.checked)} />
        </label>
        {coLeaderOn ? (
          <div className="mt-3 space-y-3">
            <Field label="Co-Leader Full Name" name="coLeaderName" required value={coLeaderName} error={fieldErrors.coLeaderName} onChange={(value) => { setCoLeaderName(value); clearField("coLeaderName"); }} />
            <Field label="Co-Leader Email" name="coLeaderEmail" type="email" required autoComplete="off" value={coLeaderEmail} error={fieldErrors.coLeaderEmail} onChange={(value) => { setCoLeaderEmail(value); clearField("coLeaderEmail"); }} />
          </div>
        ) : null}
      </div>
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
      </fieldset>
      <p className="text-sm leading-relaxed">By selecting Submit Group, I agree to the Statement of Faith and Leader Commitments, and I consent to the privacy disclosure above.</p>
      {error ? <p role="alert" className="text-sm text-[#c2410c]">{error}</p> : null}
      <button type="submit" disabled={submitting} className="inline-flex h-[52px] w-full items-center justify-center rounded-full bg-[var(--sending-blue)] font-semibold text-white disabled:opacity-70">
        {submitting ? "Sending…" : "Submit Group"}
      </button>
    </form>
    <div className="mt-4 min-w-0 lg:sticky lg:top-20 lg:mt-0">
      <details className="rounded-[28px] bg-white p-4 shadow-sm lg:hidden">
        <summary className="cursor-pointer text-base font-semibold">Preview Your Group</summary>
        <GroupListingPreview group={previewGroup} />
      </details>
      <div className="hidden lg:block">
        <GroupListingPreview group={previewGroup} />
      </div>
    </div>
    </div>
  );
}

function GroupListingPreview({ group }: { group: PublicGroup }) {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold tracking-tight">Preview Your Bible Group</h2>
      <p className="mt-1 text-sm text-[#667085]">This is how people will see your group once it&apos;s approved.</p>
      <div className="mt-4 w-full rounded-[22px] border border-[#e6ebf2] bg-white p-4 shadow-sm">
        <JoinGroupForm group={group} variant="panel" preview />
      </div>
    </div>
  );
}

function Accordion({ title, children, open = false }: { title: string; children: ReactNode; open?: boolean }) {
  return (
    <details open={open || undefined} className="rounded-2xl border border-[#e6e6e6] bg-[#f7f7f7] px-4 py-3 text-sm leading-relaxed">
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
  value,
  onChange,
  hint,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  onBlur?: () => void;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input name={name} type={type} required={required} placeholder={placeholder} autoComplete={autoComplete} onBlur={onBlur} value={value} onChange={(event) => onChange(event.target.value)} className={`${fieldClass} ${error ? "border-[#c2410c]" : ""}`} />
      {error ? <span className="mt-1 block text-sm font-normal text-[#c2410c]">{error}</span> : null}
      {hint ? <span className="mt-1 block text-sm font-normal text-[#666]">{hint}</span> : null}
    </label>
  );
}

function savedPlace(application: OwnedApplication | null | undefined): FoundPlace | null {
  if (!application) return null;
  const latitude = application.exact_latitude ?? application.latitude;
  const longitude = application.exact_longitude ?? application.longitude;
  if (latitude == null || longitude == null || !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) return null;
  return {
    name: application.meeting_location,
    address: application.meeting_location,
    latitude: Number(latitude),
    longitude: Number(longitude),
    label: application.meeting_location,
    city: application.city,
    state: application.state ?? "",
    country: application.country,
  };
}

function clockValue(value: string | null | undefined) {
  const clock = /^(\d{1,2}):(\d{2})\s*([AaPp][Mm])?$/.exec(value?.trim() ?? "");
  if (!clock) return "09:00";
  let hour = Number(clock[1]);
  const suffix = clock[3]?.toUpperCase();
  if (suffix === "PM" && hour < 12) hour += 12;
  if (suffix === "AM" && hour === 12) hour = 0;
  if (hour > 23) return "09:00";
  return `${String(hour).padStart(2, "0")}:${clock[2]}`;
}

