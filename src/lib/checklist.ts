import { createClient } from "@/lib/supabase/server";

export const CHECKLIST_COUNT = 6;

export function emptyChecklist() {
  return Array.from({ length: CHECKLIST_COUNT }, () => false);
}

export function checklistToMask(steps: boolean[]) {
  return steps.reduce((mask, done, index) => (done ? mask | (1 << index) : mask), 0);
}

export function checklistFromMask(value: unknown) {
  const mask = typeof value === "number" && Number.isInteger(value) ? value : 0;
  if (mask < 0 || mask > 63) return emptyChecklist();
  return Array.from({ length: CHECKLIST_COUNT }, (_, index) => (mask & (1 << index)) !== 0);
}

export function parseChecklist(value: unknown) {
  if (!Array.isArray(value) || value.length !== CHECKLIST_COUNT || value.some((item) => typeof item !== "boolean")) return null;
  return value;
}

export async function loadChecklist() {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return emptyChecklist();
    const { data, error } = await supabase.from("rtp_checklist").select("steps").eq("user_id", auth.user.id).maybeSingle();
    if (error || !data) return emptyChecklist();
    return checklistFromMask(data.steps);
  } catch {
    return emptyChecklist();
  }
}
