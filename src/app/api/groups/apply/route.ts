import { NextResponse } from "next/server";
import { storedLeadName } from "@/lib/leads/csv";
import { cleanLeadPhone } from "@/lib/leads/phone";
import { startLeadRows } from "@/lib/leads/start";
import { LEADS_TABLE } from "@/lib/leads/table";
import { RTP_UPSERT_OPTIONS } from "@/lib/leads/types";
import { isWebsitePhone } from "@/lib/leads/website";
import { geocodePlace } from "@/lib/groups/geo";
import { cleanText, isUuid, safePhotoUrl } from "@/lib/groups/text";
import { MEETING_DAYS, MEETING_DURATIONS, displayMeetingTime } from "@/lib/groups/schedule";
import { isIanaTimeZone, LAUNCH_TIME_ZONE } from "@/lib/groups/sunday";
import { applicationFieldIssues } from "@/lib/groups/application";
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
      faithAgreed: true,
      commitmentsAgreed: true,
      zoomAgreed: false,
      privacyAgreed: true,
    }),
  };
  if (!LOCATION_TYPES.includes(locationType)) fields.locationType = "Choose a location type.";
  if (!phone.ok || !isWebsitePhone(phone.phone)) fields.mobile = "Enter a valid mobile number.";
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
  if (!phone.ok) {
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
    privacy_agreed: true,
    status: "pending",
  };
  const requestedId = isUuid(String(record.applicationId ?? "")) ? String(record.applicationId) : "";
  const coLeader = coLeaderInput(record.coLeader, record.coLeaderName, record.coLeaderEmail, user.email);
  if (coLeader.error) {
    return NextResponse.json({ ok: false, error: coLeader.error, fields: { coLeaderEmail: coLeader.error } }, { status: 400 });
  }
  let applicationId = requestedId;
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
    const { error: updateError } = await supabase.from("rtp_group_applications").update(application).eq("id", existing.id).eq("user_id", user.id);
    if (updateError) return NextResponse.json({ ok: false, error: safeDbMessage(updateError.message) }, { status: 500 });
  } else {
    const { data: inserted, error } = await supabase.from("rtp_group_applications").insert(application).select("id").single();
    if (error || !inserted) {
      const duplicate = /rtp_applications_one_open|duplicate key/i.test(error?.message ?? "");
      return NextResponse.json({
        ok: false,
        error: duplicate
          ? "A second group needs the database update in supabase/multi-groups.sql before it can be saved. The existing group was not changed."
          : safeDbMessage(error?.message ?? ""),
      }, { status: duplicate ? 409 : 500 });
    }
    applicationId = inserted.id;
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
  }
  const inviteWarning = await saveCoLeader(supabase, user.id, applicationId, groupName, coLeader.value);

  return NextResponse.json({ ok: true, applicationId, warning: inviteWarning });
}

function coLeaderInput(enabled: unknown, name: unknown, email: unknown, ownerEmail: string) {
  if (enabled !== true) return { value: null as null, error: "" };
  const coName = cleanText(String(name ?? ""), 120);
  const coEmail = cleanText(String(email ?? ""), 200).toLowerCase();
  if (!coName) return { value: null, error: "Enter the co-leader's name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(coEmail)) return { value: null, error: "Enter the co-leader's email." };
  if (coEmail === ownerEmail.toLowerCase()) return { value: null, error: "A co-leader needs their own email address." };
  return { value: { name: coName, email: coEmail }, error: "" };
}

async function saveCoLeader(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  applicationId: string,
  groupName: string,
  coLeader: { name: string; email: string } | null,
) {
  const { data: open, error: readError } = await supabase
    .from("rtp_co_leader_invites")
    .select("id, email, status")
    .eq("application_id", applicationId)
    .in("status", ["pending", "accepted"])
    .maybeSingle();
  if (readError) {
    if (/rtp_co_leader_invites|schema cache|does not exist/i.test(readError.message)) {
      return coLeader ? "The group was saved. Run supabase/multi-groups.sql before a co-leader invitation can be sent." : null;
    }
    return safeDbMessage(readError.message);
  }
  if (!coLeader) {
    if (open?.status === "pending") {
      await supabase.from("rtp_co_leader_invites").update({ status: "cancelled" }).eq("id", open.id).eq("invited_by", userId);
    }
    return null;
  }
  if (open && open.email.toLowerCase() === coLeader.email) {
    if (open.status === "pending") {
      await supabase.from("rtp_co_leader_invites").update({ name: coLeader.name, group_name: groupName }).eq("id", open.id);
    }
    return null;
  }
  if (open?.status === "accepted") return "Cancel the current co-leader before inviting someone else.";
  if (open) {
    const { error: cancelError } = await supabase.from("rtp_co_leader_invites").update({ status: "cancelled" }).eq("id", open.id).eq("invited_by", userId);
    if (cancelError) return safeDbMessage(cancelError.message);
  }
  const { error } = await supabase.from("rtp_co_leader_invites").insert({
    application_id: applicationId,
    invited_by: userId,
    name: coLeader.name,
    email: coLeader.email,
    group_name: groupName,
    status: "pending",
    approved: false,
  });
  if (error) return safeDbMessage(error.message);
  return null;
}
