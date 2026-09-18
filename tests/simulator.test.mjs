import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULTS,
  reset,
  change,
  apparentHeight,
  sizeRatio,
  fieldOfView,
  project,
  saveComparison,
} from "../src/lib/simulator/model.ts";
import { scene } from "../src/lib/simulator/render.ts";
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
test("fixed-position focal changes preserve relative projected heights while changing field of view", () => {
  for (const distance of [3, 10, 50, 300]) {
    const initial = { ...reset(), distance };
    for (const focal of [24, 35, 70, 200]) {
      const { settings } = change(initial, "focal", focal);
      close(sizeRatio(initial), sizeRatio(settings));
      assert.equal(settings.distance, distance);
      close(
        apparentHeight(settings, "tree") / apparentHeight(initial, "tree"),
        focal / initial.focal,
      );
    }
  }
  assert.ok(
    fieldOfView({ ...reset(), focal: 24 }) >
      fieldOfView({ ...reset(), focal: 200 }),
  );
});
test("moving closer increases foreground dominance", () => {
  assert.ok(sizeRatio({ ...reset(), distance: 3 }) > sizeRatio(reset()));
  assert.ok(sizeRatio(reset()) > sizeRatio({ ...reset(), distance: 50 }));
});
test("matching changes camera distance and preserves subject height", () => {
  const initial = { ...reset(), matching: true };
  const zoomed = change(initial, "focal", 70).settings;
  assert.equal(zoomed.distance, 20);
  close(apparentHeight(zoomed, "rock"), apparentHeight(initial, "rock"));
  assert.ok(sizeRatio(zoomed) < sizeRatio(initial));
  const back = change(zoomed, "focal", 35).settings;
  close(back.distance, 10);
  const manual = change(zoomed, "distance", 30).settings;
  const reframed = change(manual, "focal", 35).settings;
  close(reframed.distance, 15);
  close(apparentHeight(manual, "rock"), apparentHeight(reframed, "rock"));
});
test("travel bounds and invalid inputs remain finite and safe", () => {
  const low = change(
    { ...reset(), distance: 3, focal: 200, matching: true },
    "focal",
    24,
  );
  assert.equal(low.settings.distance, 3);
  assert.ok(low.limited);
  const high = change(
    { ...reset(), distance: 300, focal: 24, matching: true },
    "focal",
    200,
  );
  assert.equal(high.settings.distance, 300);
  assert.ok(high.limited);
  for (const value of [NaN, Infinity, -Infinity])
    assert.deepEqual(change(reset(), "distance", value).settings, reset());
  assert.equal(change(reset(), "height", 100).settings.height, 5);
  for (const distance of [3, 300])
    for (const focal of [24, 200])
      for (const height of [0.3, 5])
        for (const lateral of [-6, 6])
          assert.doesNotMatch(
            scene({ ...reset(), distance, focal, height, lateral }),
            /NaN|Infinity/,
          );
});
test("height shifts ground relative to a level horizon; lateral movement produces parallax", () => {
  const initial = reset(),
    raised = { ...initial, height: 4 };
  assert.ok(project(raised, 0, 0, 0).y > project(initial, 0, 0, 0).y);
  close(apparentHeight(initial, "rock"), apparentHeight(raised, "rock"));
  assert.match(scene(raised), /M0 300H900/);
  const moved = { ...initial, lateral: 1 };
  const nearShift = Math.abs(
    project(moved, 0, 0, 0).x - project(initial, 0, 0, 0).x,
  );
  const farShift = Math.abs(
    project(moved, 0, 0, 180).x - project(initial, 0, 0, 180).x,
  );
  assert.ok(nearShift > farShift);
});
test("reset restores defaults and snapshots remain independent", () => {
  const current = { ...reset(), focal: 70, matching: true };
  let saved = saveComparison({ A: null, B: null }, "A", current);
  current.focal = 100;
  saved = saveComparison(saved, "B", current);
  current.distance = 20;
  assert.equal(saved.A.focal, 70);
  assert.equal(saved.B.focal, 100);
  assert.equal(saved.A.distance, 10);
  assert.equal(saved.B.distance, 10);
  assert.deepEqual(reset(), DEFAULTS);
  const fresh = reset();
  fresh.distance = 99;
  assert.equal(reset().distance, 10);
});
