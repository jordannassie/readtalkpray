import assert from "node:assert/strict";
import test from "node:test";
import { applicationIssues } from "./application";

const ready = {
  leaderName: "Ada",
  groupName: "East Group",
  email: "ada@example.com",
  city: "Nashville",
  country: "USA",
  meetingLocation: "Neighborhood",
  attended: true,
  faithAgreed: true,
  commitmentsAgreed: true,
  zoomAgreed: true,
  privacyAgreed: true,
};

test("accepts a complete application", () => {
  assert.equal(applicationIssues(ready), null);
});

test("requires the faith and commitment agreement", () => {
  assert.equal(applicationIssues({ ...ready, attended: false, zoomAgreed: false, privacyAgreed: false }), null);
  assert.match(applicationIssues({ ...ready, faithAgreed: false }) ?? "", /faith/);
  assert.match(applicationIssues({ ...ready, groupName: "" }) ?? "", /group name/);
});
