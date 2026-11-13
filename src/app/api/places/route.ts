import { NextResponse } from "next/server";
import { geocodePlace } from "@/lib/groups/geo";
import { isIanaTimeZone } from "@/lib/groups/sunday";
import { cleanText } from "@/lib/groups/text";

export async function GET(request: Request) {
  const query = cleanText(new URL(request.url).searchParams.get("q") ?? "", 80);
  if (query.length < 2) return NextResponse.json({ ok: false }, { status: 400 });
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
