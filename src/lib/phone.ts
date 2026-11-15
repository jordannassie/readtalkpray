import { AsYouType, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

const DEFAULT_COUNTRY: CountryCode = "US";

export type StoredPhone = { e164: string; display: string };

export function normalizePhone(raw: string): StoredPhone | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parsed = trimmed.startsWith("+")
    ? parsePhoneNumberFromString(trimmed)
    : parsePhoneNumberFromString(trimmed, DEFAULT_COUNTRY);
  if (!parsed?.isValid()) return null;
  if (!trimmed.startsWith("+") && parsed.country !== DEFAULT_COUNTRY) return null;
  return {
    e164: parsed.number,
    display: parsed.country === DEFAULT_COUNTRY ? parsed.formatNational() : parsed.formatInternational(),
  };
}

export function displayPhone(value: string | null | undefined) {
  if (!value) return "";
  return normalizePhone(value)?.display ?? value.trim();
}

export function dialPhone(value: string | null | undefined) {
  if (!value) return "";
  return normalizePhone(value)?.e164 ?? value.trim();
}

export function formatPhoneTyping(value: string) {
  const trimmed = value.trimStart();
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) return new AsYouType().input(trimmed);
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length > 11) return trimmed;
  return new AsYouType(DEFAULT_COUNTRY).input(digits);
}

export function applyPhoneEdit(previous: string, raw: string, caret: number) {
  let digitsBefore = raw.slice(0, caret).replace(/\D/g, "").length;
  let source = raw;
  const sameDigits = raw.replace(/\D/g, "") === previous.replace(/\D/g, "");
  if (sameDigits && raw.length < previous.length && digitsBefore > 0) {
    const digits = raw.replace(/\D/g, "");
    source = digits.slice(0, digitsBefore - 1) + digits.slice(digitsBefore);
    digitsBefore -= 1;
  }
  const formatted = formatPhoneTyping(source);
  if (digitsBefore <= 0) return { value: formatted, cursor: formatted.startsWith("+") ? 1 : 0 };
  let seen = 0;
  for (let index = 0; index < formatted.length; index += 1) {
    if (/\d/.test(formatted[index] ?? "")) seen += 1;
    if (seen === digitsBefore) return { value: formatted, cursor: index + 1 };
  }
  return { value: formatted, cursor: formatted.length };
}
