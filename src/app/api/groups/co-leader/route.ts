import { NextResponse } from "next/server";
import { isUuid } from "@/lib/groups/text";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user?.email) return NextResponse.json({ ok: false, error: "Sign in first." }, { status: 401 });

  let body: { action?: string; id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!body.id || !isUuid(body.id)) return NextResponse.json({ ok: false }, { status: 400 });

  if (body.action === "accept" || body.action === "decline") {
    const next = body.action === "accept" ? "accepted" : "declined";
    const { data: updated, error } = await supabase
      .from("rtp_co_leader_invites")
      .update({ status: next, accepted_by: body.action === "accept" ? user.id : null })
      .eq("id", body.id)
      .eq("status", "pending")
      .ilike("email", user.email)
      .select("id");
    if (error) return NextResponse.json({ ok: false, error: "That invitation could not be updated." }, { status: 500 });
    if (!updated?.length) return NextResponse.json({ ok: false, error: "This invitation does not match your account." }, { status: 403 });
    return NextResponse.json({ ok: true, status: next });
  }

  if (body.action === "cancel") {
    const { error } = await supabase.rpc("rtp_withdraw_co_leader", { invite: body.id });
    if (error) {
      const pending = await supabase
        .from("rtp_co_leader_invites")
        .update({ status: "cancelled" })
        .eq("id", body.id)
        .eq("invited_by", user.id)
        .eq("status", "pending")
        .select("id");
      if (pending.error || !pending.data?.length) {
        return NextResponse.json({ ok: false, error: "Only the primary leader can cancel this invitation." }, { status: 403 });
      }
    }
    return NextResponse.json({ ok: true, status: "cancelled" });
  }

  return NextResponse.json({ ok: false }, { status: 400 });
}
