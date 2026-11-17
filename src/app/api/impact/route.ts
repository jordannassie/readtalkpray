import { NextResponse } from "next/server";
import { impactCounts } from "@/lib/impact";
import { isUuid } from "@/lib/groups/text";
import { createClient } from "@/lib/supabase/server";

const METRICS = new Set(["saved", "baptized", "sent"]);

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ ok: false }, { status: 401 });
  const groupId = new URL(request.url).searchParams.get("groupId") ?? "";
  if (!isUuid(groupId)) return NextResponse.json({ ok: false }, { status: 400 });
  const { data: row, error } = await supabase.from("rtp_group_impact").select("people_saved, people_baptized, people_sent").eq("group_id", groupId).maybeSingle();
  if (error) return NextResponse.json({ ok: false }, { status: 503 });
  return NextResponse.json({ ok: true, counts: impactCounts(row) });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ ok: false }, { status: 401 });

  let body: { groupId?: string; metric?: string; delta?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!body.groupId || !isUuid(body.groupId) || !body.metric || !METRICS.has(body.metric) || (body.delta !== 1 && body.delta !== -1)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { data: rows, error } = await supabase.rpc("rtp_adjust_impact", {
    target: body.groupId,
    metric: body.metric,
    delta: body.delta,
  });
  if (error) {
    const denied = /not allowed/i.test(error.message);
    return NextResponse.json({ ok: false }, { status: denied ? 403 : 503 });
  }
  const row = Array.isArray(rows) ? rows[0] : rows;
  return NextResponse.json({ ok: true, counts: impactCounts(row) });
}
