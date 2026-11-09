import { saveWebsiteSignups, signupsNotYetSynced, websiteLeadRows, type WebsiteSignup } from "@/lib/leads/website";

export type SundayRsvp = {
  first_name: string;
  mobile: string;
  location_id: string;
  created_at: string;
};

const STORAGE_KEY = "sending-sunday-rsvps";
const SYNCED_KEY = "sending-sunday-rsvps-synced";

export function saveSundayRsvp(input: {
  first_name: string;
  mobile: string;
  location_id: string;
}): SundayRsvp {
  const record: SundayRsvp = {
    first_name: input.first_name.trim(),
    mobile: input.mobile.trim(),
    location_id: input.location_id,
    created_at: new Date().toISOString(),
  };

  const existing = readSundayRsvps();
  existing.push(record);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  }

  return record;
}

export function readSundayRsvps(): SundayRsvp[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SundayRsvp[]) : [];
  } catch {
    return [];
  }
}

function readSyncedPhones() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SYNCED_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function rememberSyncedPhones(phones: string[]) {
  if (typeof window === "undefined") return;
  const next = new Set(readSyncedPhones());
  for (const phone of phones) next.add(phone);
  window.localStorage.setItem(SYNCED_KEY, JSON.stringify([...next]));
}

function toSignup(record: SundayRsvp): WebsiteSignup {
  return {
    firstName: record.first_name,
    mobile: record.mobile,
    createdAt: record.created_at,
  };
}

export async function syncStoredSundayRsvps() {
  const pending = signupsNotYetSynced(readSundayRsvps().map(toSignup), readSyncedPhones());
  if (pending.length === 0) return;
  const result = await saveWebsiteSignups(pending);
  if (result.ok) rememberSyncedPhones(result.phones);
}

export async function submitSundayRsvp(input: {
  first_name: string;
  mobile: string;
  location_id: string;
}) {
  const current: WebsiteSignup = {
    firstName: input.first_name.trim(),
    mobile: input.mobile.trim(),
    createdAt: new Date().toISOString(),
  };
  const phone = websiteLeadRows([current])[0]?.phone;
  if (!phone) return false;

  const pending = signupsNotYetSynced(readSundayRsvps().map(toSignup), readSyncedPhones());
  const result = await saveWebsiteSignups([current, ...pending]);
  if (!result.ok || !result.phones.includes(phone)) return false;

  saveSundayRsvp(input);
  rememberSyncedPhones(result.phones);
  return true;
}
