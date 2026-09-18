import { test, expect } from "@playwright/test";
const url = "/perspective-simulator/";
async function enter(page, key, value) {
  await page.locator("#number-" + key).fill(String(value));
  await page.locator("#number-" + key).press("Tab");
}
test("keyboard controls, matching modes, independent comparisons and reset", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(url);
  await expect(page.locator("#sim-focal")).toBeEnabled();
  await page.locator("#sim-focal").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#number-focal")).toHaveValue("36");
  await expect(page.locator("#number-distance")).toHaveValue("10");
  await expect(page.locator("#sim-explanation")).toContainText(
    "framing, not the perspective",
  );
  await page.getByRole("button", { name: "Save comparison A" }).focus();
  await page.keyboard.press("Enter");
  const a = await page.locator("#comparison-A").innerHTML();
  await page.locator("#sim-matching").focus();
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("radio", { name: "Matching subject size", exact: true }),
  ).toBeChecked();
  await enter(page, "focal", 72);
  await expect(page.locator("#number-distance")).toHaveValue("20");
  await expect(page.locator("#sim-explanation")).toContainText("farther away");
  await page.getByRole("button", { name: "Save comparison B" }).focus();
  await page.keyboard.press("Space");
  const b = await page.locator("#comparison-B").innerHTML();
  expect(a).not.toEqual(b);
  await page.getByRole("button", { name: "Reset camera", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#number-focal")).toHaveValue("35");
  await expect(page.locator("#number-distance")).toHaveValue("10");
  await expect(page.locator("#number-height")).toHaveValue("1.6");
  await expect(page.locator("#number-lateral")).toHaveValue("0");
  await expect(page.locator("#sim-matching")).not.toBeChecked();
  expect(await page.locator("#comparison-A").innerHTML()).toEqual(a);
  expect(await page.locator("#comparison-B").innerHTML()).toEqual(b);
  await page
    .getByRole("radio", { name: "Fixed camera position", exact: true })
    .focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#sim-matching")).toBeChecked();
  expect(errors).toEqual([]);
});
test("height and lateral sliders work with keyboard; numeric validation and bounds explain limits", async ({
  page,
}) => {
  await page.goto(url);
  for (const [key, value] of [
    ["height", "1.7"],
    ["lateral", "0.1"],
    ["distance", "10.1"],
  ]) {
    await page.locator("#sim-" + key).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#number-" + key)).toHaveValue(value);
  }
  await page.locator("#number-height").fill("");
  await page.locator("#number-height").press("Tab");
  await expect(page.locator("#number-height")).toHaveValue("1.7");
  await expect(page.locator("#sim-explanation")).toContainText(
    "previous settings",
  );
  await enter(page, "focal", 200);
  await enter(page, "distance", 3);
  await page.locator("#sim-matching").check();
  await enter(page, "focal", 24);
  await expect(page.locator("#number-distance")).toHaveValue("3");
  await expect(page.locator("#sim-explanation")).toContainText("limit");
});
test("mobile layout and comparisons fit at 320px and 390px; no external runtime requests", async ({
  page,
}) => {
  const external = [];
  page.on("request", (request) => {
    if (!request.url().startsWith("http://127.0.0.1:4322"))
      external.push(request.url());
  });
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(url);
    await page.getByRole("button", { name: "Save comparison A" }).click();
    await page.getByRole("button", { name: "Save comparison B" }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const [a, b] = await Promise.all([
      page.locator('[aria-label="Comparison A"]').boundingBox(),
      page.locator('[aria-label="Comparison B"]').boundingBox(),
    ]);
    expect(b.y).toBeGreaterThan(a.y + a.height);
  }
  expect(external).toEqual([]);
  await page.screenshot({
    path: "test-results/simulator-mobile.png",
    fullPage: true,
  });
});
test("static fallback works without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4322" + url);
  await expect(page.locator("#sim-scene svg")).toBeVisible();
  await expect(page.locator("#sim-focal")).toBeDisabled();
  await expect(page.locator("noscript p")).toContainText("JavaScript is off");
  await expect(
    page.getByRole("heading", { name: "Begin with a fixed viewpoint" }),
  ).toBeVisible();
  await context.close();
});
test("desktop view, structured data and focus treatment", async ({ page }) => {
  await page.goto(url);
  await page.locator("#sim-focal").focus();
  expect(
    await page
      .locator("#sim-focal")
      .evaluate((node) => getComputedStyle(node).outlineStyle),
  ).toBe("solid");
  const schema = JSON.parse(
    await page.locator('script[type="application/ld+json"]').textContent(),
  );
  expect(schema["@type"]).toBe("WebApplication");
  expect(schema).not.toHaveProperty("aggregateRating");
  await page.screenshot({
    path: "test-results/simulator-desktop.png",
    fullPage: true,
  });
});
