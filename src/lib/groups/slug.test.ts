import assert from "node:assert/strict";
import test from "node:test";
import { groupMarketingUrl, groupPublicPath } from "./slug";

test("marketing links use the canonical public group URL", () => {
  assert.equal(groupPublicPath({ id: "d5e19dcb-3c6b-4cce-8077-d3b32f82af86", slug: "frisco-bible-group" }), "/g/frisco-bible-group");
  assert.equal(
    groupMarketingUrl({ id: "d5e19dcb-3c6b-4cce-8077-d3b32f82af86", slug: "frisco-bible-group" }),
    "https://readtalkpray.com/g/frisco-bible-group",
  );
  assert.equal(groupMarketingUrl({ id: "abc", slug: null }), "https://readtalkpray.com/groups/abc");
});
