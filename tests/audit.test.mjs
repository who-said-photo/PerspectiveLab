import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
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
test("Article schema identifies only the four lessons and matches their content", () => {
  const lessons = new Set([
    "how-perspective-works",
    "camera-distance-perspective",
    "focal-length-vs-perspective",
    "landscape-perspective",
  ]);
  for (const route of routes) {
    const html = fs.readFileSync(
      `dist/${route ? route + "/" : ""}index.html`,
      "utf8",
    );
    const entities = [
      ...html.matchAll(
        /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
      ),
    ].flatMap((match) => JSON.parse(match[1])["@graph"] ?? []);
    const articles = entities.filter((entity) => entity["@type"] === "Article");
    assert.equal(articles.length, lessons.has(route) ? 1 : 0);
    if (!lessons.has(route)) continue;
    const article = articles[0];
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)[1];
    assert.equal(article.url, canonical);
    assert.equal(article["@id"], `${canonical}#article`);
    assert.equal(article.mainEntityOfPage["@id"], canonical);
    assert.equal(article.headline, html.match(/<h1[^>]*>(.*?)<\/h1>/s)[1]);
    assert.equal(
      article.description,
      html.match(/name="description" content="([^"]+)"/)[1],
    );
    assert.equal(article.inLanguage, "en-CA");
    for (const [property, type] of [
      ["author", "Person"],
      ["publisher", "Organization"],
      ["isPartOf", "WebSite"],
    ]) {
      assert.equal(
        article[property]["@id"],
        entities.find((entity) => entity["@type"] === type)["@id"],
      );
    }
    assert.equal(article.datePublished, undefined);
    assert.equal(article.dateModified, undefined);
  }
});
test("launch pages are indexable and schema contains no fabricated claims", () => {
  for (const route of routes) {
    const html = fs.readFileSync(
      `dist/${route ? route + "/" : ""}index.html`,
      "utf8",
    );
    assert.doesNotMatch(
      html,
      /FAQPage|aggregateRating|reviewCount|audit\.invalid|\u2014/,
    );
    assert.doesNotMatch(html, /name="robots" content="noindex"/);
    for (const property of [
      "og:title",
      "og:description",
      "og:type",
      "og:locale",
    ])
      assert.ok(html.includes(`property="${property}"`));
    for (const match of html.matchAll(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    )) {
      const schema = JSON.parse(match[1]);
      if (schema["@graph"]) {
        const entities = schema["@graph"];
        const person = entities.find((entity) => entity["@type"] === "Person");
        const organization = entities.find(
          (entity) => entity["@type"] === "Organization",
        );
        const website = entities.find(
          (entity) => entity["@type"] === "WebSite",
        );
        assert.equal(person.name, "Bob Wild");
        assert.equal(organization.name, "Who Said Photography");
        assert.equal(website.author["@id"], person["@id"]);
        assert.equal(website.publisher["@id"], organization["@id"]);
        assert.equal(person.affiliation["@id"], organization["@id"]);
        assert.equal(
          new Set(organization.sameAs).size,
          organization.sameAs.length,
        );
        for (const url of organization.sameAs) {
          assert.equal(new URL(url).protocol, "https:");
          assert.doesNotMatch(url, /[\[\]()]/);
        }
        assert.match(html, /Learning content by Bob Wild/);
      } else {
        assert.equal(route, "perspective-simulator");
        assert.equal(schema["@type"], "WebApplication");
        assert.equal(
          schema.publisher["@id"],
          "https://whosaidphotography.com/#organization",
        );
      }
    }
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(ids.length, new Set(ids).size);
  }
  assert.equal(fs.existsSync("dist/about/index.html"), false);
  const headers = fs.readFileSync("dist/_headers", "utf8");
  assert.match(headers, /X-Content-Type-Options: nosniff/);
  assert.match(headers, /max-age=31536000, immutable/);
});
