import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { impactCounts, impactSaveFailure } from "@/lib/impact";
import { isUuid } from "@/lib/groups/text";
import { createClient } from "@/lib/supabase/server";

const METRICS = new Set(["members", "saved", "baptized", "sent"]);
const COUNT_COLUMNS = "group_members, people_saved, people_baptized, people_sent";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ ok: false }, { status: 401 });
  const groupId = new URL(request.url).searchParams.get("groupId") ?? "";
  if (!isUuid(groupId)) return NextResponse.json({ ok: false }, { status: 400 });
  const full = await supabase.from("rtp_group_impact").select(COUNT_COLUMNS).eq("group_id", groupId).maybeSingle();
  if (!full.error) return NextResponse.json({ ok: true, counts: impactCounts(full.data) });
  if (/group_members/i.test(full.error.message)) {
    const legacy = await supabase.from("rtp_group_impact").select("people_saved, people_baptized, people_sent").eq("group_id", groupId).maybeSingle();
    if (!legacy.error) return NextResponse.json({ ok: true, counts: impactCounts(legacy.data) });
  }
  return NextResponse.json({ ok: false, error: impactSaveFailure(full.error.message).error }, { status: 503 });
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
    const failure = impactSaveFailure(error.message);
    return NextResponse.json({ ok: false, error: failure.error }, { status: failure.status });
  }
  const row = Array.isArray(rows) ? rows[0] : rows;
  revalidatePath("/");
  return NextResponse.json({ ok: true, counts: impactCounts(row) });
}
