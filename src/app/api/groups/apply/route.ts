import { NextResponse } from "next/server";
import { storedLeadName } from "@/lib/leads/csv";
import { cleanLeadPhone } from "@/lib/leads/phone";
import { startLeadRows } from "@/lib/leads/start";
import { LEADS_TABLE } from "@/lib/leads/table";
import { RTP_UPSERT_OPTIONS } from "@/lib/leads/types";
import { isWebsitePhone } from "@/lib/leads/website";
import { geocodePlace } from "@/lib/groups/geo";
import { cleanText, safePhotoUrl } from "@/lib/groups/text";
import { MEETING_DAYS, MEETING_DURATIONS, displayMeetingTime } from "@/lib/groups/schedule";
import { isIanaTimeZone, LAUNCH_TIME_ZONE } from "@/lib/groups/sunday";
import { applicationFieldIssues } from "@/lib/groups/application";
import { LOCATION_TYPES, type LocationType } from "@/lib/groups/types";
import { createClient } from "@/lib/supabase/server";

function agreed(value: unknown) {
  return value === true;
}

function safeDbMessage(message: string) {
  if (/row-level security|policy/i.test(message)) {
    return "The application was not saved because a database rule rejected it. It was not marked as submitted.";
  }
  return message.replace(/https?:\/\/\S+/g, "").slice(0, 180) || "The application was not saved.";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const record = body as Record<string, unknown>;
  const leaderName = cleanText(String(record.leaderName ?? ""), 120);
  const groupName = cleanText(String(record.groupName ?? ""), 120);
  const city = cleanText(String(record.city ?? ""), 80);
  const state = cleanText(String(record.state ?? ""), 80);
  const country = cleanText(String(record.country ?? ""), 80);
  const meetingLocation = cleanText(String(record.meetingLocation ?? ""), 200);
  const meetingDay = cleanText(String(record.meetingDay ?? ""), 40);
  const meetingTime = displayMeetingTime(cleanText(String(record.meetingTime ?? ""), 40));
  const requestedDuration = cleanText(String(record.duration ?? ""), 40);
  const duration = MEETING_DURATIONS.includes(requestedDuration as (typeof MEETING_DURATIONS)[number]) ? requestedDuration : "1 hour";
  const requestedZone = cleanText(String(record.timezone ?? ""), 80);
  const timezone = isIanaTimeZone(requestedZone) ? requestedZone : LAUNCH_TIME_ZONE;
  const description = cleanText(String(record.description ?? ""), 600);
  const locationType = String(record.locationType ?? "") as LocationType;
  const phone = cleanLeadPhone(String(record.mobile ?? ""));
  const leaderPhotoUrl = safePhotoUrl(typeof record.leaderPhotoUrl === "string" ? record.leaderPhotoUrl : null);
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user?.email) {
    return NextResponse.json({ ok: false, error: "Sign in before starting a group." }, { status: 401 });
  }
  const fields: Record<string, string> = {
    ...applicationFieldIssues({
      leaderName,
      groupName,
      email: user.email,
      city,
      country,
      meetingLocation,
      attended: false,
      faithAgreed: agreed(record.leaderAgreement),
      commitmentsAgreed: agreed(record.leaderAgreement),
      zoomAgreed: false,
      privacyAgreed: false,
    }),
  };
  if (!LOCATION_TYPES.includes(locationType)) fields.locationType = "Choose a location type.";
  if (!phone.ok || !isWebsitePhone(phone.phone)) fields.mobile = "Enter a valid mobile number.";
  if (!MEETING_DAYS.includes(meetingDay as (typeof MEETING_DAYS)[number]) || !meetingTime) {
    fields.meetingTime = "Choose a meeting day and time.";
  }
  if (Object.keys(fields).length > 0) {
    return NextResponse.json({ ok: false, error: Object.values(fields)[0], fields }, { status: 400 });
  }
  if (!phone.ok) {
    return NextResponse.json({ ok: false, error: "Enter a valid mobile number.", fields: { mobile: "Enter a valid mobile number." } }, { status: 400 });
  }

  const place = [meetingLocation, city, state, country].filter(Boolean).join(", ");
  const cityPlace = [city, state, country].filter(Boolean).join(", ");
  const exact = locationType === "home" ? await geocodePlace(place) : await geocodePlace(place);
  const cityPoint = locationType === "home" ? await geocodePlace(cityPlace) : exact;
  const clientLatitude = Number(record.latitude);
  const clientLongitude = Number(record.longitude);
  const hasClientPoint = Number.isFinite(clientLatitude) && Number.isFinite(clientLongitude);
  const pin = locationType === "home" ? cityPoint ?? exact : hasClientPoint ? { latitude: clientLatitude, longitude: clientLongitude } : exact ?? cityPoint;
  const exactPoint = locationType === "home" ? exact : pin;

  const application = {
    leader_name: leaderName,
    group_name: groupName,
    email: user.email,
    phone: phone.phone,
    city,
    state: state || null,
    country,
    location_type: locationType,
    meeting_location: meetingLocation,
    meeting_day: meetingDay,
    meeting_time: meetingTime,
    duration,
    timezone,
    description: description || null,
    leader_photo_url: leaderPhotoUrl,
    latitude: pin?.latitude ?? null,
    longitude: pin?.longitude ?? null,
    exact_latitude: exactPoint?.latitude ?? null,
    exact_longitude: exactPoint?.longitude ?? null,
    user_id: user.id,
    attended: false,
    faith_agreed: true,
    commitments_agreed: true,
    zoom_agreed: false,
    privacy_agreed: false,
    agreement_accepted_at: new Date().toISOString(),
    status: "pending",
  };
  const { data: existing } = await supabase
    .from("rtp_group_applications")
    .select("id, status")
    .eq("user_id", user.id)
    .in("status", ["pending", "changes_requested", "approved", "suspended"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing?.status === "approved" || existing?.status === "suspended") {
    return NextResponse.json({ ok: false, error: "You already have a group application. Open your dashboard to see its status." }, { status: 409 });
  }
  if (existing) {
    const { error: updateError } = await supabase.from("rtp_group_applications").update(application).eq("id", existing.id);
    if (updateError) return NextResponse.json({ ok: false, error: safeDbMessage(updateError.message) }, { status: 500 });
    return NextResponse.json({ ok: true, status: "pending" });
  }
  let payload: Record<string, unknown> = application;
  let error: { message: string } | null = null;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const result = await supabase.from("rtp_group_applications").insert(payload);
    error = result.error;
    if (!error) break;
    const missing = error.message.match(/Could not find the '([a-z_]+)' column/i);
    if (missing && missing[1] in payload) {
      const rest = { ...payload };
      delete rest[missing[1]];
      payload = rest;
      continue;
    }
    break;
  }
  if (error) return NextResponse.json({ ok: false, error: safeDbMessage(error.message) }, { status: 500 });

  const lead = startLeadRows([{ name: leaderName, mobile: phone.phone, location: cityPlace }])[0];
  if (lead) {
    await supabase.from(LEADS_TABLE).upsert(
      [{
        ...lead,
        email: user.email,
        full_name: storedLeadName(leaderName, ""),
        city,
      }],
      RTP_UPSERT_OPTIONS,
    );
  }

  return NextResponse.json({ ok: true });
}
