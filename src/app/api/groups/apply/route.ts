import { NextResponse } from "next/server";
import { storedLeadName } from "@/lib/leads/csv";
import { parseEmail, cleanLeadPhone } from "@/lib/leads/phone";
import { startLeadRows } from "@/lib/leads/start";
import { LEADS_TABLE } from "@/lib/leads/table";
import { RTP_UPSERT_OPTIONS } from "@/lib/leads/types";
import { isWebsitePhone } from "@/lib/leads/website";
import { geocodePlace } from "@/lib/groups/geo";
import { cleanText, safePhotoUrl } from "@/lib/groups/text";
import { LOCATION_TYPES, type LocationType } from "@/lib/groups/types";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const record = body as Record<string, unknown>;
  const leaderName = cleanText(String(record.leaderName ?? ""), 120);
  const city = cleanText(String(record.city ?? ""), 80);
  const state = cleanText(String(record.state ?? ""), 80);
  const country = cleanText(String(record.country ?? ""), 80);
  const meetingLocation = cleanText(String(record.meetingLocation ?? ""), 200);
  const meetingDay = cleanText(String(record.meetingDay ?? ""), 40);
  const meetingTime = cleanText(String(record.meetingTime ?? ""), 40);
  const description = cleanText(String(record.description ?? ""), 600);
  const locationType = String(record.locationType ?? "") as LocationType;
  const email = parseEmail(String(record.email ?? "")).email;
  const phone = cleanLeadPhone(String(record.mobile ?? ""));
  const leaderPhotoUrl = safePhotoUrl(typeof record.leaderPhotoUrl === "string" ? record.leaderPhotoUrl : null);

  if (!LOCATION_TYPES.includes(locationType)) {
    return NextResponse.json({ ok: false, error: "Choose a location type." }, { status: 400 });
  }
  if (!leaderName || !email || !city || !country || !meetingLocation || !meetingDay || !meetingTime) {
    return NextResponse.json({ ok: false, error: "Name, email, city, country, meeting location, day, and time are needed." }, { status: 400 });
  }
  if (!phone.ok || !isWebsitePhone(phone.phone)) {
    return NextResponse.json({ ok: false, error: "Enter a valid mobile number." }, { status: 400 });
  }

  const place = [meetingLocation, city, state, country].filter(Boolean).join(", ");
  const cityPlace = [city, state, country].filter(Boolean).join(", ");
  const exact = locationType === "home" ? await geocodePlace(place) : await geocodePlace(place);
  const cityPoint = locationType === "home" ? await geocodePlace(cityPlace) : exact;
  const pin = locationType === "home" ? cityPoint ?? exact : exact ?? cityPoint;

  const supabase = await createClient();
  const { error } = await supabase.from("rtp_group_applications").insert({
    leader_name: leaderName,
    email,
    phone: phone.phone,
    city,
    state: state || null,
    country,
    location_type: locationType,
    meeting_location: meetingLocation,
    meeting_day: meetingDay,
    meeting_time: meetingTime,
    description: description || null,
    leader_photo_url: leaderPhotoUrl,
    latitude: pin?.latitude ?? null,
    longitude: pin?.longitude ?? null,
    exact_latitude: locationType === "home" ? exact?.latitude ?? null : pin?.latitude ?? null,
    exact_longitude: locationType === "home" ? exact?.longitude ?? null : pin?.longitude ?? null,
    status: "pending",
  });
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
