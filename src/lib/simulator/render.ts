import { project, FRAME, horizonY } from "./model.ts";
import type { Settings } from "./model.ts";
// Original diagram geometry. All polygons use the same projection, including
// mountain snow and tree details. SVG clips objects without rescaling them.
export function scene(s: Settings) {
  const horizon = horizonY(s);
  const groundTop = Math.max(0, Math.min(FRAME.height, horizon));
  const polygon = (points: number[][], z: number, colour: string) =>
    `<polygon points="${points
      .map(([x, y]) => {
        const p = project(s, x, y, z);
        return `${p.x.toFixed(3)},${p.y.toFixed(3)}`;
      })
      .join(" ")}" fill="${colour}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${FRAME.width} ${FRAME.height}" role="img" aria-label="Perspective landscape: a foreground rock, a middle-ground tree and a distant mountain. ${(s.tilt ?? 0) === 0 ? "The horizon stays centred with a level camera." : "Camera tilt changes the horizon position."}">
  <rect width="900" height="600" fill="#dce9e7"/><rect y="${groundTop}" width="900" height="${FRAME.height - groundTop}" fill="#b2bd92"/>
  <path d="M0 ${horizon}H900" stroke="#61786f" stroke-dasharray="9 7"/>
  ${polygon(
    [
      [-66, 0],
      [-40, 24],
      [-27, 15],
      [-9, 45],
      [8, 21],
      [20, 29],
      [48, 0],
    ],
    180,
    "#718b8c",
  )}
  ${polygon(
    [
      [-9, 45],
      [8, 21],
      [-1, 25],
      [-7, 22],
      [-16, 29],
      [-23, 25],
    ],
    180,
    "#f2f3e9",
  )}
  ${polygon(
    [
      [-9, 45],
      [-6, 0],
      [48, 0],
      [20, 29],
      [8, 21],
    ],
    180,
    "#506d70",
  )}
  ${polygon(
    [
      [-9, 45],
      [-7, 22],
      [-1, 25],
      [8, 21],
    ],
    180,
    "#d1dfda",
  )}
  ${polygon(
    [
      [2.7, 0],
      [3.3, 0],
      [3.3, 5],
      [2.7, 5],
    ],
    18,
    "#665338",
  )}
  ${polygon(
    [
      [0, 2],
      [1.2, 3.8],
      [0.6, 3.8],
      [2, 5.4],
      [1.5, 5.4],
      [3, 7],
      [4.5, 5.4],
      [4, 5.4],
      [5.4, 3.8],
      [4.8, 3.8],
      [6, 2],
    ],
    18,
    "#345d4c",
  )}
  ${polygon(
    [
      [3, 7],
      [4.5, 5.4],
      [4, 5.4],
      [5.4, 3.8],
      [4.8, 3.8],
      [6, 2],
      [3, 2],
    ],
    18,
    "#244b43",
  )}
  ${polygon(
    [
      [-2.65, 0],
      [-2.5, 0.8],
      [-1.9, 1.5],
      [-0.7, 1.25],
      [-0.15, 0.35],
      [-0.35, 0],
    ],
    0,
    "#847e6d",
  )}
  ${polygon(
    [
      [-2.5, 0.8],
      [-1.9, 1.5],
      [-0.7, 1.25],
      [-1.2, 0.6],
    ],
    0,
    "#b5ad96",
  )}
  ${polygon(
    [
      [-1.2, 0.6],
      [-0.7, 1.25],
      [-0.15, 0.35],
      [-0.35, 0],
      [-1.5, 0],
    ],
    0,
    "#696a5c",
  )}
  <path d="M18 45V18H45M855 18H882V45M18 555V582H45M855 582H882V555" fill="none" stroke="#fff" stroke-width="3"/>
  </svg>`;
}
