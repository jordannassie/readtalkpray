export const LAUNCH_TIME_ZONE = "America/Chicago";
export const STANDARD_DAY = "Sunday";
export const STANDARD_TIME = "9:00–10:00 AM";
const START_MINUTES = 9 * 60;
const END_MINUTES = 10 * 60;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: (typeof WEEKDAYS)[number];
};

export type SundayMeeting =
  | { phase: "countdown"; target: Date }
  | { phase: "live"; endsAt: Date };

export function isIanaTimeZone(value: string) {
  if (!value || value.length > 80) return false;
  try {
    Intl.DateTimeFormat("en-US", { timeZone: value }).format(0);
    return true;
  } catch {
    return false;
  }
}

export function zonedParts(date: Date, timeZone: string): ZonedParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  const read = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const weekday = read("weekday").replace(".", "") as ZonedParts["weekday"];
  let hour = Number(read("hour"));
  if (hour === 24) hour = 0;
  return {
    year: Number(read("year")),
    month: Number(read("month")),
    day: Number(read("day")),
    hour,
    minute: Number(read("minute")),
    weekday: WEEKDAYS.includes(weekday) ? weekday : "Sun",
  };
}

function zoneOffsetMs(instant: Date, timeZone: string) {
  const parts = zonedParts(instant, timeZone);
  const wall = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
  return wall - instant.getTime();
}

export function zonedDateTime(year: number, month: number, day: number, hour: number, minute: number, timeZone: string) {
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  let utc = wall;
  for (let pass = 0; pass < 3; pass += 1) {
    utc = wall - zoneOffsetMs(new Date(utc), timeZone);
  }
  return new Date(utc);
}

export function nextSundayMeeting(now: Date, timeZone = LAUNCH_TIME_ZONE): SundayMeeting {
  const zone = isIanaTimeZone(timeZone) ? timeZone : LAUNCH_TIME_ZONE;
  const parts = zonedParts(now, zone);
  const weekday = WEEKDAYS.indexOf(parts.weekday);
  const minutes = parts.hour * 60 + parts.minute;

  if (weekday === 0 && minutes >= START_MINUTES && minutes < END_MINUTES) {
    return { phase: "live", endsAt: zonedDateTime(parts.year, parts.month, parts.day, 10, 0, zone) };
  }

  let addDays = (7 - weekday) % 7;
  if (weekday === 0 && minutes >= END_MINUTES) addDays = 7;
  const cursor = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + addDays));
  return {
    phase: "countdown",
    target: zonedDateTime(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, cursor.getUTCDate(), 9, 0, zone),
  };
}

export function countdownParts(target: Date, now: Date) {
  const total = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}
