export const MEETING_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

export const MEETING_DURATIONS = ["30 minutes", "45 minutes", "1 hour", "90 minutes", "2 hours"] as const;

export function displayMeetingTime(value: string) {
  const text = value.trim();
  const clock = /^(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm])?$/.exec(text);
  if (!clock) return text.slice(0, 40);
  let hour = Number(clock[1]);
  const minute = clock[2];
  if (!Number.isFinite(hour) || hour > 23) return text.slice(0, 40);
  const suffix = clock[3] ? clock[3].toUpperCase() : hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${suffix}`;
}
