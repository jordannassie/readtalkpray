import { NextResponse } from "next/server";
import { checklistToMask, parseChecklist } from "@/lib/checklist";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ ok: false }, { status: 401 });

  let body: { steps?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const steps = parseChecklist(body.steps);
  if (!steps) return NextResponse.json({ ok: false }, { status: 400 });

  const { error } = await supabase.from("rtp_checklist").upsert({
    user_id: data.user.id,
    steps: checklistToMask(steps),
    updated_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ ok: false }, { status: 503 });
  return NextResponse.json({ ok: true });
}
