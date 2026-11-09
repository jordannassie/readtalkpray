import { NextResponse } from "next/server";
import { getSessionAdmin } from "@/lib/auth/admin";
import { approximateCoordinates, publicLocationLabel } from "@/lib/groups/geo";
import { geocodePlace } from "@/lib/groups/geo";
import { isUuid } from "@/lib/groups/text";
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

  let body: { id?: string; decision?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!body.id || !isUuid(body.id) || (body.decision !== "approve" && body.decision !== "reject")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rtp_group_applications")
    .select("*")
    .eq("id", body.id)
    .maybeSingle();
  if (error || !data) return NextResponse.json({ ok: false }, { status: 404 });
  const application = data as ApplicationRow;
  if (application.status !== "pending") return NextResponse.json({ ok: true });

  if (body.decision === "reject") {
    const { error: updateError } = await supabase
      .from("rtp_group_applications")
      .update({ status: "rejected" })
      .eq("id", application.id);
    if (updateError) return NextResponse.json({ ok: false }, { status: 500 });
    return NextResponse.json({ ok: true });
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

  const { data: group, error: groupError } = await supabase
    .from("rtp_groups")
    .insert({
      name: `${application.city} Bible Study`,
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
      leader_name: application.leader_name,
      leader_photo_url: application.leader_photo_url,
      status: "approved",
    })
    .select("id")
    .single();
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
    is_primary: true,
  });
  if (leaderError) return NextResponse.json({ ok: false }, { status: 500 });

  const { error: applicationError } = await supabase
    .from("rtp_group_applications")
    .update({ status: "approved", group_id: group.id })
    .eq("id", application.id);
  if (applicationError) return NextResponse.json({ ok: false }, { status: 500 });

  return NextResponse.json({ ok: true, groupId: group.id });
}
