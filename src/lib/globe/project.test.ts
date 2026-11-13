import assert from "node:assert/strict";
import test from "node:test";
import landDots from "./land-dots.json" with { type: "json" };
import { createGlobeProjection, orientGlobe, projectOnGlobe } from "./project";

const places = {
  london: [-0.1278, 51.5074],
  nashville: [-86.7816, 36.1627],
  newYork: [-74.006, 40.7128],
  saoPaulo: [-46.633, -23.55],
  nairobi: [36.8219, -1.2921],
  sydney: [151.2093, -33.8688],
  tokyo: [139.6503, 35.6762],
} as const;

function place(name: keyof typeof places, spin = 0) {
  const projection = orientGlobe(createGlobeProjection(), 0, 0, 100, spin);
  const [lon, lat] = places[name];
  return projectOnGlobe(projection, spin, lon, lat);
}

test("known cities land on the center of the globe when it faces them", () => {
  for (const [lon, lat] of Object.values(places)) {
    const projection = createGlobeProjection().translate([0, 0]).scale(100).rotate([-lon, -lat]);
    const point = projection([lon, lat]);
    assert.ok(point);
    assert.ok(Math.hypot(point[0], point[1]) < 0.5, `${lon},${lat} -> ${point}`);
  }
});

test("London, Nashville, New York, São Paulo, and Nairobi keep their real directions", () => {
  const spin = 30;
  const london = place("london", spin);
  const nashville = place("nashville", spin);
  const newYork = place("newYork", spin);
  const saoPaulo = place("saoPaulo", spin);
  const nairobi = place("nairobi", spin);
  assert.ok(london && nashville && newYork && saoPaulo && nairobi);
  assert.ok(london[1] < 0);
  assert.ok(nashville[0] < newYork[0]);
  assert.ok(newYork[0] < london[0]);
  assert.ok(saoPaulo[1] > london[1]);
  assert.ok(nairobi[0] > london[0]);
});

test("Sydney and Tokyo stay hidden on the far side", () => {
  assert.equal(place("sydney"), null);
  assert.equal(place("tokyo"), null);
});

test("continent dots follow real land and leave the ocean empty", () => {
  const near = (lon: number, lat: number) => landDots.some(([dotLon, dotLat]) => Math.hypot(dotLon - lon, dotLat - lat) < 2.4);
  assert.equal(near(-0.13, 51.5), true);
  assert.equal(near(-86.8, 36.2), true);
  assert.equal(near(-74, 40.7), true);
  assert.equal(near(-46.6, -23.6), true);
  assert.equal(near(36.8, -1.3), true);
  assert.equal(near(151.2, -33.9), true);
  assert.equal(near(139.7, 35.7), true);
  assert.equal(near(0, 0), false);
  assert.equal(landDots.some(([, lat]) => lat < -75), true);
});
