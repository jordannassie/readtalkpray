import Papa from "papaparse";
import { parseEmail, cleanLeadPhone } from "./phone";
import type { LeadCategory, ParsedLead, InvalidRow } from "./types";

export type LeadField =
  | "full_name"
  | "first_name"
  | "last_name"
  | "phone"
  | "location"
  | "city"
  | "region"
  | "country"
  | "email"
  | "lead_id"
  | "created_time";

export type ColumnMapping = Partial<Record<LeadField, string>>;

const ALIASES: Record<LeadField, string[]> = {
  full_name: ["full_name", "name", "fullname"],
  first_name: ["first_name", "firstname", "first"],
  last_name: ["last_name", "lastname", "last"],
  phone: ["phone_number", "phone", "mobile", "mobile_number", "cell", "cell_phone"],
  location: ["location", "city_state_country", "full_address", "address"],
  city: ["city", "town"],
  region: ["state", "region", "province", "state_region", "county"],
  country: ["country", "nation"],
  email: ["email", "email_address", "e_mail"],
  lead_id: ["id", "lead_id", "meta_lead_id"],
  created_time: ["created_time", "created_at", "date_created", "created"],
};

export function normalizeHeader(header: string) {
  return header
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

export function suggestMapping(headers: string[]): {
  mapping: ColumnMapping;
  ambiguous: LeadField[];
} {
  const mapping: ColumnMapping = {};
  const ambiguous: LeadField[] = [];

  for (const field of Object.keys(ALIASES) as LeadField[]) {
    const matches = ALIASES[field].filter((alias) => headers.includes(alias));
    if (matches[0]) mapping[field] = matches[0];
    if (matches.length > 1) ambiguous.push(field);
  }

  return { mapping, ambiguous };
}

export function mappingIsComplete(mapping: ColumnMapping) {
  const hasName = Boolean(mapping.full_name || mapping.first_name);
  return hasName && Boolean(mapping.phone);
}

export function missingMappingLabels(mapping: ColumnMapping) {
  const missing: string[] = [];
  if (!mapping.full_name && !mapping.first_name) missing.push("name");
  if (!mapping.phone) missing.push("phone");
  return missing;
}

export function formatLeadLocation(parts: {
  location?: string;
  city?: string;
  region?: string;
  country?: string;
}) {
  const combined = parts.location?.trim();
  if (combined) return combined.slice(0, 300);
  const pieces = [parts.city, parts.region, parts.country]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));
  if (pieces.length === 0) return null;
  return pieces.join(", ").slice(0, 300);
}

export function splitLeadName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

export function storedLeadName(firstName: string, lastName: string) {
  return `${firstName.trim()}\u001f${lastName.trim()}`;
}

export function leadNameFields(lead: {
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}) {
  if (typeof lead.first_name === "string" || typeof lead.last_name === "string") {
    return {
      firstName: (lead.first_name ?? "").trim(),
      lastName: (lead.last_name ?? "").trim(),
    };
  }
  const fullName = lead.full_name ?? "";
  const marker = fullName.indexOf("\u001f");
  if (marker >= 0) {
    return {
      firstName: fullName.slice(0, marker).trim(),
      lastName: fullName.slice(marker + 1).trim(),
    };
  }
  return splitLeadName(fullName);
}

export function firstName(fullName: string) {
  return leadNameFields({ full_name: fullName }).firstName;
}

function cell(row: Record<string, string>, key: string | undefined) {
  if (!key) return "";
  return String(row[key] ?? "").trim();
}

export function parseCreatedTime(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function isBlankRow(row: Record<string, string>) {
  return Object.values(row).every((value) => String(value ?? "").trim() === "");
}

export type CsvAnalysis = {
  headers: string[];
  mapping: ColumnMapping;
  ambiguous: LeadField[];
  needsMapping: boolean;
  valid: ParsedLead[];
  invalid: InvalidRow[];
  blankCount: number;
  fileDuplicateCount: number;
  emailWarningCount: number;
  preview: ParsedLead[];
};

export function decodeLeadFile(bytes: Uint8Array) {
  const utf16le = bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe;
  const utf16be = bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff;
  const utf16leWithoutBom =
    bytes.length >= 8 && bytes[1] === 0 && bytes[3] === 0 && bytes[5] === 0;
  if (utf16le || utf16leWithoutBom) return new TextDecoder("utf-16le").decode(bytes);
  if (utf16be) return new TextDecoder("utf-16be").decode(bytes);
  return new TextDecoder("utf-8").decode(bytes);
}

export function detectDelimiter(text: string) {
  const line = text.replace(/^\uFEFF/, "").split(/\r?\n/, 1)[0] ?? "";
  const tabs = line.split("\t").length - 1;
  const commas = line.split(",").length - 1;
  if (tabs > commas) return "\t";
  if (commas > 0) return ",";
  return "";
}

export function analyzeCsv(text: string, mappingOverride?: ColumnMapping): CsvAnalysis {
  const delimiter = detectDelimiter(text);
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: false,
    transformHeader: normalizeHeader,
    ...(delimiter ? { delimiter } : {}),
  });

  const headers = (parsed.meta.fields ?? []).map(normalizeHeader).filter(Boolean);
  const suggested = suggestMapping(headers);
  const mapping = mappingOverride ?? suggested.mapping;
  const needsMapping = !mappingIsComplete(mapping);

  const valid: ParsedLead[] = [];
  const invalid: InvalidRow[] = [];
  let blankCount = 0;
  let fileDuplicateCount = 0;
  let emailWarningCount = 0;
  const seen = new Set<string>();

  if (!needsMapping) {
    parsed.data.forEach((row, index) => {
      const rowNumber = index + 2;
      if (isBlankRow(row)) {
        blankCount += 1;
        return;
      }

      const explicitName = Boolean(mapping.first_name || mapping.last_name);
      const name = explicitName
        ? { firstName: cell(row, mapping.first_name), lastName: cell(row, mapping.last_name) }
        : splitLeadName(cell(row, mapping.full_name));
      const fullName = [name.firstName, name.lastName].filter(Boolean).join(" ");
      const phoneRaw = cell(row, mapping.phone);
      const reasons: string[] = [];
      if (!name.firstName && !name.lastName) reasons.push("Name is missing.");
      const phone = cleanLeadPhone(phoneRaw);
      if (!phone.ok) reasons.push(phone.reason);

      if (reasons.length || !phone.ok) {
        invalid.push({ rowNumber, reason: reasons.join(" ") });
        return;
      }

      if (seen.has(phone.phone)) {
        fileDuplicateCount += 1;
        return;
      }
      seen.add(phone.phone);

      const email = parseEmail(cell(row, mapping.email));
      if (email.warning) emailWarningCount += 1;

      valid.push({
        rowNumber,
        fullName,
        firstName: name.firstName,
        lastName: name.lastName,
        phone: phone.phone,
        location: formatLeadLocation({
          location: cell(row, mapping.location),
          city: cell(row, mapping.city),
          region: cell(row, mapping.region),
          country: cell(row, mapping.country),
        }),
        email: email.email,
        emailWarning: email.warning,
        metaLeadId: cell(row, mapping.lead_id) || null,
        leadCreatedAt: parseCreatedTime(cell(row, mapping.created_time)),
      });
    });
  }

  return {
    headers,
    mapping,
    ambiguous: mappingOverride ? [] : suggested.ambiguous,
    needsMapping,
    valid,
    invalid,
    blankCount,
    fileDuplicateCount,
    emailWarningCount,
    preview: valid.slice(0, 10),
  };
}

export function withoutLeadNameColumns<T extends { first_name?: string | null; last_name?: string | null }>(row: T) {
  return Object.fromEntries(
    Object.entries(row).filter(([key]) => key !== "first_name" && key !== "last_name"),
  ) as Omit<T, "first_name" | "last_name">;
}

export function withoutCategoryColumns<T extends { category?: string | null; location?: string | null }>(row: T) {
  return Object.fromEntries(
    Object.entries(row).filter(([key]) => key !== "category" && key !== "location"),
  ) as Omit<T, "category" | "location">;
}

export function missingCategoryColumn(message: string) {
  return /category|location|on conflict|42P10|42703/i.test(message);
}

export function toInsertRow(lead: ParsedLead, sourceFile: string, category: LeadCategory = "join") {
  return {
    full_name: storedLeadName(lead.firstName, lead.lastName),
    first_name: lead.firstName,
    last_name: lead.lastName,
    phone: lead.phone,
    email: lead.email,
    location: lead.location,
    status: "new" as const,
    source: "Meta CSV",
    source_file: sourceFile,
    meta_lead_id: lead.metaLeadId,
    lead_created_at: lead.leadCreatedAt,
    category,
    city: lead.location,
  };
}

export function accountBatch(
  requested: number,
  inserted: number | null,
  failed: boolean,
) {
  if (failed || inserted === null) {
    return { added: 0, existing: 0, failed: requested };
  }
  return {
    added: inserted,
    existing: Math.max(0, requested - inserted),
    failed: 0,
  };
}

export function leadSearchOr(raw: string) {
  const term = raw.trim().replace(/[%_,]/g, "");
  if (!term) return null;
  const clauses = [
    `full_name.ilike.%${term}%`,
    `phone_normalized.ilike.%${term}%`,
    `email.ilike.%${term}%`,
  ];
  const digits = term.replace(/\D/g, "");
  if (digits.length >= 3 && digits !== term) {
    clauses.push(`phone_normalized.ilike.%${digits}%`);
  }
  return clauses.join(",");
}

export function sortLeadsForList<T extends { status: string; created_at: string; contacted_at?: string | null }>(
  leads: T[],
) {
  return [...leads].sort((a, b) => {
    const aDone = a.status !== "new";
    const bDone = b.status !== "new";
    if (aDone !== bDone) return aDone ? 1 : -1;
    if (aDone) return (a.contacted_at ?? "").localeCompare(b.contacted_at ?? "");
    return b.created_at.localeCompare(a.created_at);
  });
}

export function pageRange(page: number, pageSize: number) {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

export function invitationText(template: string, fullName: string) {
  const first = fullName.trim().split(/\s+/)[0] ?? "";
  return template.replaceAll("{first_name}", first);
}

export function excelSafe(value: string) {
  if (/^[=+\-@\t\r]/.test(value)) return `'${value}`;
  return value;
}

export function leadsToCsv(
  rows: {
    full_name: string;
    phone: string;
    email: string | null;
    status: string;
    notes: string | null;
    contacted_at: string | null;
  }[],
) {
  const header = ["full_name", "phone", "email", "status", "notes", "contacted_at"];
  const lines = rows.map((row) =>
    [
      row.full_name,
      row.phone,
      row.email ?? "",
      row.status,
      row.notes ?? "",
      row.contacted_at ?? "",
    ]
      .map((value) => {
        const safe = excelSafe(value);
        return /[",\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
      })
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

export function phonesForBulkCopy(
  leads: { phone: string; status: string; selected: boolean }[],
  format: (phone: string) => string,
) {
  return leads
    .filter((lead) => lead.selected && lead.status !== "do_not_contact")
    .map((lead) => format(lead.phone))
    .join("\n");
}
