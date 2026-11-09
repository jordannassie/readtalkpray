import { accountBatch, toInsertRow } from "./csv";
import type { LeadCategory, ParsedLead } from "./types";

const BATCH_SIZE = 100;

type InsertRow = ReturnType<typeof toInsertRow>;

type UpsertResult = {
  data: { id: string }[] | null;
  error: { message: string } | null;
};

export type LeadWriter = {
  upsertLeads: (rows: InsertRow[]) => Promise<UpsertResult>;
};

export type ImportSummary = {
  added: number;
  fileDuplicates: number;
  existingDuplicates: number;
  invalid: number;
  failed: number;
  failedLeads: ParsedLead[];
  errors: string[];
};

export async function importLeads(
  writer: LeadWriter,
  leads: ParsedLead[],
  sourceFile: string,
  fileDuplicates: number,
  invalid: number,
  category: LeadCategory = "join",
): Promise<ImportSummary> {
  const summary: ImportSummary = {
    added: 0,
    fileDuplicates,
    existingDuplicates: 0,
    invalid,
    failed: 0,
    failedLeads: [],
    errors: [],
  };

  for (let index = 0; index < leads.length; index += BATCH_SIZE) {
    const slice = leads.slice(index, index + BATCH_SIZE);
    const rows = slice.map((lead) => toInsertRow(lead, sourceFile, category));
    let result: UpsertResult;
    try {
      result = await writer.upsertLeads(rows);
    } catch (error) {
      result = {
        data: null,
        error: { message: error instanceof Error ? error.message : "Import request failed." },
      };
    }

    const failed = Boolean(result.error);
    const counted = accountBatch(
      slice.length,
      failed ? null : (result.data?.length ?? 0),
      failed,
    );
    summary.added += counted.added;
    summary.existingDuplicates += counted.existing;
    summary.failed += counted.failed;
    if (failed) {
      summary.failedLeads.push(...slice);
      summary.errors.push(result.error?.message ?? "Import request failed.");
    }
  }

  return summary;
}

export function databaseFailureText(errors: string[]) {
  const reason = [...new Set(errors.map((error) => error.trim()).filter(Boolean))].join(" ");
  return reason ? `Import could not save. ${reason}` : "Import could not save.";
}

export function importSummaryText(
  summary: Pick<ImportSummary, "added" | "fileDuplicates" | "existingDuplicates" | "invalid">,
) {
  const duplicates = summary.fileDuplicates + summary.existingDuplicates;
  return `${summary.added} imported · ${duplicates} duplicates · ${summary.invalid} invalid`;
}
