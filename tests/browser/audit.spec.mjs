import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const routes = [
  "/",
  "/perspective-simulator/",
  "/how-perspective-works/",
  "/camera-distance-perspective/",
  "/focal-length-vs-perspective/",
  "/landscape-perspective/",
  "/perspective-challenges/",
  "/perspective-quiz/",
  "/perspective-resources/",
];
for (const route of routes)
  test(
    "audit accessibility, links and responsive layout " + route,
    async ({ page, request }) => {
      await page.goto(route);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(
        result.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
      const links = await page
        .locator("a")
        .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href")));
      for (const href of new Set(links)) {
        if (!href || (!href.startsWith("/") && !href.startsWith("#"))) continue;
        const url = new URL(href, "http://127.0.0.1:4322" + route);
        if (url.hash) {
          if (url.pathname === route)
            expect(
              await page
                .locator("[id]")
                .evaluateAll(
                  (nodes, id) => nodes.some((n) => n.id === id),
                  decodeURIComponent(url.hash.slice(1)),
                ),
            ).toBe(true);
        } else expect((await request.get(url.href)).status()).toBe(200);
      }
      await page.setViewportSize({ width: 320, height: 800 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.locator(".mobile-nav summary").focus();
      await page.keyboard.press("Enter");
      await expect(page.locator(".mobile-nav nav")).toBeVisible();
      await page.evaluate(
        () => (document.documentElement.style.fontSize = "200%"),
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    },
  );
test("interactive accessibility after quiz answer and comparison saves", async ({
  page,
}) => {
  for (const route of ["/perspective-quiz/", "/perspective-simulator/"]) {
    await page.goto(route);
    if (route.includes("quiz")) {
      await page.getByRole("radio").first().check();
      await page
        .getByRole("button", { name: "Submit answer", exact: true })
        .click();
    } else {
      await page.getByRole("button", { name: "Save comparison A" }).click();
      await page.getByRole("button", { name: "Save comparison B" }).click();
    }
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  }
});
test("numeric steps remain consistent and simulator updates under CPU throttling", async ({
  page,
}) => {
  await page.goto("/perspective-simulator/");
  const input = page.locator("#number-focal");
  await input.fill("35.5");
  await input.press("Tab");
  await expect(input).toHaveValue("35");
  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const elapsed = await page.evaluate(() => {
    const input = document.querySelector("#sim-focal");
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      input.value = String(24 + (i % 177));
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
    return performance.now() - start;
  });
  console.log(
    `Simulator: 100 synchronous updates at 4x CPU throttling in ${elapsed.toFixed(1)} ms`,
  );
  expect(elapsed).toBeLessThan(5000);
});
