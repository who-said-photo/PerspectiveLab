export const topics = {
  position: { label: "Camera position", href: "/how-perspective-works/" },
  focal: {
    label: "Focal length and field of view",
    href: "/focal-length-vs-perspective/",
  },
  scale: {
    label: "Foreground and background scale",
    href: "/camera-distance-perspective/",
  },
  height: { label: "Camera height", href: "/landscape-perspective/" },
  landscape: { label: "Landscape scenarios", href: "/landscape-perspective/" },
  misconception: {
    label: "Common misconceptions",
    href: "/focal-length-vs-perspective/",
  },
} as const;
export type Topic = keyof typeof topics;
export interface Question {
  id: string;
  topic: Topic;
  prompt: string;
  choices: { text: string; correct: boolean }[];
  explanation: string;
}
const question = (
  id: string,
  topic: Topic,
  prompt: string,
  choices: string[],
  correct: number,
  explanation: string,
): Question => ({
  id,
  topic,
  prompt,
  choices: choices.map((text, index) => ({ text, correct: index === correct })),
  explanation,
});
export const questions: Question[] = [
  question(
    "position-1",
    "position",
    "Which change directly alters the size relationships between near and far objects?",
    [
      "Changing shutter speed",
      "Moving the camera closer to the scene",
      "Changing white balance",
      "Cropping the same image",
    ],
    1,
    "Moving changes the distances between the camera and objects by different proportions. That changes their relative projected sizes.",
  ),
  question(
    "position-2",
    "position",
    "A tree overlaps a distant summit. Which action can change that overlap?",
    [
      "Increase ISO",
      "Change aperture only",
      "Move the camera sideways",
      "Enlarge the same photograph",
    ],
    2,
    "Sideways movement changes viewing angles. Nearby objects shift across the frame more than distant ones.",
  ),
  question(
    "position-3",
    "position",
    "You want to compare two focal lengths without changing viewpoint. What should you keep fixed?",
    [
      "The camera’s position and direction",
      "The subject’s size in the frame by walking",
      "Only the shutter speed",
      "Only the focus setting",
    ],
    0,
    "Keep the viewpoint and direction fixed to isolate field of view. Walking to match subject framing would introduce a perspective change.",
  ),
  question(
    "focal-1",
    "focal",
    "On the same sensor, what does a longer focal length do from a fixed position?",
    [
      "Shows a wider field of view",
      "Moves the camera closer",
      "Makes only distant objects larger",
      "Shows a narrower field of view",
    ],
    3,
    "A longer focal length narrows field of view for the same sensor size. It enlarges the projected scene without moving the viewpoint.",
  ),
  question(
    "focal-2",
    "focal",
    "You change from 35 mm to 70 mm without moving a level camera. In an ideal rectilinear model, what happens to the rock-to-mountain height ratio?",
    [
      "It doubles",
      "It stays the same",
      "It halves",
      "It depends only on aperture",
    ],
    1,
    "Both projected heights scale with focal length. Their ratio stays the same from the fixed camera position, even if an object is cropped.",
  ),
  question(
    "focal-3",
    "focal",
    "You like the perspective but want a tighter frame. What is a suitable first step?",
    [
      "Walk closer without changing the lens",
      "Lower the camera to the ground",
      "Use a longer focal length from the same position",
      "Move sideways behind the foreground",
    ],
    2,
    "A longer focal length narrows the frame while keeping the viewpoint. Camera movement would change the perspective relationships.",
  ),
  question(
    "scale-1",
    "scale",
    "What usually happens when you move closer to a foreground rock with a distant mountain behind it?",
    [
      "The rock grows relative to the mountain",
      "The mountain grows relative to the rock",
      "Their relative heights must stay identical",
      "The rock becomes physically larger",
    ],
    0,
    "The move is proportionally larger compared with the short distance to the rock. The rock becomes more dominant in the image, not physically larger.",
  ),
  question(
    "scale-2",
    "scale",
    "You step back and use a longer focal length to keep the rock similarly framed. What happens to a distant mountain relative to the rock?",
    [
      "It must disappear",
      "It becomes physically taller",
      "It becomes smaller relative to the rock",
      "It becomes larger relative to the rock",
    ],
    3,
    "Stepping back reduces the difference between near and far viewing distances. The mountain becomes larger relative to the rock; the longer focal length restores framing.",
  ),
  question(
    "scale-3",
    "scale",
    "Two objects have the same real height but are at different distances. Which appears taller in an ideal level-camera projection?",
    [
      "The farther object",
      "The nearer object",
      "Always the darker object",
      "Both must have equal image heights",
    ],
    1,
    "Projected height is proportional to real height divided by depth from the camera. The nearer equal-height object projects larger.",
  ),
  question(
    "height-1",
    "height",
    "You raise a level camera without tilting it. What happens to the horizon?",
    [
      "It always moves to the bottom",
      "It always moves to the top",
      "It stays centred while ground features shift relative to it",
      "It disappears whenever the camera rises",
    ],
    2,
    "For a level camera on the ideal flat-ground model, the horizon stays centred. Height changes how ground features and objects sit relative to it.",
  ),
  question(
    "height-2",
    "height",
    "How can you place the horizon higher in the frame to include more ground?",
    [
      "Tilt the camera downward",
      "Increase ISO",
      "Change white balance",
      "Raise a level camera and assume the horizon must move",
    ],
    0,
    "Downward tilt moves the horizon higher in the frame. Height affects foreground relationships, but height alone does not move a level camera’s horizon.",
  ),
  question(
    "landscape-1",
    "landscape",
    "A foreground rock looks too dominant. You want the ridge larger relative to it while keeping the rock similarly framed. What should you try?",
    [
      "Move closer and use a wider lens",
      "Stay still and change aperture",
      "Stay still and crop only the ridge",
      "Move farther away and use a longer focal length",
    ],
    3,
    "Moving back changes the near-to-far scale relationship. A longer focal length can then maintain the rock’s approximate framing.",
  ),
  question(
    "landscape-2",
    "landscape",
    "A low viewpoint hides the middle-ground path behind a rock. What is a useful experiment?",
    [
      "Assume every low viewpoint gives more depth",
      "Raise or shift the camera and check the overlap",
      "Change ISO until the path is visible",
      "Use a longer lens without moving and expect new hidden detail",
    ],
    1,
    "Changing position can reveal detail behind an obstruction. A longer focal length from the same viewpoint cannot see around the rock.",
  ),
  question(
    "misconception-1",
    "misconception",
    "Which statement about apparent background compression is accurate?",
    [
      "Long lenses move distant objects closer",
      "Focal length alone changes near-to-far ratios from a fixed viewpoint",
      "Moving farther away changes perspective; a longer lens can restore framing",
      "Compression is caused only by exposure settings",
    ],
    2,
    "The camera movement changes perspective. A longer lens is often used from that farther viewpoint, which can make the effects seem inseparable.",
  ),
  question(
    "misconception-2",
    "misconception",
    "A wider lens gives an exaggerated foreground in a photograph. What is the most accurate explanation?",
    [
      "The photographer’s close viewpoint creates the strong near-to-far relationship",
      "Every wide lens changes perspective even from an unchanged viewpoint",
      "The lens physically enlarges nearby objects",
      "Sensor colour settings change object distances",
    ],
    0,
    "Close camera placement creates the exaggerated near-to-far relationship. A wide lens helps include more of the scene from that close position.",
  ),
];
export type Answers = Record<string, number>;
export function scoreBand(score: number) {
  return score >= 13
    ? "Perspective understood"
    : score >= 10
      ? "Good understanding"
      : score >= 7
        ? "Developing"
        : "Start with the simulator";
}
export function scoreAnswers(answers: Answers) {
  return questions.filter((q) => q.choices[answers[q.id]]?.correct).length;
}
export function recommendations(answers: Answers) {
  const missed = new Set(
    questions
      .filter(
        (q) =>
          answers[q.id] !== undefined && !q.choices[answers[q.id]]?.correct,
      )
      .map((q) => q.topic),
  );
  const lessons = new Map<string, { href: string; labels: string[] }>();
  for (const topic of missed) {
    const info = topics[topic];
    const lesson = lessons.get(info.href) ?? { href: info.href, labels: [] };
    lesson.labels.push(info.label);
    lessons.set(info.href, lesson);
  }
  return [...lessons.values()];
}
export function newAttempt(): Answers {
  return {};
}
export function submitAnswer(
  answers: Answers,
  id: string,
  choice: number,
): Answers {
  const q = questions.find((item) => item.id === id);
  if (
    !q ||
    !Number.isInteger(choice) ||
    !q.choices[choice] ||
    answers[id] !== undefined
  )
    return answers;
  return { ...answers, [id]: choice };
}
