export function formatTimeRange(start: string, end: string) {
  return `${start.replace(/\s?(AM|PM)/i, "")}–${end}`;
}
