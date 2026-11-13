import { NextResponse } from "next/server";
import { geocodePlace, googlePlaceDetails, googlePlaceSuggestions, searchPlaces } from "@/lib/groups/geo";
import { isIanaTimeZone } from "@/lib/groups/sunday";
import { cleanText } from "@/lib/groups/text";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const placeId = cleanText(url.searchParams.get("id") ?? "", 200);
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (placeId) {
    if (!key) return NextResponse.json({ ok: false, error: "That place could not be confirmed." }, { status: 503 });
    const place = await googlePlaceDetails(placeId, key);
    if (!place) return NextResponse.json({ ok: false, error: "That place did not include a verified location." }, { status: 404 });
    return NextResponse.json({ ok: true, place });
  }
  const query = cleanText(url.searchParams.get("q") ?? "", 120);
  if (query.length < 2) return NextResponse.json({ ok: false }, { status: 400 });
  if (url.searchParams.get("suggest") === "1") {
    const google = key ? await googlePlaceSuggestions(query, key) : null;
    const places = google && google.length > 0 ? google : await searchPlaces(query);
    if (places.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: key
            ? "No real places matched that search."
            : "No real places matched. Business search can use Google Places API (New) with a server-only GOOGLE_PLACES_API_KEY.",
        },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, places });
  }
  const place = await geocodePlace(query);
  if (!place) return NextResponse.json({ ok: false }, { status: 404 });
  let timeZone: string | null = null;
  if (new URL(request.url).searchParams.get("zone") === "1") {
    try {
      const zoneResponse = await fetch(
        `https://timeapi.io/api/timezone/coordinate?latitude=${place.latitude}&longitude=${place.longitude}`,
      );
      const zoneBody = (await zoneResponse.json()) as { timeZone?: string };
      if (zoneResponse.ok && zoneBody.timeZone && isIanaTimeZone(zoneBody.timeZone)) timeZone = zoneBody.timeZone;
    } catch {
      timeZone = null;
    }
  }
  return NextResponse.json({ ok: true, place: { ...place, timeZone } });
}
