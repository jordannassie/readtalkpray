"use client";

import { useState } from "react";
import { analyzeCsv, decodeLeadFile, type ColumnMapping, type CsvAnalysis, type LeadField } from "@/lib/leads/csv";
import { databaseFailureText, importSummaryText } from "@/lib/leads/import";
import type { LeadCategory } from "@/lib/leads/types";

const FIELD_LABELS: { field: LeadField; label: string }[] = [
  { field: "full_name", label: "Full name" },
  { field: "first_name", label: "First name" },
  { field: "last_name", label: "Last name" },
  { field: "phone", label: "Phone number" },
  { field: "location", label: "Location" },
  { field: "city", label: "City" },
  { field: "region", label: "State / region" },
  { field: "country", label: "Country" },
];

const DESTINATION: Record<LeadCategory, string> = {
  join: "Join a Bible Group",
  start: "New Bible Groups",
};

export function CsvImport({
  category,
  onImported,
}: {
  category: LeadCategory;
  onImported: () => void;
}) {
  const [summary, setSummary] = useState("");
  const [rowProblems, setRowProblems] = useState<string[]>([]);
  const [databaseProblem, setDatabaseProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<{ fileName: string; text: string; analysis: CsvAnalysis } | null>(null);

  function chooseFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const bytes = new Uint8Array(reader.result as ArrayBuffer);
      const text = decodeLeadFile(bytes);
      setSummary("");
      setRowProblems([]);
      setDatabaseProblem("");
      setPending({ fileName: file.name, text, analysis: analyzeCsv(text) });
    };
    reader.readAsArrayBuffer(file);
  }

  function updateMapping(field: LeadField, header: string) {
    if (!pending) return;
    const mapping: ColumnMapping = { ...pending.analysis.mapping };
    if (header) mapping[field] = header;
    else delete mapping[field];
    setPending({ ...pending, analysis: analyzeCsv(pending.text, mapping) });
  }

  async function confirmImport() {
    if (!pending || pending.analysis.needsMapping || busy) return;
    setBusy(true);
    setSummary("");
    setDatabaseProblem("");
    const analysis = pending.analysis;
    const problemsForRows = analysis.invalid.map((row) => `Row ${row.rowNumber}: ${row.reason}`);

    if (analysis.valid.length === 0) {
      const duplicates = analysis.fileDuplicateCount;
      setSummary(importSummaryText({ added: 0, fileDuplicates: duplicates, existingDuplicates: 0, invalid: analysis.invalid.length }));
      setRowProblems(problemsForRows);
      setBusy(false);
      setPending(null);
      return;
    }

    const response = await fetch("/api/leads/import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fileName: pending.fileName,
        category,
        leads: analysis.valid.map((lead) => ({
          fullName: lead.fullName,
          firstName: lead.firstName,
          lastName: lead.lastName,
          phone: lead.phone,
          location: lead.location,
          email: lead.email,
          metaLeadId: lead.metaLeadId,
          leadCreatedAt: lead.leadCreatedAt,
          rowNumber: lead.rowNumber,
        })),
      }),
    });
    const result = (await response.json()) as {
      added?: number;
      existingDuplicates?: number;
      failed?: number;
      invalid?: number;
      errors?: string[];
      error?: string;
    };
    const saved = {
      added: result.added ?? 0,
      fileDuplicates: analysis.fileDuplicateCount,
      existingDuplicates: result.existingDuplicates ?? 0,
      invalid: analysis.invalid.length + (result.invalid ?? 0),
      failed: result.failed ?? (response.ok ? 0 : analysis.valid.length),
      errors: result.error ? [result.error] : (result.errors ?? []),
    };

    if (saved.failed > 0 || saved.errors.length > 0) {
      setDatabaseProblem(databaseFailureText(saved.errors));
    }
    setSummary(importSummaryText(saved));
    setRowProblems(problemsForRows);
    setBusy(false);
    setPending(null);
    if (saved.added > 0) onImported();
  }

  const analysis = pending?.analysis;

  return (
    <section>
      <label
        className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-black/15 bg-white px-4 text-center"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          if (file) chooseFile(file);
        }}
      >
        <span className="text-base font-medium">{busy ? "Importing…" : "Drop a Meta leads CSV"}</span>
        <span className="mt-2 text-sm text-[var(--sending-blue)]">or tap to choose a file</span>
        <input
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          aria-label="Choose a Meta leads CSV"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) chooseFile(file);
          }}
        />
      </label>

      {analysis ? (
        <div className="mt-4 rounded-3xl border border-black/10 bg-white p-4">
          <p className="text-sm font-medium">
            These leads will be added to {DESTINATION[category]}.
          </p>
          {analysis.needsMapping ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {FIELD_LABELS.map((item) => (
                <label key={item.field} className="block text-sm">
                  <span className="font-medium">{item.label}</span>
                  <select
                    className="mt-1 h-11 w-full rounded-2xl border border-[#e6e6e6] bg-[#f7f7f7] px-3"
                    value={analysis.mapping[item.field] ?? ""}
                    onChange={(event) => updateMapping(item.field, event.target.value)}
                  >
                    <option value="">Not in this file</option>
                    {analysis.headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
              <p className="text-sm text-[#9a3412] sm:col-span-2">
                Choose the name and phone columns before importing.
              </p>
            </div>
          ) : null}
          {analysis.preview.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <p className="text-xs font-medium uppercase tracking-wide text-[#666]">Preview</p>
              <ul className="mt-2 divide-y divide-black/5 text-sm">
                {analysis.preview.map((lead) => (
                  <li key={`${lead.rowNumber}-${lead.phone}`} className="grid gap-1 py-2 sm:grid-cols-3">
                    <span>{lead.fullName}</span>
                    <span className="tabular-nums">{lead.phone}</span>
                    <span>{lead.location || "No location"}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {analysis.invalid.length > 0 ? (
            <ul className="mt-3 space-y-1 text-sm text-[#9a3412]">
              {analysis.invalid.map((row) => (
                <li key={`${row.rowNumber}-${row.reason}`}>
                  Row {row.rowNumber}: {row.reason}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || analysis.needsMapping}
              onClick={() => void confirmImport()}
              className="rounded-full bg-[var(--sending-blue)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--sending-blue-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Importing…" : `Import ${analysis.valid.length} ${analysis.valid.length === 1 ? "lead" : "leads"}`}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setPending(null)}
              className="rounded-full border border-[#e6e6e6] px-5 py-2.5 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {summary ? <p className="mt-4 text-sm font-medium">{summary}</p> : null}
      {databaseProblem ? (
        <p className="mt-3 rounded-2xl bg-[#fff4ec] px-4 py-3 text-sm text-[#9a3412]" role="alert">
          {databaseProblem}
        </p>
      ) : null}
      {rowProblems.length > 0 ? (
        <div className="mt-3 rounded-2xl bg-[#fff4ec] px-4 py-3 text-sm text-[#9a3412]" role="alert">
          <p className="font-medium">
            {rowProblems.length} {rowProblems.length === 1 ? "row" : "rows"} could not be read.
          </p>
          <ul className="mt-2 space-y-1">
            {rowProblems.map((problem, index) => (
              <li key={`${index}-${problem}`}>{problem}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
