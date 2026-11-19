import assert from "node:assert/strict";
import test from "node:test";
import {
  estimatedClicks,
  formatGiftAmount,
  giveButtonLabel,
  impactSummary,
  isValidGiftCents,
  parseGiftCents,
} from "./donation";

test("estimated clicks use a $5 planning cost and round down", () => {
  assert.equal(estimatedClicks(2500), 5);
  assert.equal(estimatedClicks(5000), 10);
  assert.equal(estimatedClicks(10000), 20);
  assert.equal(estimatedClicks(25000), 50);
  assert.equal(estimatedClicks(50000), 100);
  assert.equal(estimatedClicks(100000), 200);
  assert.equal(estimatedClicks(999), 1);
  assert.equal(estimatedClicks(499), 0);
});

test("gift amounts stay in integer cents", () => {
  assert.equal(parseGiftCents("100"), 10000);
  assert.equal(parseGiftCents("$1,000"), 100000);
  assert.equal(parseGiftCents("25.50"), 2550);
  assert.equal(parseGiftCents("25.5"), 2550);
  assert.equal(parseGiftCents("100."), 10000);
  assert.equal(parseGiftCents("25.555"), null);
  assert.equal(parseGiftCents(""), null);
  assert.equal(parseGiftCents("abc"), null);
  assert.equal(isValidGiftCents(500), true);
  assert.equal(isValidGiftCents(499), false);
  assert.equal(formatGiftAmount(10000), "$100");
  assert.equal(formatGiftAmount(2550), "$25.50");
});

test("impact copy describes clicks to pages and keeps monthly gifts monthly", () => {
  assert.equal(
    impactSummary(10000, "once"),
    "Your $100 gift could help bring approximately 20 visitors to local Bible Group pages.",
  );
  const monthly = impactSummary(10000, "monthly");
  assert.match(monthly, /monthly gift/);
  assert.match(monthly, /each month/);
  assert.doesNotMatch(monthly, /year|annual/i);
  assert.equal(giveButtonLabel(10000, "once"), "Give $100");
  assert.equal(giveButtonLabel(10000, "monthly"), "Give $100 Monthly");
});
