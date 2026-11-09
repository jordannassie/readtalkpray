import { NextResponse } from "next/server";
import { parseEmail, cleanLeadPhone } from "@/lib/leads/phone";
import { LEADS_TABLE } from "@/lib/leads/table";
import { RTP_UPSERT_OPTIONS } from "@/lib/leads/types";
import { storedLeadName } from "@/lib/leads/csv";
import { isWebsitePhone, websiteLeadRows } from "@/lib/leads/website";
import { isUuid, cleanText } from "@/lib/groups/text";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const record = body as { groupId?: unknown; firstName?: unknown; mobile?: unknown; email?: unknown };
  if (typeof record.groupId !== "string" || !isUuid(record.groupId)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (typeof record.firstName !== "string" || typeof record.mobile !== "string") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const firstName = cleanText(record.firstName, 80);
  const phone = cleanLeadPhone(record.mobile);
  const email = typeof record.email === "string" ? parseEmail(record.email).email : null;
  if (!firstName || !phone.ok || !isWebsitePhone(phone.phone)) {
    return NextResponse.json({ ok: false, error: "Enter your first name and a valid mobile number." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: group, error: groupError } = await supabase
    .from("rtp_groups")
    .select("id, name, city, state, country")
    .eq("id", record.groupId)
    .eq("status", "approved")
    .maybeSingle();
  if (groupError || !group) return NextResponse.json({ ok: false }, { status: 404 });

  const { error } = await supabase.from("rtp_join_requests").insert({
    group_id: group.id,
    first_name: firstName,
    phone: phone.phone,
    email,
  });

  if (error) {
    if (/duplicate|unique/i.test(error.message)) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const lead = websiteLeadRows([{ firstName, mobile: phone.phone }])[0];
  if (lead) {
    const location = [group.city, group.state, group.country].filter(Boolean).join(", ");
    await supabase.from(LEADS_TABLE).upsert(
      [{
        ...lead,
        email,
        full_name: storedLeadName(firstName, ""),
        location,
        city: group.city,
        group_id: group.id,
        group_name: group.name,
      }],
      RTP_UPSERT_OPTIONS,
    );
  }

  return NextResponse.json({ ok: true, duplicate: false });
}
