import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeCsv, accountBatch, decodeLeadFile, excelSafe, firstName, leadNameFields, leadSearchOr, pageRange, phonesForBulkCopy, sortLeadsForList, storedLeadName, toInsertRow } from "./csv";
import { databaseFailureText, importLeads, importSummaryText } from "./import";
import { cleanLeadPhone, formatUsPhone } from "./phone";
import { startLeadRows, saveStartSignup } from "./start";
import { UPSERT_OPTIONS } from "./types";
import { isWebsiteLead, saveWebsiteSignups, signupsNotYetSynced, websiteLeadRows } from "./website";

describe("lead phones", () => {
  it("removes only a leading p: and surrounding whitespace", () => {
    const result = cleanLeadPhone("  p:+44 7700 900123  ");
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.phone, "+44 7700 900123");
    const plain = cleanLeadPhone(" +1 214 555 0199 ");
    assert.equal(plain.ok, true);
    if (plain.ok) assert.equal(plain.phone, "+1 214 555 0199");
  });

  it("keeps every digit and a leading plus", () => {
    for (const value of ["+447700900123", "(214) 555-0199", "214-555-0199 x12", "P:+81 90 1234 5678"]) {
      const result = cleanLeadPhone(value);
      assert.equal(result.ok, true);
      if (result.ok) assert.equal(result.phone.includes("+") || !value.includes("+"), true);
    }
    const japan = cleanLeadPhone("P:+81 90 1234 5678");
    assert.equal(japan.ok, true);
    if (japan.ok) assert.equal(japan.phone, "+81 90 1234 5678");
    assert.equal(cleanLeadPhone("   ").ok, false);
  });
});

describe("CSV import", () => {
  const csv = [
    "full_name,phone_number,email,id,created_time",
    'Jordan Nassie,"(214) 555-0199",jordan@example.com,abc123,2026-10-01T10:00:00-05:00',
    "Susie Nassie,1-214-555-0199,susie@example.com,def456,2026-10-02T10:00:00-05:00",
    "Pat Lee,2145550100,not-an-email,ghi789,",
    ",,,,",
    "No Phone,ext 99,ok@example.com,bad,",
    '"Quoted, Name",214-555-0101,"line@example.com","id,1","2026-10-03T12:00:00Z"',
  ].join("\r\n");

  it("keeps each provided phone, including different formatting", () => {
    const analysis = analyzeCsv(`\uFEFF${csv}`);
    assert.equal(analysis.needsMapping, false);
    assert.equal(analysis.valid.length, 5);
    assert.equal(analysis.fileDuplicateCount, 0);
    assert.equal(analysis.blankCount, 1);
    assert.equal(analysis.invalid.length, 0);
    assert.equal(analysis.emailWarningCount, 1);
    assert.equal(analysis.valid[0]?.phone, "(214) 555-0199");
    assert.equal(analysis.valid[0]?.firstName, "Jordan");
    assert.equal(analysis.valid[0]?.lastName, "Nassie");
    assert.equal(analysis.valid[1]?.phone, "1-214-555-0199");
    assert.equal(analysis.valid[3]?.phone, "ext 99");
    assert.equal(analysis.valid[2]?.email, null);
    assert.equal(analysis.valid[4]?.fullName, "Quoted, Name");
    assert.equal(analysis.valid[4]?.metaLeadId, "id,1");
  });

  it("reads a quoted multiline field", () => {
    const analysis = analyzeCsv('first_name,last_name,phone,email\n"Ann\nLee",Nassie,2145550102,ann@example.com\n');
    assert.equal(analysis.needsMapping, false);
    assert.equal(analysis.valid[0]?.fullName, "Ann\nLee Nassie");
    assert.equal(analysis.valid[0]?.phone, "2145550102");
    assert.equal(analysis.invalid.length, 0);
  });

  it("picks the name and phone columns without asking", () => {
    const analysis = analyzeCsv("name,phone,mobile\nA,2145550199,2145550100\n");
    assert.equal(analysis.needsMapping, false);
    assert.equal(analysis.mapping.phone, "phone");
    assert.equal(analysis.valid[0]?.phone, "2145550199");
    assert.equal(firstName("Jordan Nassie"), "Jordan");
  });

  it("reads a UTF-16 tab-separated Meta export", () => {
    const text = [
      "id\tcreated_time\tad_name\tfirst_name\tphone",
      "1\t2026-10-01T10:00:00Z\tFrisco\tJordan\t(214) 555-0199",
      "2\t2026-10-02T10:00:00Z\tFrisco\tPat\t+44 7700 900123",
    ].join("\n");
    const bytes = new Uint8Array(Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(text, "utf16le")]));
    const analysis = analyzeCsv(decodeLeadFile(bytes));
    assert.equal(analysis.needsMapping, false);
    assert.equal(analysis.mapping.full_name, undefined);
    assert.equal(analysis.valid.length, 2);
    assert.equal(analysis.valid[0]?.fullName, "Jordan");
    assert.equal(analysis.valid[0]?.firstName, "Jordan");
    assert.equal(analysis.valid[0]?.lastName, "");
    assert.equal(analysis.valid[0]?.phone, "(214) 555-0199");
    assert.equal(analysis.valid[1]?.phone, "+44 7700 900123");
    assert.equal(analysis.invalid.length, 0);
  });

  it("treats the same CSV phone as a duplicate after removing p:", () => {
    const analysis = analyzeCsv("first_name,phone\nPat,p:+44 7700 900123\nPat Again, +44 7700 900123 \n");
    assert.equal(analysis.valid.length, 1);
    assert.equal(analysis.fileDuplicateCount, 1);
    assert.equal(analysis.valid[0]?.phone, "+44 7700 900123");
    assert.equal(analysis.valid[0]?.firstName, "Pat");
    assert.equal(analysis.valid[0]?.lastName, "");
    assert.equal(analysis.invalid.length, 0);
  });

  it("keeps a multi-word first name when the CSV has separate name columns", () => {
    const analysis = analyzeCsv("first_name,last_name,phone\nMary Ann,Smith,2145550199\n");
    assert.equal(analysis.valid[0]?.firstName, "Mary Ann");
    assert.equal(analysis.valid[0]?.lastName, "Smith");
    const full = analyzeCsv("full_name,phone\nMary Ann Smith,2145550100\nOnly,2145550101\n");
    assert.equal(full.valid[0]?.firstName, "Mary");
    assert.equal(full.valid[0]?.lastName, "Ann Smith");
    assert.equal(full.valid[1]?.firstName, "Only");
    assert.equal(full.valid[1]?.lastName, "");
    assert.deepEqual(leadNameFields({ full_name: storedLeadName("Mary Ann", "") }), {
      firstName: "Mary Ann",
      lastName: "",
    });
    assert.deepEqual(leadNameFields({ full_name: "Jordan Nassie" }), {
      firstName: "Jordan",
      lastName: "Nassie",
    });
  });

  it("builds insert rows without generated or existing-lead fields", () => {
    const [lead] = analyzeCsv("name,phone\nA,2145550199\n").valid;
    const row = toInsertRow(lead!, "leads.csv");
    assert.equal(row.phone, "2145550199");
    assert.equal(row.first_name, "A");
    assert.equal(row.last_name, "");
    assert.equal(row.full_name, storedLeadName("A", ""));
    assert.equal(row.source, "Meta CSV");
    assert.equal(row.source_file, "leads.csv");
    assert.equal("phone_normalized" in row, false);
    assert.equal("notes" in row, false);
    assert.equal("contacted_at" in row, false);
    assert.equal("imported_by" in row, false);
    assert.equal(row.category, "join");
    assert.equal(row.location, null);
    assert.equal(UPSERT_OPTIONS.ignoreDuplicates, true);
    assert.equal(UPSERT_OPTIONS.onConflict, "phone_normalized,category");
  });

  it("saves without a signed-in user and does not send imported_by", async () => {
    const leads = analyzeCsv("name,phone\nA,p:+44 7700 900123\n").valid;
    let sent: unknown[] = [];
    const summary = await importLeads(
      {
        upsertLeads: async (rows) => {
          sent = rows;
          return { data: [{ id: "1" }], error: null };
        },
      },
      leads,
      "leads.csv",
      0,
      0,
    );
    assert.equal(summary.added, 1);
    assert.equal(summary.failed, 0);
    assert.equal("imported_by" in (sent[0] as object), false);
    assert.equal((sent[0] as { phone: string }).phone, "+44 7700 900123");
  });
});

describe("saving", () => {
  it("does not count a failed batch as added or duplicate", async () => {
    const leads = analyzeCsv("name,phone\nA,2145550199\nB,2145550100\n").valid;
    const summary = await importLeads(
      {
        upsertLeads: async () => ({ data: null, error: { message: "permission denied" } }),
      },
      leads,
      "leads.csv",
      0,
      0,
    );
    assert.equal(summary.added, 0);
    assert.equal(summary.existingDuplicates, 0);
    assert.equal(summary.failed, 2);
    assert.equal(summary.failedLeads.length, 2);
    assert.equal(importSummaryText(summary), "0 imported · 0 duplicates · 0 invalid");
    assert.equal(databaseFailureText(summary.errors), "Import could not save. permission denied");
    assert.equal(summary.errors[0], "permission denied");
  });

  it("counts only rows the database says were inserted", async () => {
    const leads = analyzeCsv("name,phone\nA,2145550199\nB,2145550100\n").valid;
    const summary = await importLeads(
      {
        upsertLeads: async () => ({ data: [{ id: "1" }], error: null }),
      },
      leads,
      "leads.csv",
      1,
      2,
    );
    assert.equal(summary.added, 1);
    assert.equal(summary.existingDuplicates, 1);
    assert.equal(summary.fileDuplicates, 1);
    assert.equal(summary.invalid, 2);
    assert.equal(importSummaryText(summary), "1 imported · 2 duplicates · 2 invalid");
  });

  it("does not treat a failed request as a successful insert", () => {
    assert.deepEqual(accountBatch(4, null, true), { added: 0, existing: 0, failed: 4 });
    assert.deepEqual(accountBatch(4, 4, false), { added: 4, existing: 0, failed: 0 });
  });
});

describe("website signups", () => {
  it("stores a new unchecked website lead and skips a duplicate phone", () => {
    const rows = websiteLeadRows([
      { firstName: "  Ada  ", mobile: " p: +44 7700 900123 ", createdAt: "2026-10-20T15:00:00-05:00" },
      { firstName: "Ada Again", mobile: "+44 7700 900123", createdAt: "2026-10-21T15:00:00Z" },
      { firstName: "Bea", mobile: "(214) 555-0177", createdAt: "not-a-date" },
      { firstName: "", mobile: "2145550100" },
      { firstName: "Short", mobile: "ext 99" },
    ]);
    assert.equal(rows.length, 2);
    assert.equal(rows[0]?.first_name, "Ada");
    assert.equal(rows[0]?.last_name, "");
    assert.equal(rows[0]?.phone, "+44 7700 900123");
    assert.equal(rows[0]?.status, "new");
    assert.equal(rows[0]?.source, "website");
    assert.equal(rows[0]?.category, "join");
    assert.equal(rows[0]?.location, null);
    assert.equal(rows[0]?.created_at, "2026-10-20T20:00:00.000Z");
    assert.equal(rows[1]?.first_name, "Bea");
    assert.equal("created_at" in (rows[1] as object), false);
    assert.equal("phone_normalized" in (rows[0] as object), false);
    assert.equal("imported_by" in (rows[0] as object), false);
    assert.equal(isWebsiteLead(rows[0]?.source), true);
    assert.equal(isWebsiteLead("Meta CSV"), false);
    assert.deepEqual(signupsNotYetSynced(
      [{ firstName: "Ada", mobile: "p:+44 7700 900123" }, { firstName: "Bea", mobile: "2145550177" }],
      ["+44 7700 900123"],
    ).map((signup) => signup.firstName), ["Bea"]);
  });

  it("treats a failed website save as unsuccessful", async () => {
    let sent = "";
    const saved = await saveWebsiteSignups(
      [{ firstName: "Ada", mobile: "p: 2145550199" }],
      async (_url, init) => {
        sent = String(init?.body);
        return new Response(JSON.stringify({ ok: true, phones: ["2145550199"] }), { status: 200 });
      },
    );
    assert.equal(saved.ok, true);
    if (saved.ok) assert.deepEqual(saved.phones, ["2145550199"]);
    assert.equal(sent.includes('"source"'), false);
    assert.equal(sent.includes("2145550199"), true);

    const failed = await saveWebsiteSignups(
      [{ firstName: "Ada", mobile: "2145550199" }],
      async () => new Response(JSON.stringify({ ok: false }), { status: 500 }),
    );
    assert.equal(failed.ok, false);

    const offline = await saveWebsiteSignups(
      [{ firstName: "Ada", mobile: "2145550199" }],
      async () => {
        throw new Error("offline");
      },
    );
    assert.equal(offline.ok, false);
  });
});

describe("start signups and locations", () => {
  it("keeps an older attendee CSV that has no location", () => {
    const analysis = analyzeCsv("full_name,phone_number\nAda,2145550199\n");
    assert.equal(analysis.needsMapping, false);
    assert.equal(analysis.valid[0]?.location, null);
  });

  it("combines city, region, and country, and prefers a location column", () => {
    const parts = analyzeCsv("first_name,phone,city,state,country\nAda,+44 7700 900123,Frisco,Texas,USA\n");
    assert.equal(parts.valid[0]?.location, "Frisco, Texas, USA");
    assert.equal(parts.valid[0]?.phone, "+44 7700 900123");
    const combined = analyzeCsv("name,phone,location,city\nBea,2145550100,\"Nairobi, Kenya\",Nairobi\n");
    assert.equal(combined.valid[0]?.location, "Nairobi, Kenya");
  });

  it("asks for a mapping when the phone column is not recognized", () => {
    const analysis = analyzeCsv("person,mobile_digits\nAda,2145550199\n");
    assert.equal(analysis.needsMapping, true);
    const mapped = analyzeCsv("person,mobile_digits\nAda,2145550199\n", {
      full_name: "person",
      phone: "mobile_digits",
    });
    assert.equal(mapped.needsMapping, false);
    assert.equal(mapped.valid[0]?.firstName, "Ada");
  });

  it("saves a start lead separately from a join lead with the same phone", () => {
    const start = startLeadRows([
      { name: "  Ada Lovelace  ", mobile: " +44 7700 900123 ", location: " Frisco, Texas, USA " },
      { name: "Ada Again", mobile: "+44 7700 900123", location: "Dallas, Texas, USA" },
      { name: "No Place", mobile: "2145550199", location: "  " },
    ]);
    assert.equal(start.length, 1);
    assert.equal(start[0]?.category, "start");
    assert.equal(start[0]?.first_name, "Ada Lovelace");
    assert.equal(start[0]?.phone, "+44 7700 900123");
    assert.equal(start[0]?.location, "Frisco, Texas, USA");
    assert.equal(start[0]?.source, "website");
    const join = websiteLeadRows([{ firstName: "Ada Lovelace", mobile: "+44 7700 900123" }]);
    assert.equal(join[0]?.category, "join");
    assert.equal(join[0]?.phone, start[0]?.phone);
  });

  it("does not show start success unless the saved phone comes back", async () => {
    const saved = await saveStartSignup(
      { name: "Ada", mobile: "2145550199", location: "Frisco, Texas, USA" },
      async () => new Response(JSON.stringify({ ok: true, phones: ["2145550199"] }), { status: 200 }),
    );
    assert.equal(saved.ok, true);
    const missing = await saveStartSignup(
      { name: "Ada", mobile: "2145550199", location: "Frisco, Texas, USA" },
      async () => new Response(JSON.stringify({ ok: true, phones: [] }), { status: 200 }),
    );
    assert.equal(missing.ok, true);
    if (missing.ok) assert.deepEqual(missing.phones, []);
    const failed = await saveStartSignup(
      { name: "Ada", mobile: "2145550199", location: "Frisco, Texas, USA" },
      async () => new Response(JSON.stringify({ ok: false }), { status: 500 }),
    );
    assert.equal(failed.ok, false);
  });
});

describe("outreach helpers", () => {
  it("copies phones without including do-not-contact rows", () => {
    const text = phonesForBulkCopy(
      [
        { phone: "2145550199", status: "new", selected: true },
        { phone: "2145550100", status: "do_not_contact", selected: true },
      ],
      formatUsPhone,
    );
    assert.equal(text, "(214) 555-0199");
    assert.equal(text.includes("status"), false);
  });

  it("protects spreadsheet formulas", () => {
    assert.equal(excelSafe("=cmd"), "'=cmd");
    assert.equal(excelSafe("+1"), "'+1");
    assert.equal(excelSafe("Jordan"), "Jordan");
  });

  it("strips filter characters from search", () => {
    assert.equal(leadSearchOr("%"), null);
    assert.equal(leadSearchOr("a,status.eq.new"), leadSearchOr("astatus.eq.new"));
  });

  it("moves checked leads to the bottom", () => {
    const sorted = sortLeadsForList([
      { id: "new-old", status: "new", created_at: "2026-10-01T00:00:00Z", contacted_at: null },
      { id: "done-new", status: "contacted", created_at: "2026-10-03T00:00:00Z", contacted_at: "2026-10-21T00:00:00Z" },
      { id: "new-new", status: "new", created_at: "2026-10-20T00:00:00Z", contacted_at: null },
      { id: "done-old", status: "contacted", created_at: "2026-10-02T00:00:00Z", contacted_at: "2026-10-04T00:00:00Z" },
    ]);
    assert.deepEqual(sorted.map((lead) => lead.id), ["new-new", "new-old", "done-old", "done-new"]);
  });

  it("pages through every row", () => {
    const total = 125;
    const size = 50;
    const covered = new Set<number>();
    for (let page = 0; page * size < total; page += 1) {
      const { from, to } = pageRange(page, size);
      for (let index = from; index <= Math.min(to, total - 1); index += 1) {
        covered.add(index);
      }
    }
    assert.equal(covered.size, total);
  });
});
