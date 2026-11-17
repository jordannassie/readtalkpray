import assert from "node:assert/strict";
import test from "node:test";
import { groupMemberColors, groupMemberLabel } from "./member-colors";

test("group colors stay stable and distinct", () => {
  const frisco = groupMemberColors("d5e19dcb-3c6b-4cce-8077-d3b32f82af86");
  const south = groupMemberColors("demo-12-south");
  assert.deepEqual(frisco, groupMemberColors("d5e19dcb-3c6b-4cce-8077-d3b32f82af86"));
  assert.equal(new Set(frisco).size, 4);
  assert.equal(new Set(south).size, 4);
  assert.equal(frisco.every((color) => color.startsWith("linear-gradient(135deg,")), true);
  assert.notDeepEqual(frisco, south);
});

test("member labels use singular and plural", () => {
  assert.equal(groupMemberLabel(1), "1 Group Member");
  assert.equal(groupMemberLabel(12), "12 Group Members");
  assert.equal(groupMemberLabel(0), "0 Group Members");
});
