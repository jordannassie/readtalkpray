export const REVIEW_CHECKS = [
  "contacted",
  "phoneConversation",
  "attended",
  "faithCommitments",
  "locationReviewed",
  "locationApproved",
] as const;

export type ReviewChecklist = Record<(typeof REVIEW_CHECKS)[number], boolean>;

export function checklistComplete(value: unknown): value is ReviewChecklist {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return REVIEW_CHECKS.every((key) => record[key] === true);
}
