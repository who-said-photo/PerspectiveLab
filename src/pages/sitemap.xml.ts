import type { APIRoute } from "astro";
const paths = [
  "/",
  "/how-perspective-works/",
  "/camera-distance-perspective/",
  "/focal-length-vs-perspective/",
  "/landscape-perspective/",
  "/perspective-simulator/",
  "/perspective-challenges/",
  "/perspective-quiz/",
  "/perspective-resources/",
];
export const GET: APIRoute = ({ site }) =>
  new Response(
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      (site
        ? paths
            .map(
              (path) =>
                "<url><loc>" +
                new URL(path, site).href.replaceAll("&", "&amp;") +
                "</loc></url>",
            )
            .join("")
        : "") +
      "</urlset>",
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
