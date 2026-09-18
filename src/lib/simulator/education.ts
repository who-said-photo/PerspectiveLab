import { fieldOfView, sizeRatio } from "./model.ts";
import type { Settings, Control } from "./model.ts";
export function describeChange(
  before: Settings,
  after: Settings,
  key: Control,
  limited: boolean,
) {
  let text = "";
  if (key === "focal") {
    text =
      after.matching && after.distance !== before.distance
        ? `You moved ${after.distance > before.distance ? "farther away" : "closer"} to ${limited ? "try to maintain" : "maintain"} the rock’s size. That movement changed the perspective.`
        : "Changing focal length without moving changes the framing, not the perspective.";
  } else if (key === "distance") {
    text =
      after.distance < before.distance
        ? "Moving closer makes the foreground rock appear larger relative to the mountain."
        : "Moving farther away reduces the rock’s size relative to the mountain.";
    if (after.matching)
      text +=
        " This distance sets a new reference for the next focal-length change.";
  } else if (key === "height") {
    text =
      "Changing camera height moves the ground and objects relative to the horizon. The level camera keeps the horizon centred; focal length did not cause this change.";
  } else {
    text =
      "Moving sideways changes overlap. Nearby objects shift across the frame more than distant ones.";
  }
  if (after[key] === before[key] && after.distance === before.distance)
    text = "The camera settings have not changed.";
  if (limited) {
    text += " A control limit was reached.";
    if (key === "focal" && after.matching)
      text +=
        " At a camera travel limit, the rock’s size cannot be fully maintained.";
  }
  return text;
}
export function summary(s: Settings) {
  return `${s.focal.toFixed(0)} mm · ${s.distance.toFixed(2)} m to rock plane · height ${s.height.toFixed(1)} m · sideways ${s.lateral.toFixed(1)} m · ${s.matching ? "Matching subject size" : "Fixed camera position"}`;
}
export function metrics(s: Settings) {
  return `Horizontal field of view: ${fieldOfView(s).toFixed(1)}°. Rock-to-mountain projected height ratio: ${sizeRatio(s).toFixed(3)}. Ratio uses full object heights, even when cropped.`;
}
