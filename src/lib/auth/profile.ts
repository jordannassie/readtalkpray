import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type AccountProfile = {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  photo_url: string | null;
};

export function googleAvatar(user: User) {
  const value = user.user_metadata?.avatar_url ?? user.user_metadata?.picture;
  return typeof value === "string" && value.startsWith("https://") ? value : null;
}

function displayName(user: User) {
  const full = user.user_metadata?.full_name;
  const google = user.user_metadata?.name;
  if (typeof full === "string" && full.trim()) return full.trim();
  if (typeof google === "string" && google.trim()) return google.trim();
  return null;
}

export async function ensureProfile(user: User): Promise<AccountProfile> {
  const fallback: AccountProfile = {
    user_id: user.id,
    full_name: displayName(user),
    phone: null,
    photo_url: null,
  };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rtp_profiles")
    .select("user_id, full_name, phone, photo_url")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) return fallback;
  if (data) return data as AccountProfile;
  const { error: insertError } = await supabase.from("rtp_profiles").insert({
    user_id: user.id,
    full_name: fallback.full_name,
  });
  if (insertError) return fallback;
  return fallback;
}
