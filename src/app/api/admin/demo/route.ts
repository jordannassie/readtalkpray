import { NextResponse } from "next/server";
import { getSessionAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const session = await getSessionAdmin();
  if (!session.user) return NextResponse.json({ ok: false }, { status: 401 });
  if (!session.admin) return NextResponse.json({ ok: false }, { status: 403 });
  let body: { enabled?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (typeof body.enabled !== "boolean") return NextResponse.json({ ok: false }, { status: 400 });
  const supabase = await createClient();
  const { error } = await supabase.from("rtp_settings").upsert({ key: "show_demo_groups", enabled: body.enabled });
  if (error) {
    return NextResponse.json(
      { ok: false, error: "The demo setting is not in the database yet. Run the rtp_settings section of supabase/rtp.sql." },
      { status: 503 },
    );
  }
  return NextResponse.json({ ok: true, enabled: body.enabled });
}
