import { NextResponse } from "next/server";
import { storedLeadName } from "@/lib/leads/csv";
import { parseEmail, cleanLeadPhone } from "@/lib/leads/phone";
import { startLeadRows } from "@/lib/leads/start";
import { LEADS_TABLE } from "@/lib/leads/table";
import { RTP_UPSERT_OPTIONS } from "@/lib/leads/types";
import { isWebsitePhone } from "@/lib/leads/website";
import { geocodePlace } from "@/lib/groups/geo";
import { cleanText, safePhotoUrl } from "@/lib/groups/text";
import { MEETING_DAYS, MEETING_DURATIONS, displayMeetingTime } from "@/lib/groups/schedule";
import { isIanaTimeZone, LAUNCH_TIME_ZONE } from "@/lib/groups/sunday";
import { applicationIssues } from "@/lib/groups/application";
import { LOCATION_TYPES, type LocationType } from "@/lib/groups/types";
import { createClient } from "@/lib/supabase/server";

function agreed(value: unknown) {
  return value === true;
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
  if (!MEETING_DAYS.includes(meetingDay as (typeof MEETING_DAYS)[number]) || !meetingTime) {
    return NextResponse.json({ ok: false, error: "Choose a meeting day and time." }, { status: 400 });
  }
  const description = cleanText(String(record.description ?? ""), 600);
  const locationType = String(record.locationType ?? "") as LocationType;
  const email = parseEmail(String(record.email ?? "")).email;
  const phone = cleanLeadPhone(String(record.mobile ?? ""));
  const leaderPhotoUrl = safePhotoUrl(typeof record.leaderPhotoUrl === "string" ? record.leaderPhotoUrl : null);

  if (!LOCATION_TYPES.includes(locationType)) {
    return NextResponse.json({ ok: false, error: "Choose a location type." }, { status: 400 });
  }
  if (!phone.ok || !isWebsitePhone(phone.phone)) {
    return NextResponse.json({ ok: false, error: "Enter a valid mobile number." }, { status: 400 });
  }
  const agreements = {
    leaderName,
    groupName,
    email: email ?? "",
    city,
    country,
    meetingLocation,
    attended: agreed(record.attended),
    faithAgreed: agreed(record.faithAgreed),
    commitmentsAgreed: agreed(record.commitmentsAgreed),
    zoomAgreed: agreed(record.zoomAgreed),
    privacyAgreed: agreed(record.privacyAgreed),
  };
  const issue = applicationIssues(agreements);
  if (issue || !meetingDay || !meetingTime) {
    return NextResponse.json({ ok: false, error: issue || "Choose a meeting day and time." }, { status: 400 });
  }

  const place = [meetingLocation, city, state, country].filter(Boolean).join(", ");
  const cityPlace = [city, state, country].filter(Boolean).join(", ");
  const exact = locationType === "home" ? await geocodePlace(place) : await geocodePlace(place);
  const cityPoint = locationType === "home" ? await geocodePlace(cityPlace) : exact;
  const pin = locationType === "home" ? cityPoint ?? exact : exact ?? cityPoint;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user?.email) {
    return NextResponse.json({ ok: false, error: "Sign in before starting a group." }, { status: 401 });
  }
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
    exact_latitude: locationType === "home" ? exact?.latitude ?? null : pin?.latitude ?? null,
    exact_longitude: locationType === "home" ? exact?.longitude ?? null : pin?.longitude ?? null,
    user_id: user.id,
    attended: agreements.attended,
    faith_agreed: agreements.faithAgreed,
    commitments_agreed: agreements.commitmentsAgreed,
    zoom_agreed: agreements.zoomAgreed,
    privacy_agreed: agreements.privacyAgreed,
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
    if (updateError) return NextResponse.json({ ok: false }, { status: 500 });
    return NextResponse.json({ ok: true, status: "pending" });
  }
  let payload: Record<string, unknown> = application;
  let error: { message: string } | null = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const result = await supabase.from("rtp_group_applications").insert(payload);
    error = result.error;
    if (!error) break;
    if (/timezone/i.test(error.message) && "timezone" in payload) {
      const { timezone: _timezone, ...rest } = payload;
      payload = rest;
      continue;
    }
    if (/duplicate|unique/i.test(error.message)) {
      return NextResponse.json({ ok: true, status: "pending" });
    }
    if (/duration/i.test(error.message) && "duration" in payload) {
      const { duration: _duration, ...rest } = payload;
      payload = rest;
      continue;
    }
    break;
  }
  if (error) return NextResponse.json({ ok: false }, { status: 500 });

  const lead = startLeadRows([{ name: leaderName, mobile: phone.phone, location: cityPlace }])[0];
  if (lead) {
    await supabase.from(LEADS_TABLE).upsert(
      [{
        ...lead,
        email,
        full_name: storedLeadName(leaderName, ""),
        city,
      }],
      RTP_UPSERT_OPTIONS,
    );
  }

  return NextResponse.json({ ok: true });
}
