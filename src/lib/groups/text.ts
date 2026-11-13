export function cleanText(value: string, max: number) {
  return value.replace(/[\u0000-\u001f]/g, "").trim().slice(0, max);
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function ownProfilePhotoUrl(userId: string, value: string | null | undefined) {
  const url = safePhotoUrl(value);
  if (!url || !isUuid(userId)) return null;
  return url.includes(`/rtp-photos/profiles/${userId}/`) ? url : null;
}

export function safePhotoUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    const expected = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!expected || url.protocol !== "https:") return null;
    if (url.origin !== new URL(expected).origin) return null;
    if (!url.pathname.includes("/rtp-photos/")) return null;
    return url.toString();
  } catch {
    return null;
  }
}
