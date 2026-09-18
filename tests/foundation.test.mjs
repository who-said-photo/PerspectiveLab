import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const routes = [
  "",
  "perspective-simulator",
  "how-perspective-works",
  "camera-distance-perspective",
  "focal-length-vs-perspective",
  "landscape-perspective",
  "perspective-challenges",
  "perspective-quiz",
  "perspective-resources",
];
const pages = routes.map((route) =>
  fs.readFileSync(path.join("dist", route, "index.html"), "utf8"),
);
test("nine content routes have unique metadata, one H1, attribution and correct language", () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const html of pages) {
    titles.add(html.match(/<title>(.*?)<\/title>/s)?.[1]);
    descriptions.add(html.match(/name="description" content="([^"]+)"/)?.[1]);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
    assert.match(html, /lang="en-CA"/);
    assert.match(
      html,
      /Photography Perspective Lab is an interactive learning project created by/,
    );
    assert.match(html, /href="https:\/\/whosaidphotography.com\/"/);
    assert.doesNotMatch(html, /\u2014/);
  }
  assert.equal(titles.size, 9);
  assert.equal(descriptions.size, 9);
  assert.ok(!titles.has(undefined));
  assert.ok(!descriptions.has(undefined));
});
test("all local links and assets resolve in the static output", () => {
  for (const html of [...pages, fs.readFileSync("dist/404.html", "utf8")])
    for (const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
      const url = match[1];
      const target = path.join(
        "dist",
        url.endsWith("/") ? url + "index.html" : url,
      );
      assert.ok(fs.existsSync(target), `Missing local target ${url}`);
    }
});
test("404 and script-free navigation are available", () => {
  assert.match(
    fs.readFileSync("dist/404.html", "utf8"),
    /name="robots" content="noindex"/,
  );
  for (const html of pages) {
    assert.match(html, /<details class="mobile-nav"/);
    assert.match(html, /href="#main"/);
    assert.match(html, /id="main"/);
  }
});
