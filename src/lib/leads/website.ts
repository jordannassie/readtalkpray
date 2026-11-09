import { storedLeadName } from "./csv";
import { cleanLeadPhone } from "./phone";

export const WEBSITE_SOURCE = "website";

export type WebsiteSignup = {
  firstName: string;
  mobile: string;
  createdAt?: string | null;
};

export type WebsiteLeadInsert = {
  full_name: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: null;
  status: "new";
  source: typeof WEBSITE_SOURCE;
  source_file: null;
  meta_lead_id: null;
  lead_created_at: null;
  category: "join";
  location: null;
  created_at?: string;
};

export function isWebsiteLead(source: string | null | undefined) {
  return source === WEBSITE_SOURCE;
}

export function isWebsitePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

function createdAtOrUndefined(value: string | null | undefined) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export function websiteLeadRows(signups: WebsiteSignup[]): WebsiteLeadInsert[] {
  const seen = new Set<string>();
  const rows: WebsiteLeadInsert[] = [];

  for (const signup of signups) {
    const firstName = signup.firstName.trim();
    const phone = cleanLeadPhone(signup.mobile);
    if (!firstName || !phone.ok || !isWebsitePhone(phone.phone)) continue;
    if (seen.has(phone.phone)) continue;
    seen.add(phone.phone);
    const createdAt = createdAtOrUndefined(signup.createdAt);
    rows.push({
      full_name: storedLeadName(firstName, ""),
      first_name: firstName,
      last_name: "",
      phone: phone.phone,
      email: null,
      status: "new",
      source: WEBSITE_SOURCE,
      source_file: null,
      meta_lead_id: null,
      lead_created_at: null,
      category: "join",
      location: null,
      ...(createdAt ? { created_at: createdAt } : {}),
    });
  }

  return rows;
}

export function signupsNotYetSynced(signups: WebsiteSignup[], syncedPhones: string[]) {
  const synced = new Set(syncedPhones);
  return signups.filter((signup) => {
    const phone = websiteLeadRows([signup])[0]?.phone;
    return phone !== undefined && !synced.has(phone);
  });
}

export async function saveWebsiteSignups(
  signups: WebsiteSignup[],
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: true; phones: string[] } | { ok: false }> {
  const rows = websiteLeadRows(signups);
  if (rows.length === 0) return { ok: false };

  try {
    const response = await fetchImpl("/api/leads/website", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        signups: rows.map((row) => ({
          firstName: row.first_name,
          mobile: row.phone,
          createdAt: row.created_at ?? null,
        })),
      }),
    });
    if (!response.ok) return { ok: false };
    const body = (await response.json()) as { ok?: boolean; phones?: unknown };
    if (!body.ok || !Array.isArray(body.phones)) return { ok: false };
    return {
      ok: true,
      phones: body.phones.filter((phone): phone is string => typeof phone === "string"),
    };
  } catch {
    return { ok: false };
  }
}
