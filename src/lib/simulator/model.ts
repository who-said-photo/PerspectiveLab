export interface Settings {
  distance: number;
  focal: number;
  height: number;
  lateral: number;
  matching: boolean;
  tilt?: number;
}
export type Control = "distance" | "focal" | "height" | "lateral";
export const LIMITS = {
  distance: { min: 3, max: 300, step: 0.1 },
  focal: { min: 24, max: 200, step: 1 },
  height: { min: 0.3, max: 5, step: 0.1 },
  lateral: { min: -6, max: 6, step: 0.1 },
};
export const DEFAULTS: Readonly<Settings> = Object.freeze({
  distance: 10,
  focal: 35,
  height: 1.6,
  lateral: 0,
  matching: false,
});
export const reset = (): Settings => ({ ...DEFAULTS });
export const FRAME = {
  width: 900,
  height: 600,
  sensorWidth: 36,
  sensorHeight: 24,
};
export const OBJECTS = {
  rock: { x: -1.4, z: 0, height: 1.5 },
  tree: { x: 3, z: 18, height: 7 },
  mountain: { x: -9, z: 180, height: 45 },
};
// Ideal rectilinear pinhole camera. World dimensions are metres; focal and
// sensor dimensions are mm. Camera faces +Z with zero yaw/roll/tilt, located
// at (lateral, height, -distance). Objects are upright constant-Z polygons.
// Nearest plane is always >= 3 m away, so none crosses the camera.
export function project(s: Settings, x: number, y: number, z: number) {
  const depth = z + s.distance;
  if (depth <= 0) throw new RangeError("Scene point is behind the camera.");
  // Optional downward pitch for the horizon challenge. Rotate world points
  // into camera coordinates before the same perspective division. Zero tilt
  // preserves the original simulator exactly. Challenge pitch stays ±12°.
  const pitch = ((s.tilt ?? 0) * Math.PI) / 180;
  const vertical = y - s.height;
  const cameraDepth = depth * Math.cos(pitch) - vertical * Math.sin(pitch);
  if (cameraDepth <= 0)
    throw new RangeError("Scene point is behind the camera.");
  const cameraY = vertical * Math.cos(pitch) + depth * Math.sin(pitch);
  const scale = (FRAME.width * s.focal) / FRAME.sensorWidth / cameraDepth;
  return {
    x: FRAME.width / 2 + (x - s.lateral) * scale,
    y: FRAME.height / 2 - cameraY * scale,
  };
}
export function apparentHeight(s: Settings, object: keyof typeof OBJECTS) {
  const item = OBJECTS[object];
  return Math.abs(
    project(s, item.x, 0, item.z).y - project(s, item.x, item.height, item.z).y,
  );
}
export function horizonY(s: Settings) {
  return (
    FRAME.height / 2 -
    ((FRAME.height * s.focal) / FRAME.sensorHeight) *
      Math.tan(((s.tilt ?? 0) * Math.PI) / 180)
  );
}
export function sizeRatio(s: Settings) {
  return apparentHeight(s, "rock") / apparentHeight(s, "mountain");
}
export function fieldOfView(s: Settings) {
  return (2 * Math.atan(FRAME.sensorWidth / (2 * s.focal)) * 180) / Math.PI;
}
export function change(
  s: Settings,
  key: Control,
  value: number,
): { settings: Settings; limited: boolean } {
  if (!Number.isFinite(value)) return { settings: { ...s }, limited: true };
  const range = LIMITS[key];
  const next = { ...s, [key]: Math.max(range.min, Math.min(range.max, value)) };
  let limited = next[key] !== value;
  if (key === "focal" && s.matching) {
    // Rock at z=0: preserve f / distance until a travel bound. Manual distance
    // edits establish a new reference for subsequent focal-length changes.
    const wanted = (s.distance * next.focal) / s.focal;
    next.distance = Math.max(
      LIMITS.distance.min,
      Math.min(LIMITS.distance.max, wanted),
    );
    limited ||= wanted !== next.distance;
  }
  return { settings: next, limited };
}
export type Comparisons = { A: Settings | null; B: Settings | null };
export function saveComparison(
  saved: Comparisons,
  slot: "A" | "B",
  settings: Settings,
): Comparisons {
  return { ...saved, [slot]: { ...settings } };
}
