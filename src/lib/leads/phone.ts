export function cleanLeadPhone(
  raw: string,
): { ok: true; phone: string } | { ok: false; reason: string } {
  let phone = raw.trim();
  if (phone.slice(0, 2).toLowerCase() === "p:") phone = phone.slice(2).trim();
  if (!phone) return { ok: false, reason: "Phone number is missing." };
  return { ok: true, phone };
}

export function formatUsPhone(digits: string) {
  if (digits.length !== 10) return digits;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function parseEmail(raw: string): {
  email: string | null;
  warning: string | null;
} {
  const trimmed = raw.trim();
  if (!trimmed) return { email: null, warning: null };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { email: null, warning: "Email looks invalid and was not saved." };
  }
  return { email: trimmed, warning: null };
}
