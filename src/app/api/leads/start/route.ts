import { NextResponse } from "next/server";
import { LEADS_TABLE } from "@/lib/leads/table";
import { RTP_UPSERT_OPTIONS } from "@/lib/leads/types";
import { startLeadRows } from "@/lib/leads/start";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const record = body as { name?: unknown; mobile?: unknown; location?: unknown };
  if (typeof record.name !== "string" || typeof record.mobile !== "string" || typeof record.location !== "string") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const rows = startLeadRows([{ name: record.name, mobile: record.mobile, location: record.location }]);
  if (rows.length === 0) return NextResponse.json({ ok: false }, { status: 400 });

  const supabase = await createClient();
  const { error } = await supabase.from(LEADS_TABLE).upsert(rows, RTP_UPSERT_OPTIONS);
  if (error) return NextResponse.json({ ok: false }, { status: 500 });

  return NextResponse.json({ ok: true, phones: rows.map((row) => row.phone) });
}
