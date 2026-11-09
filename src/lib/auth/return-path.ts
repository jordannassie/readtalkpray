const LEAD_PATHS = new Set(["/csv", "/dashboard/leads", "/admin", "/leader"]);

export function safeLeadsReturnPath(value: string | null) {
  if (!value || !LEAD_PATHS.has(value)) return null;
  return value;
}
