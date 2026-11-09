import { NextResponse } from "next/server";
import { geocodePlace } from "@/lib/groups/geo";
import { cleanText } from "@/lib/groups/text";

export async function GET(request: Request) {
  const query = cleanText(new URL(request.url).searchParams.get("q") ?? "", 80);
  if (query.length < 2) return NextResponse.json({ ok: false }, { status: 400 });
  const place = await geocodePlace(query);
  if (!place) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, place });
}
