import { NextResponse } from "next/server";
import { cleanLeadPhone } from "@/lib/leads/phone";
import { cleanText, ownProfilePhotoUrl } from "@/lib/groups/text";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ ok: false }, { status: 401 });

  let body: { fullName?: string; phone?: string; photoUrl?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const fullName = cleanText(String(body.fullName ?? ""), 120);
  const phone = cleanLeadPhone(String(body.phone ?? ""));
  if (body.phone && !phone.ok) {
    return NextResponse.json({ ok: false, error: "Enter a valid phone number." }, { status: 400 });
  }
  let photoUrl: string | null = null;
  if (body.photoUrl) {
    photoUrl = ownProfilePhotoUrl(data.user.id, body.photoUrl);
    if (!photoUrl) return NextResponse.json({ ok: false, error: "That photo could not be saved." }, { status: 400 });
  }
  const { error } = await supabase.from("rtp_profiles").upsert({
    user_id: data.user.id,
    full_name: fullName || null,
    phone: phone.ok ? phone.phone : null,
    photo_url: photoUrl,
  });
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  if (photoUrl) {
    await supabase.from("rtp_groups").update({ leader_photo_url: photoUrl }).eq("leader_user_id", data.user.id);
  }
  return NextResponse.json({ ok: true });
}
