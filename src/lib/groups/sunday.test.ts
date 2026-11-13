import assert from "node:assert/strict";
import test from "node:test";
import { countdownParts, nextSundayMeeting, zonedDateTime, zonedParts } from "./sunday";

function at(year: number, month: number, day: number, hour: number, minute: number, timeZone: string) {
  return zonedDateTime(year, month, day, hour, minute, timeZone);
}

test("Saturday night counts down to Sunday 9:00 AM Chicago", () => {
  const now = at(2026, 11, 7, 23, 30, "America/Chicago");
  const meeting = nextSundayMeeting(now, "America/Chicago");
  assert.equal(meeting.phase, "countdown");
  if (meeting.phase !== "countdown") return;
  const parts = zonedParts(meeting.target, "America/Chicago");
  assert.deepEqual(
    { weekday: parts.weekday, month: parts.month, day: parts.day, hour: parts.hour, minute: parts.minute },
    { weekday: "Sun", month: 11, day: 8, hour: 9, minute: 0 },
  );
  const left = countdownParts(meeting.target, now);
  assert.equal(left.days, 0);
  assert.ok(left.hours >= 9 && left.hours <= 10);
});

test("Sunday 8:59 AM is still counting down", () => {
  const now = at(2026, 11, 8, 8, 59, "America/Chicago");
  const meeting = nextSundayMeeting(now, "America/Chicago");
  assert.equal(meeting.phase, "countdown");
  if (meeting.phase !== "countdown") return;
  const left = countdownParts(meeting.target, now);
  assert.equal(left.days, 0);
  assert.equal(left.hours, 0);
  assert.equal(left.minutes, 1);
});

test("Sunday 9:00 AM through 9:59 AM is the live meeting", () => {
  for (const minute of [0, 30, 59]) {
    const meeting = nextSundayMeeting(at(2026, 11, 8, 9, minute, "America/Chicago"), "America/Chicago");
    assert.equal(meeting.phase, "live");
  }
});

test("Sunday 10:00 AM counts to the following Sunday", () => {
  const now = at(2026, 11, 8, 10, 0, "America/Chicago");
  const meeting = nextSundayMeeting(now, "America/Chicago");
  assert.equal(meeting.phase, "countdown");
  if (meeting.phase !== "countdown") return;
  const parts = zonedParts(meeting.target, "America/Chicago");
  assert.equal(parts.day, 15);
  assert.equal(parts.hour, 9);
  assert.equal(parts.weekday, "Sun");
});

test("spring-forward Saturday night still lands on Sunday 9:00 AM", () => {
  const now = at(2026, 3, 7, 21, 0, "America/Chicago");
  const meeting = nextSundayMeeting(now, "America/Chicago");
  assert.equal(meeting.phase, "countdown");
  if (meeting.phase !== "countdown") return;
  const parts = zonedParts(meeting.target, "America/Chicago");
  assert.deepEqual(
    { month: parts.month, day: parts.day, hour: parts.hour, weekday: parts.weekday },
    { month: 3, day: 8, hour: 9, weekday: "Sun" },
  );
  const elapsedHours = (meeting.target.getTime() - now.getTime()) / 3_600_000;
  assert.equal(elapsedHours, 11);
});

test("fall-back Sunday 9:30 AM is live in Chicago", () => {
  const meeting = nextSundayMeeting(at(2026, 11, 1, 9, 30, "America/Chicago"), "America/Chicago");
  assert.equal(meeting.phase, "live");
});

test("a London group uses London local time", () => {
  const now = at(2026, 6, 7, 8, 0, "Europe/London");
  assert.equal(zonedParts(now, "Europe/London").weekday, "Sun");
  const meeting = nextSundayMeeting(now, "Europe/London");
  assert.equal(meeting.phase, "countdown");
  if (meeting.phase !== "countdown") return;
  const parts = zonedParts(meeting.target, "Europe/London");
  assert.equal(parts.day, 7);
  assert.equal(parts.hour, 9);
  const chicago = zonedParts(meeting.target, "America/Chicago");
  assert.notEqual(chicago.hour, 9);
});
