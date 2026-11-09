import { storedLeadName } from "./csv";
import { cleanLeadPhone } from "./phone";
import { WEBSITE_SOURCE, isWebsitePhone } from "./website";

export type StartSignup = {
  name: string;
  mobile: string;
  location: string;
};

export type StartLeadInsert = {
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
  category: "start";
  location: string;
};

export function startLeadRows(signups: StartSignup[]): StartLeadInsert[] {
  const seen = new Set<string>();
  const rows: StartLeadInsert[] = [];

  for (const signup of signups) {
    const name = signup.name.trim();
    const location = signup.location.trim();
    const phone = cleanLeadPhone(signup.mobile);
    if (!name || name.length > 120 || !location || location.length > 300) continue;
    if (!phone.ok || !isWebsitePhone(phone.phone)) continue;
    if (seen.has(phone.phone)) continue;
    seen.add(phone.phone);
    rows.push({
      full_name: storedLeadName(name, ""),
      first_name: name,
      last_name: "",
      phone: phone.phone,
      email: null,
      status: "new",
      source: WEBSITE_SOURCE,
      source_file: null,
      meta_lead_id: null,
      lead_created_at: null,
      category: "start",
      location: location.slice(0, 300),
    });
  }

  return rows;
}

export async function saveStartSignup(
  signup: StartSignup,
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: true; phones: string[] } | { ok: false }> {
  if (startLeadRows([signup]).length === 0) return { ok: false };

  try {
    const response = await fetchImpl("/api/leads/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: signup.name,
        mobile: signup.mobile,
        location: signup.location,
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
