import { NextResponse } from "next/server";
import { storedLeadName } from "@/lib/leads/csv";
import { normalizePhone } from "@/lib/phone";
import { startLeadRows } from "@/lib/leads/start";
import { LEADS_TABLE } from "@/lib/leads/table";
import { RTP_UPSERT_OPTIONS } from "@/lib/leads/types";
import { geocodePlace } from "@/lib/groups/geo";
import { cleanText, isUuid, ownApplicationPhotoUrl, safePhotoUrl } from "@/lib/groups/text";
import { MEETING_DAYS, MEETING_DURATIONS, displayMeetingTime } from "@/lib/groups/schedule";
import { isIanaTimeZone, LAUNCH_TIME_ZONE } from "@/lib/groups/sunday";
import { applicationFieldIssues } from "@/lib/groups/application";
import { ownsGroup } from "@/lib/groups/ownership";
import { LOCATION_TYPES, type LocationType } from "@/lib/groups/types";
import { createClient } from "@/lib/supabase/server";

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
  const phone = normalizePhone(String(record.mobile ?? ""));
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
      faithAgreed: true,
      commitmentsAgreed: true,
      zoomAgreed: false,
      privacyAgreed: true,
    }),
  };
  if (!LOCATION_TYPES.includes(locationType)) fields.locationType = "Choose a location type.";
  if (!phone) fields.mobile = "Enter a valid mobile number.";
  if (!MEETING_DAYS.includes(meetingDay as (typeof MEETING_DAYS)[number]) || !meetingTime) {
    fields.meetingTime = "Choose a meeting day and time.";
  }
  const clientLatitude = Number(record.latitude);
  const clientLongitude = Number(record.longitude);
  const hasClientPoint = Number.isFinite(clientLatitude) && Number.isFinite(clientLongitude);
  if (!hasClientPoint) fields.meetingLocation = "Choose a location from the suggestions.";
  if (Object.keys(fields).length > 0) {
    return NextResponse.json({ ok: false, error: Object.values(fields)[0], fields }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json({ ok: false, error: "Enter a valid mobile number.", fields: { mobile: "Enter a valid mobile number." } }, { status: 400 });
  }

  const cityPlace = [city, state, country].filter(Boolean).join(", ");
  const exactPoint = { latitude: clientLatitude, longitude: clientLongitude };
  const cityPoint = locationType === "home" ? await geocodePlace(cityPlace) : null;
  const pin = locationType === "home" ? cityPoint : exactPoint;

  const application = {
    leader_name: leaderName,
    group_name: groupName,
    email: user.email,
    phone: phone.e164,
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
    privacy_agreed: true,
    status: "pending",
  };
  const coLeader = coLeaderInput(record.coLeader, record.coLeaderName, record.coLeaderPhotoUrl, user.id);
  if (coLeader.error) {
    return NextResponse.json({ ok: false, error: coLeader.error, fields: { coLeaderName: coLeader.error } }, { status: 400 });
  }
  const payload = { ...application, ...coLeader.value };
  const requestedId = isUuid(String(record.applicationId ?? "")) ? String(record.applicationId) : "";
  if (requestedId) {
    const { data: existing } = await supabase
      .from("rtp_group_applications")
      .select("id, status")
      .eq("id", requestedId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!existing) return NextResponse.json({ ok: false, error: "That application was not found." }, { status: 404 });
    if (existing.status !== "pending" && existing.status !== "changes_requested") {
      return NextResponse.json({ ok: false, error: "This application can no longer be edited. Add a group to start another one." }, { status: 409 });
    }
    const { error: updateError } = await supabase.from("rtp_group_applications").update(payload).eq("id", existing.id).eq("user_id", user.id);
    if (updateError && /co_leader/i.test(updateError.message)) {
      const retry = await supabase.from("rtp_group_applications").update(application).eq("id", existing.id).eq("user_id", user.id);
      if (retry.error) return NextResponse.json({ ok: false, error: safeDbMessage(retry.error.message) }, { status: 500 });
      return NextResponse.json({ ok: true, applicationId: existing.id, warning: "The application was saved. Run supabase/co-leader-photo.sql before the co-leader name and photo can be stored." });
    }
    if (updateError) return NextResponse.json({ ok: false, error: safeDbMessage(updateError.message) }, { status: 500 });
    return NextResponse.json({ ok: true, applicationId: existing.id });
  }

  const [{ data: existingApplications }, { data: existingGroups }] = await Promise.all([
    supabase.from("rtp_group_applications").select("status").eq("user_id", user.id),
    supabase.from("rtp_groups").select("status").eq("leader_user_id", user.id),
  ]);
  if (ownsGroup(existingApplications ?? [], existingGroups ?? [])) {
    return NextResponse.json({ ok: false, error: "You already have a group.", existing: true }, { status: 409 });
  }

  const { data: inserted, error } = await supabase.from("rtp_group_applications").insert(payload).select("id").single();
  if (error?.message && /co_leader/i.test(error.message)) {
    const retry = await supabase.from("rtp_group_applications").insert(application).select("id").single();
    if (retry.error || !retry.data) return NextResponse.json({ ok: false, error: safeDbMessage(retry.error?.message ?? "") }, { status: 500 });
    return NextResponse.json({ ok: true, applicationId: retry.data.id, warning: "The group was saved. Run supabase/co-leader-photo.sql before the co-leader name and photo can be stored." });
  }
  if (error || !inserted) {
    const duplicate = /rtp_applications_one_open|duplicate key/i.test(error?.message ?? "");
    return NextResponse.json({
      ok: false,
      error: duplicate
        ? "You already have a group. The existing group was not changed."
        : safeDbMessage(error?.message ?? ""),
    }, { status: duplicate ? 409 : 500 });
  }
  const lead = startLeadRows([{ name: leaderName, mobile: phone.e164, location: cityPlace }])[0];
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
  return NextResponse.json({ ok: true, applicationId: inserted.id });
}

function coLeaderInput(enabled: unknown, name: unknown, photo: unknown, userId: string): { value: { co_leader_name: string | null; co_leader_photo_url: string | null }; error: string } {
  if (enabled !== true) return { value: { co_leader_name: null, co_leader_photo_url: null }, error: "" };
  const coName = cleanText(String(name ?? ""), 120);
  if (!coName) return { value: { co_leader_name: null, co_leader_photo_url: null }, error: "Enter the co-leader's name." };
  const coPhoto = typeof photo === "string" && photo ? ownApplicationPhotoUrl(userId, photo) : null;
  if (photo && !coPhoto) return { value: { co_leader_name: null, co_leader_photo_url: null }, error: "Upload the co-leader photo again." };
  return { value: { co_leader_name: coName, co_leader_photo_url: coPhoto }, error: "" };
}
