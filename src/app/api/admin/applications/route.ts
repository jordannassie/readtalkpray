import { NextResponse } from "next/server";
import { getSessionAdmin } from "@/lib/auth/admin";
import { checklistComplete } from "@/lib/auth/review";
import { approximateCoordinates, publicLocationLabel } from "@/lib/groups/geo";
import { isIanaTimeZone } from "@/lib/groups/sunday";
import { geocodePlace } from "@/lib/groups/geo";
import { cleanText, isUuid } from "@/lib/groups/text";
import { createClient } from "@/lib/supabase/server";

type ApplicationRow = {
  id: string;
  leader_name: string;
  email: string | null;
  phone: string;
  city: string;
  state: string | null;
  country: string;
  location_type: "public_venue" | "home" | "other";
  meeting_location: string;
  meeting_day: string | null;
  meeting_time: string | null;
  description: string | null;
  leader_photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  exact_latitude: number | null;
  exact_longitude: number | null;
  status: string;
};

export async function POST(request: Request) {
  const session = await getSessionAdmin();
  if (!session.user) return NextResponse.json({ ok: false }, { status: 401 });
  if (!session.admin) return NextResponse.json({ ok: false }, { status: 403 });

  let body: {
    id?: string;
    decision?: string;
    action?: string;
    message?: string;
    note?: string;
    checklist?: unknown;
    publicLocation?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!body.id || !isUuid(body.id)) return NextResponse.json({ ok: false }, { status: 400 });
  const supabase = await createClient();

  async function logReview(action: string, message?: string | null) {
    await supabase.from("rtp_application_reviews").insert({
      application_id: body.id,
      reviewer_id: session.user?.id,
      action,
      note: cleanText(String(body.note ?? ""), 2000) || null,
      message: message ? cleanText(message, 2000) : null,
      checklist: body.checklist ?? null,
    });
  }

  if (body.action === "note") {
    const note = cleanText(String(body.note ?? ""), 2000);
    if (!note) return NextResponse.json({ ok: false, error: "Write a note first." }, { status: 400 });
    const { error } = await supabase.from("rtp_application_reviews").insert({
      application_id: body.id,
      reviewer_id: session.user.id,
      action: "note",
      note,
    });
    if (error) return NextResponse.json({ ok: false }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "request_changes") {
    const message = cleanText(String(body.message ?? ""), 2000);
    if (!message) return NextResponse.json({ ok: false, error: "Tell the applicant what to change." }, { status: 400 });
    const { error } = await supabase.from("rtp_group_applications").update({ status: "changes_requested", review_message: message }).eq("id", body.id);
    if (error) return NextResponse.json({ ok: false }, { status: 500 });
    await logReview("request_changes", message);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "suspend" || body.action === "reactivate") {
    const { data: current } = await supabase.from("rtp_group_applications").select("group_id").eq("id", body.id).maybeSingle();
    const nextStatus = body.action === "suspend" ? "suspended" : "approved";
    const { error } = await supabase.from("rtp_group_applications").update({ status: nextStatus }).eq("id", body.id);
    if (error) return NextResponse.json({ ok: false }, { status: 500 });
    if (current?.group_id) {
      await supabase.from("rtp_groups").update({ status: body.action === "suspend" ? "suspended" : "approved" }).eq("id", current.group_id);
    }
    await logReview(body.action, cleanText(String(body.message ?? ""), 2000));
    return NextResponse.json({ ok: true });
  }

  if (body.action === "location") {
    const { data: change } = await supabase.from("rtp_location_changes").select("id, group_id, public_location").eq("id", body.id).maybeSingle();
    if (!change) return NextResponse.json({ ok: false }, { status: 404 });
    if (body.decision === "approve") {
      const publicLocation = cleanText(String(body.publicLocation || change.public_location), 160);
      if (!publicLocation) return NextResponse.json({ ok: false, error: "Enter the public location." }, { status: 400 });
      const { error } = await supabase.from("rtp_groups").update({ public_location: publicLocation }).eq("id", change.group_id);
      if (error) return NextResponse.json({ ok: false }, { status: 500 });
      await supabase.from("rtp_location_changes").update({
        status: "approved",
        public_location: publicLocation,
        reviewed_at: new Date().toISOString(),
        reviewed_by: session.user.id,
      }).eq("id", change.id);
      return NextResponse.json({ ok: true });
    }
    await supabase.from("rtp_location_changes").update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewed_by: session.user.id,
    }).eq("id", change.id);
    return NextResponse.json({ ok: true });
  }

  if (body.decision !== "approve" && body.decision !== "reject") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("rtp_group_applications")
    .select("*")
    .eq("id", body.id)
    .maybeSingle();
  if (error || !data) return NextResponse.json({ ok: false }, { status: 404 });
  const application = data as ApplicationRow;
  if (application.status !== "pending") return NextResponse.json({ ok: true });

  if (body.decision === "reject") {
    const message = cleanText(String(body.message ?? ""), 2000);
    if (!message) return NextResponse.json({ ok: false, error: "Add a reason before rejecting." }, { status: 400 });
    const { error: updateError } = await supabase
      .from("rtp_group_applications")
      .update({ status: "rejected", review_message: message })
      .eq("id", application.id);
    if (updateError) return NextResponse.json({ ok: false }, { status: 500 });
    await logReview("reject", message);
    return NextResponse.json({ ok: true });
  }

  if (!checklistComplete(body.checklist)) {
    return NextResponse.json({ ok: false, error: "Complete the approval checklist first." }, { status: 422 });
  }
  const flags = data as {
    attended?: boolean;
    faith_agreed?: boolean;
    commitments_agreed?: boolean;
    zoom_agreed?: boolean;
    privacy_agreed?: boolean;
    group_name?: string | null;
    user_id?: string | null;
  };
  if (!flags.faith_agreed || !flags.commitments_agreed) {
    return NextResponse.json(
      { ok: false, error: "The applicant has not agreed to the statement of faith and leader commitments." },
      { status: 422 },
    );
  }

  let latitude = application.latitude;
  let longitude = application.longitude;
  if (latitude == null || longitude == null) {
    const place = await geocodePlace(
      [application.city, application.state, application.country].filter(Boolean).join(", "),
    );
    latitude = place?.latitude ?? null;
    longitude = place?.longitude ?? null;
  }
  if (latitude == null || longitude == null) {
    return NextResponse.json(
      { ok: false, error: "Add a city that can be found on the map before approving." },
      { status: 422 },
    );
  }

  const home = application.location_type === "home";
  const pin = home
    ? approximateCoordinates(latitude, longitude, application.id)
    : { latitude, longitude };
  const publicLocation = publicLocationLabel({
    locationType: application.location_type,
    meetingLocation: application.meeting_location,
    city: application.city,
    state: application.state ?? "",
  });

  const storedZone = (data as { timezone?: unknown }).timezone;
  const storedDuration = (data as { duration?: unknown }).duration;
  let groupPayload: Record<string, unknown> = {
    name: flags.group_name?.trim() || `${application.city} Bible Study`,
    leader_user_id: flags.user_id ?? null,
    description: application.description,
    city: application.city,
    state: application.state,
    country: application.country,
    location_type: application.location_type,
    public_location: publicLocation,
    address: home ? null : application.meeting_location,
    latitude: pin.latitude,
    longitude: pin.longitude,
    meeting_day: application.meeting_day,
    meeting_time: application.meeting_time,
    duration: typeof storedDuration === "string" ? storedDuration : null,
    timezone: typeof storedZone === "string" && isIanaTimeZone(storedZone) ? storedZone : null,
    leader_name: application.leader_name,
    leader_photo_url: application.leader_photo_url,
    status: "approved",
  };
  let group: { id: string } | null = null;
  let groupError: { message: string } | null = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const result = await supabase.from("rtp_groups").insert(groupPayload).select("id").single();
    group = result.data;
    groupError = result.error;
    if (!groupError) break;
    if (/timezone/i.test(groupError.message) && "timezone" in groupPayload) {
      const { timezone: _timezone, ...rest } = groupPayload;
      groupPayload = rest;
      continue;
    }
    if (/duration/i.test(groupError.message) && "duration" in groupPayload) {
      const { duration: _duration, ...rest } = groupPayload;
      groupPayload = rest;
      continue;
    }
    break;
  }
  if (groupError || !group) return NextResponse.json({ ok: false }, { status: 500 });

  const { error: privateError } = await supabase.from("rtp_group_private").insert({
    group_id: group.id,
    address: application.meeting_location,
    exact_latitude: application.exact_latitude ?? latitude,
    exact_longitude: application.exact_longitude ?? longitude,
    leader_email: application.email,
    leader_phone: application.phone,
  });
  if (privateError) return NextResponse.json({ ok: false }, { status: 500 });

  const { error: leaderError } = await supabase.from("rtp_group_leaders").insert({
    group_id: group.id,
    name: application.leader_name,
    email: application.email,
    phone: application.phone,
    photo_url: application.leader_photo_url,
    user_id: flags.user_id ?? null,
    is_primary: true,
  });
  if (leaderError) return NextResponse.json({ ok: false }, { status: 500 });

  const { error: applicationError } = await supabase
    .from("rtp_group_applications")
    .update({ status: "approved", group_id: group.id })
    .eq("id", application.id);
  if (applicationError) return NextResponse.json({ ok: false }, { status: 500 });
  await logReview("approve", null);

  return NextResponse.json({ ok: true, groupId: group.id });
}
