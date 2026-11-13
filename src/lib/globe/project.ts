import { geoDistance, geoOrthographic, type GeoProjection } from "d3-geo";

const FRONT = Math.PI / 2 - 0.05;
const LIMB = Math.sin(0.05);

export function frontAxis(spinDegrees: number): [number, number, number] {
  const [lon] = viewCenter(spinDegrees);
  const lambda = (lon * Math.PI) / 180;
  return [Math.cos(lambda), 0, Math.sin(lambda)];
}

export function isFacing(axis: readonly [number, number, number], x: number, y: number, z: number) {
  return axis[0] * x + axis[1] * y + axis[2] * z > LIMB;
}

export function createGlobeProjection() {
  return geoOrthographic().precision(0.5);
}

export function orientGlobe(projection: GeoProjection, cx: number, cy: number, radius: number, spinDegrees: number) {
  const spin = ((spinDegrees % 360) + 360) % 360;
  return projection.translate([cx, cy]).scale(radius).rotate([spin, 0]);
}

export function viewCenter(spinDegrees: number): [number, number] {
  const spin = ((spinDegrees % 360) + 360) % 360;
  return [spin > 180 ? 360 - spin : -spin, 0];
}

export function isOnFront(spinDegrees: number, lon: number, lat: number) {
  return geoDistance(viewCenter(spinDegrees), [lon, lat]) < FRONT;
}

export function projectOnGlobe(
  projection: GeoProjection,
  spinDegrees: number,
  lon: number,
  lat: number,
): [number, number] | null {
  if (!isOnFront(spinDegrees, lon, lat)) return null;
  const point = projection([lon, lat]);
  if (!point) return null;
  return [point[0], point[1]];
}
