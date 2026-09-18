import {
  reset,
  project,
  sizeRatio,
  apparentHeight,
  horizonY,
} from "../simulator/model.ts";
import type { Settings, Control } from "../simulator/model.ts";
export type ChallengeControl = Control | "tilt";
export interface Challenge {
  id: string;
  title: string;
  objective: string;
  controls: ChallengeControl[];
  initial: Settings;
  solution: Settings;
  advice: string;
  tradeoff: string;
  lesson: string;
  lessonTitle: string;
}
export const challenges: Challenge[] = [
  {
    id: "foreground",
    title: "Foreground Power",
    objective:
      "Make the rock at least 40% larger relative to the mountain than in the starting view, while keeping the rock in the frame.",
    controls: ["distance"],
    initial: reset(),
    solution: { ...reset(), distance: 6 },
    advice:
      "Move closer: try a distance of 6 m. The short distance to the rock changes proportionally more than the distance to the mountain.",
    tradeoff:
      "A strong foreground can obscure other layers. More foreground emphasis is a choice, not a universal improvement.",
    lesson: "/camera-distance-perspective/",
    lessonTitle: "Camera distance and perspective",
  },
  {
    id: "mountain",
    title: "Mountain Presence",
    objective:
      "Reduce the rock-to-mountain height ratio by at least 30%. Step back and use a longer focal length while keeping the mountain summit visible and the rock large enough to read.",
    controls: ["distance", "focal"],
    initial: reset(),
    solution: { ...reset(), distance: 20, focal: 50 },
    advice:
      "Try 20 m and 50 mm. Moving back changes the size relationship; the longer focal length restores useful framing.",
    tradeoff:
      "A longer lens can crop the mountain summit. Balance background prominence against the amount of scene you include.",
    lesson: "/focal-length-vs-perspective/",
    lessonTitle: "Focal length vs perspective",
  },
  {
    id: "forest",
    title: "Forest Separation",
    objective:
      "Move sideways until the tree crown clears the mountain summit horizontally, with a visible gap. Keep both features in the frame.",
    controls: ["lateral"],
    initial: { ...reset(), lateral: 4.5 },
    solution: reset(),
    advice:
      "Move left from the starting position: try 0 m sideways. The nearer tree shifts across the frame more than the distant summit.",
    tradeoff:
      "Separating one overlap can introduce another. This landscape exercise uses a tree and mountain as the overlapping elements.",
    lesson: "/landscape-perspective/",
    lessonTitle: "Landscape perspective",
  },
  {
    id: "depth",
    title: "Stronger Depth",
    objective:
      "Make the rock-to-mountain height ratio at least 0.70 and leave a visible horizontal gap between rock and tree. Keep the rock, tree and summit in the frame.",
    controls: ["distance", "lateral", "height"],
    initial: { ...reset(), distance: 18, lateral: -3 },
    solution: { ...reset(), distance: 8 },
    advice:
      "Try 8 m distance, 0 m sideways and 1.6 m height. Closer distance strengthens the foreground; a sideways adjustment separates the rock and tree.",
    tradeoff:
      "This exercise checks clear layers, not artistic quality. Overlap can also be useful when it supports your composition.",
    lesson: "/landscape-perspective/",
    lessonTitle: "Landscape perspective",
  },
  {
    id: "horizon",
    title: "Horizon Control",
    objective:
      "Raise the camera to at least 2 m, then tilt down to place the horizon between 20% and 40% from the top of the frame. This gives more of the frame to ground than sky.",
    controls: ["height", "tilt"],
    initial: { ...reset(), tilt: 0 },
    solution: { ...reset(), height: 2.5, tilt: 6 },
    advice:
      "Try a height of 2.5 m and a downward tilt of 6°. Height changes foreground relationships; tilt moves the horizon within the frame.",
    tradeoff:
      "Tilting down can crop the mountain and show more ground. Height alone does not shift the horizon in a level camera.",
    lesson: "/landscape-perspective/",
    lessonTitle: "Landscape perspective",
  },
];
const inFrame = (p: { x: number; y: number }) =>
  p.x >= 12 && p.x <= 888 && p.y >= 12 && p.y <= 588;
const rockVisible = (s: Settings) =>
  [
    [-2.65, 0],
    [-1.9, 1.5],
    [-0.15, 0.35],
  ].every(([x, y]) => inFrame(project(s, x, y, 0)));
const summitVisible = (s: Settings) => inFrame(project(s, -9, 45, 180));
const treeVisible = (s: Settings) =>
  [
    [0, 2],
    [6, 2],
    [3, 7],
    [3, 0],
  ].every(([x, y]) => inFrame(project(s, x, y, 18)));
export function checkChallenge(id: string, s: Settings) {
  const base = sizeRatio(reset());
  let passed = false;
  let measurement = "";
  if (id === "foreground") {
    passed = sizeRatio(s) >= base * 1.4 && rockVisible(s);
    measurement = `Rock-to-mountain ratio: ${sizeRatio(s).toFixed(3)}; target at least ${(base * 1.4).toFixed(3)} with the rock visible.`;
  }
  if (id === "mountain") {
    passed =
      s.distance > 10 &&
      s.focal > 35 &&
      sizeRatio(s) <= base * 0.7 &&
      apparentHeight(s, "rock") >= 70 &&
      rockVisible(s) &&
      summitVisible(s);
    measurement = `Rock-to-mountain ratio: ${sizeRatio(s).toFixed(3)}; target at most ${(base * 0.7).toFixed(3)}. Step back, lengthen the focal length and keep the summit and rock visible.`;
  }
  if (id === "forest") {
    const peak = project(s, -9, 45, 180).x;
    const left = project(s, 0, 2, 18).x;
    const right = project(s, 6, 2, 18).x;
    const gap = Math.max(left - peak, peak - right);
    passed = gap >= 20 && treeVisible(s) && summitVisible(s);
    measurement = `Tree-crown to summit horizontal gap: ${gap.toFixed(0)} drawing units; target at least 20. Negative values mean overlap.`;
  }
  if (id === "depth") {
    const gap = project(s, 0, 2, 18).x - project(s, -0.15, 0.35, 0).x;
    passed =
      sizeRatio(s) >= 0.7 &&
      gap >= 10 &&
      rockVisible(s) &&
      treeVisible(s) &&
      summitVisible(s);
    measurement = `Rock-to-mountain ratio: ${sizeRatio(s).toFixed(3)} (target 0.70). Rock-to-tree horizontal gap: ${gap.toFixed(0)} drawing units (target 10). All three layers must remain visible.`;
  }
  if (id === "horizon") {
    const horizon = horizonY(s) / 600;
    passed = s.height >= 2 && horizon >= 0.2 && horizon <= 0.4;
    measurement = `Height: ${s.height.toFixed(1)} m. Horizon: ${(horizon * 100).toFixed(1)}% from the top; target 20–40% with height at least 2 m.`;
  }
  return {
    passed,
    text: `${passed ? "Objective met." : "Keep exploring."} ${measurement}`,
  };
}
