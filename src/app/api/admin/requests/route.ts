import { NextResponse } from "next/server";
import { getSessionAdmin } from "@/lib/auth/admin";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/leads/types";
import { isUuid } from "@/lib/groups/text";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const session = await getSessionAdmin();
  if (!session.user) return NextResponse.json({ ok: false }, { status: 401 });
  if (!session.admin) return NextResponse.json({ ok: false }, { status: 403 });

  let body: { id?: string; status?: string; addressShared?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!body.id || !isUuid(body.id)) return NextResponse.json({ ok: false }, { status: 400 });

  const patch: { status?: LeadStatus; address_shared?: boolean } = {};
  if (typeof body.status === "string" && LEAD_STATUSES.includes(body.status as LeadStatus)) {
    patch.status = body.status as LeadStatus;
  }
  if (typeof body.addressShared === "boolean") patch.address_shared = body.addressShared;
  if (Object.keys(patch).length === 0) return NextResponse.json({ ok: false }, { status: 400 });

  const supabase = await createClient();
  const { error } = await supabase.from("rtp_join_requests").update(patch).eq("id", body.id);
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}
