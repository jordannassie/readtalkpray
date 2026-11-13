import assert from "node:assert/strict";
import test from "node:test";
import { displayMeetingTime } from "./schedule";

test("formats a time input for group cards", () => {
  assert.equal(displayMeetingTime("09:00"), "9:00 AM");
  assert.equal(displayMeetingTime("19:00"), "7:00 PM");
  assert.equal(displayMeetingTime("10:30"), "10:30 AM");
  assert.equal(displayMeetingTime("00:00"), "12:00 AM");
  assert.equal(displayMeetingTime("12:00"), "12:00 PM");
  assert.equal(displayMeetingTime("7:00 PM"), "7:00 PM");
});
