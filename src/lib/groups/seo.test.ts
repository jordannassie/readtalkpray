import assert from "node:assert/strict";
import test from "node:test";
import { groupJsonLd, groupSeoDescription, groupSeoTitle } from "./seo";
import type { PublicGroup } from "./types";

function group(overrides: Partial<PublicGroup> = {}): PublicGroup {
  return {
    id: "group-1",
    name: "Dallas Bible Group",
    description: null,
    city: "Frisco",
    state: "Texas",
    country: "United States",
    location_type: "public_venue",
    public_location: "Omni Frisco Hotel at The Star",
    address: "5 Cowboys Way, Frisco, TX",
    latitude: 33.11,
    longitude: -96.82,
    meeting_day: "Sunday",
    meeting_time: "10:00 AM",
    leader_name: "Jordan Nassie",
    leader_photo_url: null,
    ...overrides,
  };
}

test("group titles target the city", () => {
  assert.equal(groupSeoTitle(group()), "Bible Group in Frisco, Texas | Dallas Bible Group");
  assert.equal(groupSeoTitle(group({ city: "", state: null })), "Dallas Bible Group | Bible Group");
});

test("group descriptions stay specific and short", () => {
  const description = groupSeoDescription(group());
  assert.match(description, /Frisco, Texas/);
  assert.match(description, /Jesus/);
  assert.ok(description.length <= 170);
  const custom = groupSeoDescription(group({ description: "A Sunday Bible group for people in Frisco who want to follow Jesus together." }));
  assert.match(custom, /Sunday Bible group/);
});

test("public venues can publish a street address and home groups cannot", () => {
  const publicGroup = groupJsonLd(group(), "https://readtalkpray.com/g/frisco-bible-group");
  assert.equal(publicGroup?.["@type"], "Church");
  assert.equal((publicGroup?.address as { streetAddress?: string }).streetAddress, "5 Cowboys Way, Frisco, TX");
  assert.ok(publicGroup?.geo);

  const home = groupJsonLd(group({ location_type: "home", address: "123 Private Lane", public_location: "Frisco, Texas" }), "https://readtalkpray.com/g/home");
  assert.equal((home?.address as { streetAddress?: string }).streetAddress, undefined);
  assert.equal(home?.geo, undefined);

  assert.equal(groupJsonLd(group({ is_demo: true }), "https://readtalkpray.com/groups/demo"), null);
});
