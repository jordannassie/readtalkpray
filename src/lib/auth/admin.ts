import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/env";

function allowlisted(email: string | undefined) {
  if (!email) return false;
  const allowed = (process.env.RTP_ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

async function bootstrapAdmin(userId: string, email: string | undefined) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || !allowlisted(email) || !isSupabaseConfigured()) return;
  const service = createServiceClient(getSupabaseUrl(), serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  await service.from("rtp_admins").upsert({ user_id: userId });
  const existing = await service.auth.admin.getUserById(userId);
  const current = existing.data.user?.app_metadata ?? {};
  if (current.role !== "admin") {
    await service.auth.admin.updateUserById(userId, {
      app_metadata: { ...current, role: "admin" },
    });
  }
}

export async function getSessionAdmin() {
  if (!isSupabaseConfigured()) {
    return { configured: false, user: null, admin: false };
  }
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { configured: true, user: null, admin: false };
  await bootstrapAdmin(user.id, user.email);
  const { data: admin } = await supabase
    .from("rtp_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  return { configured: true, user, admin: Boolean(admin) };
}

export function adminSql(userId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return "insert into public.rtp_admins (user_id) values ('YOUR_USER_ID');";
  return `insert into public.rtp_admins (user_id) values ('${userId}');`;
}
