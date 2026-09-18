import { challenges, checkChallenge } from "../lib/learning/challenges";
import type { ChallengeControl } from "../lib/learning/challenges";
import { change } from "../lib/simulator/model";
import { scene } from "../lib/simulator/render";
import { summary } from "../lib/simulator/education";
export function mountChallenges() {
  document.querySelectorAll<HTMLElement>("[data-challenge]").forEach((root) => {
    const challenge = challenges.find((c) => c.id === root.dataset.challenge)!;
    let settings = { ...challenge.initial };
    const feedback = root.querySelector<HTMLElement>("[data-feedback]")!;
    const render = () => {
      root.querySelector("[data-scene]")!.innerHTML = scene(settings);
      root.querySelector("[data-view-summary]")!.textContent =
        summary(settings) +
        ` · tilt ${(settings.tilt ?? 0).toFixed(0)}° downward`;
      root
        .querySelectorAll<HTMLInputElement>("[data-key]")
        .forEach(
          (input) =>
            (input.value = String(
              settings[input.dataset.key as ChallengeControl] ?? 0,
            )),
        );
    };
    root.querySelectorAll<HTMLInputElement>("[data-key]").forEach((input) =>
      input.addEventListener("change", () => {
        const key = input.dataset.key as ChallengeControl,
          value = input.valueAsNumber;
        if (!Number.isFinite(value) || input.validity.stepMismatch) {
          render();
          feedback.textContent =
            "Enter a number in the displayed range. The previous settings have been kept.";
          return;
        }
        settings =
          key === "tilt"
            ? { ...settings, tilt: Math.max(-12, Math.min(12, value)) }
            : change(settings, key, value).settings;
        render();
        feedback.textContent =
          "View updated. Check your decision for feedback on the objective.";
      }),
    );
    root.querySelector("[data-check]")!.addEventListener("click", () => {
      feedback.textContent = checkChallenge(challenge.id, settings).text;
    });
    root.querySelector("[data-reset]")!.addEventListener("click", () => {
      settings = { ...challenge.initial };
      render();
      feedback.textContent = "Exercise reset to its starting viewpoint.";
    });
    render();
    root.querySelector<HTMLFieldSetElement>("[data-controls]")!.disabled =
      false;
  });
  const loading = document.querySelector<HTMLElement>(
    "[data-challenge-loading]",
  );
  if (loading) loading.hidden = true;
}
