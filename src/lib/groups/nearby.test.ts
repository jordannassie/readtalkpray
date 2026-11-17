import assert from "node:assert/strict";
import test from "node:test";
import { formatMiles, groupsByDistance, nearLabel, widerRadius } from "./nearby";

const origin = { latitude: 36.16, longitude: -86.78 };

test("keeps groups inside the chosen radius and sorts the closest first", () => {
  const near = { id: "near", latitude: 36.17, longitude: -86.78 };
  const mid = { id: "mid", latitude: 36.25, longitude: -86.78 };
  const far = { id: "far", latitude: 36.5, longitude: -86.78 };
  const missing = { id: "missing", latitude: 0, longitude: 0 };
  const withinTen = groupsByDistance([far, missing, mid, near], origin, 10);
  assert.deepEqual(withinTen.map((item) => item.group.id), ["near", "mid"]);
  const withinTwentyFive = groupsByDistance([far, near], origin, 25);
  assert.deepEqual(withinTwentyFive.map((item) => item.group.id), ["near", "far"]);
});

test("distance labels stay approximate only for approximate groups", () => {
  assert.equal(formatMiles(1.609344, false), "1 mi");
  assert.equal(formatMiles(1.609344, true), "about 1 mi");
});

test("a nearby label uses a real city and does not invent one", () => {
  assert.equal(nearLabel("Franklin", "Tennessee"), "Near Franklin, TN");
  assert.equal(nearLabel("", ""), "");
  assert.equal(nearLabel("", "Kansas"), "");
});

test("widen search steps from 5 to 10 to 25 and then stops", () => {
  assert.equal(widerRadius(5), 10);
  assert.equal(widerRadius(10), 25);
  assert.equal(widerRadius(25), null);
});
