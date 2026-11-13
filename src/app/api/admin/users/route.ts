import { NextResponse } from "next/server";
import { getSessionAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const session = await getSessionAdmin();
  if (!session.user) return NextResponse.json({ ok: false }, { status: 401 });
  if (!session.admin) return NextResponse.json({ ok: false }, { status: 403 });
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("rtp_admin_list_users");
  if (error) {
    return NextResponse.json(
      { ok: false, error: "The user list is not available until rtp_admin_list_users is installed from supabase/rtp.sql." },
      { status: 503 },
    );
  }
  return NextResponse.json({ ok: true, users: data ?? [] });
}

export async function POST(request: Request) {
  const session = await getSessionAdmin();
  if (!session.user) return NextResponse.json({ ok: false }, { status: 401 });
  if (!session.admin) return NextResponse.json({ ok: false }, { status: 403 });
  let body: { userId?: string; confirm?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (body.confirm !== "DELETE" || !body.userId) {
    return NextResponse.json({ ok: false, error: "Type DELETE to confirm." }, { status: 400 });
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("rtp_admin_delete_user", { target: body.userId });
  const payload = data as { ok?: boolean; error?: string; authRemoved?: boolean; notice?: string | null } | null;
  if (error || !payload?.ok) {
    return NextResponse.json(
      { ok: false, error: payload?.error || "That user was not deleted." },
      { status: error ? 503 : 400 },
    );
  }
  return NextResponse.json({ ok: true, authRemoved: Boolean(payload.authRemoved), notice: payload.notice });
}
