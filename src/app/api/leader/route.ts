import { NextResponse } from "next/server";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/leads/types";
import { cleanText, isUuid, safePhotoUrl } from "@/lib/groups/text";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  let body: {
    action?: string;
    id?: string;
    name?: string;
    description?: string;
    meetingDay?: string;
    meetingTime?: string;
    publicLocation?: string;
    leaderPhotoUrl?: string | null;
    requestId?: string;
    status?: string;
    addressShared?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (body.action === "claim") {
    const { data: claimed, error } = await supabase
      .from("rtp_groups")
      .update({ leader_user_id: user.id })
      .is("leader_user_id", null)
      .eq("status", "approved")
      .select("id");
    if (error) return NextResponse.json({ ok: false }, { status: 500 });
    const ids = (claimed ?? []).map((row) => row.id as string);
    if (ids.length > 0) {
      await supabase.from("rtp_group_leaders").update({ user_id: user.id }).in("group_id", ids).is("user_id", null);
    }
    return NextResponse.json({ ok: true, ids });
  }

  if (body.action === "update" && body.id && isUuid(body.id)) {
    const patch: Record<string, string | null> = {};
    if (typeof body.name === "string") patch.name = cleanText(body.name, 120);
    if (typeof body.description === "string") patch.description = cleanText(body.description, 600);
    if (typeof body.meetingDay === "string") patch.meeting_day = cleanText(body.meetingDay, 40);
    if (typeof body.meetingTime === "string") patch.meeting_time = cleanText(body.meetingTime, 40);
    if (typeof body.publicLocation === "string") patch.public_location = cleanText(body.publicLocation, 160);
    if (body.leaderPhotoUrl !== undefined) patch.leader_photo_url = safePhotoUrl(body.leaderPhotoUrl);
    if (!patch.name) return NextResponse.json({ ok: false }, { status: 400 });
    const { error } = await supabase.from("rtp_groups").update(patch).eq("id", body.id).eq("leader_user_id", user.id);
    if (error) return NextResponse.json({ ok: false }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "request" && body.requestId && isUuid(body.requestId)) {
    const patch: { status?: LeadStatus; address_shared?: boolean } = {};
    if (typeof body.status === "string" && LEAD_STATUSES.includes(body.status as LeadStatus)) {
      patch.status = body.status as LeadStatus;
    }
    if (typeof body.addressShared === "boolean") patch.address_shared = body.addressShared;
    if (Object.keys(patch).length === 0) return NextResponse.json({ ok: false }, { status: 400 });
    const { error } = await supabase.from("rtp_join_requests").update(patch).eq("id", body.requestId);
    if (error) return NextResponse.json({ ok: false }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false }, { status: 400 });
}
