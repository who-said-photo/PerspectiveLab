import { test, expect } from "@playwright/test";
import { questions } from "../../src/lib/learning/quiz.ts";
import { challenges } from "../../src/lib/learning/challenges.ts";
test("exam works with blocked storage, gives feedback only after submission, reviews and restarts", async ({
  page,
}) => {
  await page.addInitScript(() => {
    for (const name of ["localStorage", "sessionStorage"])
      Object.defineProperty(window, name, {
        get() {
          throw new Error("Storage unavailable");
        },
      });
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/perspective-quiz/");
  await expect(page.locator("#quiz-app")).toBeVisible();
  await expect(page.locator("#quiz-feedback")).toBeEmpty();
  await expect(
    page.getByText(questions[0].explanation, { exact: false }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Submit answer", exact: true })
    .click();
  await expect(page.locator("#quiz-feedback")).toHaveText(
    "Choose one answer, then submit.",
  );
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const answer = q.choices.findIndex((c) => c.correct === (i !== 0));
    await expect(page.locator("#quiz-prompt")).toHaveText(q.prompt);
    await page.getByRole("radio").nth(answer).focus();
    await page.keyboard.press("Space");
    await page
      .getByRole("button", { name: "Submit answer", exact: true })
      .focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#quiz-feedback")).toContainText(q.explanation);
    if (i < 14)
      await page
        .getByRole("button", { name: "Next question", exact: true })
        .click();
  }
  await page.getByRole("button", { name: "View results", exact: true }).click();
  await expect(page.locator("#quiz-score")).toHaveText("Your score: 14 / 15");
  await expect(page.locator("#quiz-band")).toHaveText("Perspective understood");
  await expect(page.locator("#quiz-recommendations a")).toHaveAttribute(
    "href",
    "/how-perspective-works/",
  );
  await page
    .getByRole("button", { name: "Review answers", exact: true })
    .click();
  await expect(page.locator("#quiz-feedback")).toContainText(
    questions[0].explanation,
  );
  await expect(page.getByRole("radio").first()).toBeDisabled();
  await page
    .getByRole("button", { name: "Next question", exact: true })
    .click();
  await expect(page.locator("#quiz-feedback")).toContainText(
    questions[1].explanation,
  );
  await page
    .getByRole("button", { name: "Previous question", exact: true })
    .click();
  await expect(page.locator("#quiz-feedback")).toContainText(
    questions[0].explanation,
  );
  await page.getByRole("button", { name: "Restart exam", exact: true }).click();
  await expect(page.locator("#quiz-feedback")).toBeEmpty();
  await expect(page.locator("#quiz-progress")).toHaveAttribute("value", "0");
  await expect(page.getByRole("radio").first()).toBeEnabled();
  await expect(page.locator("#quiz-results")).toBeHidden();
  expect(errors).toEqual([]);
});
test("all challenges provide feedback, accept solutions and reset with keyboard controls", async ({
  page,
}) => {
  await page.goto("/perspective-challenges/");
  for (const c of challenges) {
    const root = page.locator(`[data-challenge="${c.id}"]`);
    await root.getByRole("button", { name: "Check my decision" }).click();
    await expect(root.locator("[data-feedback]")).toContainText(
      "Keep exploring.",
    );
    for (const key of c.controls) {
      const input = page.locator(`#${c.id}-${key}`);
      await input.fill(String(c.solution[key] ?? 0));
      await input.press("Tab");
    }
    await root.getByRole("button", { name: "Check my decision" }).focus();
    await page.keyboard.press("Enter");
    await expect(root.locator("[data-feedback]")).toContainText(
      "Objective met.",
    );
    await root.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(root.getByText(c.tradeoff)).toBeVisible();
    await root.getByRole("button", { name: "Reset exercise" }).focus();
    await page.keyboard.press("Space");
    for (const key of c.controls)
      await expect(page.locator(`#${c.id}-${key}`)).toHaveValue(
        String(c.initial[key] ?? 0),
      );
  }
});
test("new pages fit a narrow phone and enlarged text", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  for (const route of ["/perspective-quiz/", "/perspective-challenges/"]) {
    await page.goto(route);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.evaluate(
      () => (document.documentElement.style.fontSize = "200%"),
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/perspective-quiz/");
  await page.screenshot({
    path: "test-results/quiz-mobile.png",
    fullPage: true,
  });
});
test("no-JavaScript pages retain instructions, scenes and recommended solutions", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4322/perspective-quiz/");
  await expect(page.locator("#quiz-loading")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "What the exam covers" }),
  ).toBeVisible();
  await page.goto("http://127.0.0.1:4322/perspective-challenges/");
  await expect(page.locator("[data-scene] svg")).toHaveCount(5);
  await expect(page.locator("#foreground-distance")).toBeDisabled();
  await page.locator(".challenge summary").first().click();
  await expect(page.getByText(challenges[0].advice)).toBeVisible();
  await context.close();
});
test("desktop challenge and quiz screenshots", async ({ page }) => {
  await page.goto("/perspective-challenges/");
  await page
    .locator('[data-challenge="foreground"]')
    .screenshot({ path: "test-results/challenge-desktop.png" });
  await page.goto("/perspective-quiz/");
  await page.screenshot({
    path: "test-results/quiz-desktop.png",
    fullPage: true,
  });
});
