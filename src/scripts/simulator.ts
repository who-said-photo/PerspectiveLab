import { change, reset, saveComparison } from "../lib/simulator/model";
import type { Comparisons, Control } from "../lib/simulator/model";
import { describeChange, metrics, summary } from "../lib/simulator/education";
import { scene } from "../lib/simulator/render";
export function mountSimulator() {
  const root = document.querySelector<HTMLElement>("#perspective-lab");
  if (!root) return;
  const get = <T extends HTMLElement>(selector: string) => {
    const node = root.querySelector<T>(selector);
    if (!node) throw new Error(`Missing simulator element: ${selector}`);
    return node;
  };
  try {
    let settings = reset();
    let saved: Comparisons = { A: null, B: null };
    let announcement: ReturnType<typeof setTimeout>;
    const announce = (text: string) => {
      clearTimeout(announcement);
      announcement = setTimeout(() => {
        get("#sim-status").textContent = text;
      }, 350);
    };
    const sync = () => {
      root
        .querySelectorAll<HTMLInputElement>("[data-control]")
        .forEach((input) => {
          const key = input.dataset.control as Control;
          // Preserve exact internal distance: never feed display rounding back
          // into projection or subject-matching calculations.
          input.value = String(
            Number(settings[key].toFixed(key === "distance" ? 4 : 2)),
          );
          if (input.type === "range")
            input.setAttribute(
              "aria-valuetext",
              `${settings[key].toFixed(key === "distance" ? 2 : 1)} ${key === "focal" ? "millimetres" : "metres"}`,
            );
        });
      get<HTMLInputElement>("#sim-matching").checked = settings.matching;
      root
        .querySelectorAll<HTMLInputElement>('[name="sim-mode"]')
        .forEach((input) => {
          input.checked = (input.value === "matching") === settings.matching;
        });
      get("#sim-scene").innerHTML = scene(settings);
      get("#sim-settings").textContent = summary(settings);
      get("#sim-metrics").textContent = metrics(settings);
    };
    const explain = (text: string) => {
      get("#sim-explanation").textContent = text;
      announce(text);
    };
    root
      .querySelectorAll<HTMLInputElement>("[data-control]")
      .forEach((input) => {
        input.addEventListener(
          input.type === "range" ? "input" : "change",
          () => {
            const value = input.valueAsNumber;
            if (!Number.isFinite(value) || input.validity.stepMismatch) {
              sync();
              explain(
                "Enter a number in the displayed range using the control’s step size. Your previous settings have been kept.",
              );
              return;
            }
            const key = input.dataset.control as Control;
            const before = settings;
            const result = change(settings, key, value);
            settings = result.settings;
            sync();
            explain(describeChange(before, settings, key, result.limited));
          },
        );
      });
    const setMode = (matching: boolean) => {
      settings = { ...settings, matching };
      sync();
      explain(
        matching
          ? "Matching subject size is on. Changing focal length now moves the camera to preserve the rock’s projected height. Moving the distance control sets a new reference."
          : "Fixed camera position is on. Changing focal length leaves the camera in place.",
      );
    };
    get<HTMLInputElement>("#sim-matching").addEventListener("change", (event) =>
      setMode((event.target as HTMLInputElement).checked),
    );
    root
      .querySelectorAll<HTMLInputElement>('[name="sim-mode"]')
      .forEach((input) =>
        input.addEventListener("change", () =>
          setMode(input.value === "matching"),
        ),
      );
    get("#sim-reset").addEventListener("click", () => {
      settings = reset();
      sync();
      explain(
        "Camera reset: 35 mm, 10 m to the rock’s plane, height 1.6 m, centred, fixed camera position. Saved comparisons have been kept.",
      );
    });
    root.querySelectorAll<HTMLButtonElement>("[data-save]").forEach((button) =>
      button.addEventListener("click", () => {
        const slot = button.dataset.save as "A" | "B";
        saved = saveComparison(saved, slot, settings);
        const snapshot = saved[slot]!;
        const target = get(`#comparison-${slot}`);
        target.innerHTML = `<div class="sim-scene">${scene(snapshot)}</div>`;
        for (const text of [summary(snapshot), metrics(snapshot)]) {
          const p = document.createElement("p");
          p.className = "small";
          p.textContent = text;
          target.append(p);
        }
        announce(`Comparison ${slot} saved. ${summary(snapshot)}`);
      }),
    );
    sync();
    get<HTMLFieldSetElement>("#sim-controls").disabled = false;
    get("#sim-loading").hidden = true;
  } catch (error) {
    const fallback = root.querySelector("#sim-loading");
    if (fallback)
      fallback.textContent =
        "The controls could not start. Reload to try again, or use the static scene and explanation.";
    console.error("Simulator initialisation failed", error);
  }
}
