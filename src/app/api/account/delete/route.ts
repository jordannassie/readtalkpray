import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const RECENT_MS = 15 * 60 * 1000;
const PROTECTED = "jordannassie@gmail.com";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return NextResponse.json({ ok: false, error: "Sign in first." }, { status: 401 });

  let body: { confirm?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Confirmation is required." }, { status: 400 });
  }
  if (body.confirm !== "DELETE") {
    return NextResponse.json({ ok: false, error: "Type DELETE to confirm." }, { status: 400 });
  }
  if ((user.email ?? "").toLowerCase() === PROTECTED) {
    return NextResponse.json({ ok: false, error: "The main administrator account cannot be deleted." }, { status: 403 });
  }
  const signedInAt = user.last_sign_in_at ? Date.parse(user.last_sign_in_at) : 0;
  if (!signedInAt || Date.now() - signedInAt > RECENT_MS) {
    return NextResponse.json(
      { ok: false, error: "Sign in again, then delete the account. This step is available for 15 minutes after sign-in." },
      { status: 401 },
    );
  }

  const { data: result, error } = await supabase.rpc("rtp_delete_my_account");
  const payload = result as { ok?: boolean; error?: string; authRemoved?: boolean; sharedLogin?: boolean; notice?: string | null } | null;
  if (error || !payload?.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: payload?.error || "Account deletion did not finish. Nothing was reported as deleted. If this continues, the deletion function in supabase/rtp.sql still needs to be run.",
      },
      { status: error ? 503 : 400 },
    );
  }
  await supabase.auth.signOut();
  return NextResponse.json({
    ok: true,
    authRemoved: Boolean(payload.authRemoved),
    sharedLogin: Boolean(payload.sharedLogin),
    notice: payload.notice,
  });
}
