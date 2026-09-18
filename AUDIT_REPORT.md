# Pre-deployment audit

Audit completed locally on 14 September 2026. No deployment was performed.

## Readiness

The nine-route site passes the local audit. Publishing still requires a confirmed production origin in SITE_URL and a rebuild. The current local output intentionally omits canonical/OG URLs and contains an empty sitemap because the production domain has not been supplied. Do not upload this local output as the final release.

## Changes made

- Added automated axe accessibility checks for every route and for answered-quiz/saved-comparison states, plus internal-link, fragment, mobile menu and enlarged-text checks.
- Rejected numeric entries that violate the controls' step sizes, avoiding disagreement between fractional numeric values and range/display values.
- Tightened SITE_URL validation to reject credentials, query strings, fragments and non-root paths.
- Removed the duplicated site name from the home-page title.
- Replaced the resources placeholder with a verified composition article and a specific reason to read it.
- Added repeatable metadata/schema/header regression checks. Added axe as a development-only dependency.

Changed areas: astro.config.mjs; package.json and lockfile; src/components/SEO.astro; src/pages/perspective-resources.astro; src/scripts/simulator.ts; src/scripts/challenges.ts; tests/browser/audit.spec.mjs; tests/audit.test.mjs; README.md; PROJECT_BRIEF.md; this report.

## Checks and evidence

- All nine routes inspected for unique introductions, Canadian English, one H1, original content, accurate distinction between position and focal length, attribution and prohibited content. No em dashes, portrait material, About page, copied photography, tracking or unnecessary services found.
- Formatter, Astro Check, production build and all unit/site tests pass. Browser suite: 21 passing tests, including existing simulator, challenge and exam tests.
- Axe WCAG 2 A/AA, 2.1 AA and 2.2 AA checks: zero automated violations on nine initial pages and two interactive states. Includes contrast, labels and applicable target-size checks. This is not a claim of complete accessibility certification.
- Every rendered internal link and local fragment checked. Existing static tests cover local asset targets too. No broken internal targets found.
- Both editorial external URLs returned HTTP 200: https://whosaidphotography.com/ and https://whosaidphotography.com/elements-of-composition-in-photography/. No affiliate or sponsored links were added. The article was read to confirm relevance to composition.
- Correct JSON-LD syntax and WebApplication type; no FAQ, ratings or reviews. No accidental noindex on editorial pages. 404 remains intentionally noindex.
- A temporary, test-only origin (https://audit.invalid) successfully generated canonical and OG URLs for all nine routes and nine sitemap entries, with the correct robots sitemap reference. Rebuilt without that origin afterwards; regression checks ensure it is absent from deliverables.
- All routes fit a 320 px viewport, including with 200% text and the mobile menu open. Quiz/challenge/simulator keyboard flows and no-JavaScript explanations pass.
- Simulator stress probe: 100 synchronous control updates took 79.5 ms with Chromium CPU throttled 4x. This measures update processing, not painted frame rate or a real phone benchmark.
- Static site uses no remote runtime assets or fonts. Generated JS files total about 23 KB uncompressed across the entire site; each interactive page loads only its needed bundles. There are no raster/video assets to lazy-load. SVG scenes reserve a 3:2 frame; no animation is introduced. No external runtime requests occurred in the simulator browser check.
- Runtime dependency audit reports zero vulnerabilities.

## Exact Cloudflare Pages settings

| Setting                   | Value                                                                           |
| ------------------------- | ------------------------------------------------------------------------------- |
| Repository root directory | PerspectiveLab (relative to the current CameraGuide Git root)                   |
| Build command             | npm run build                                                                   |
| Build output directory    | dist                                                                            |
| NODE_VERSION              | 24.19.0                                                                         |
| SITE_URL                  | Confirmed HTTPS production origin, without path, query, fragment or credentials |
| Configuration file        | wrangler.toml                                                                   |
| Output type               | Static Astro directory routes; no SSR adapter, database or bindings             |

Existing public/_headers provides nosniff, frame denial, referrer and permissions policies; hashed /_astro assets have one-year immutable caching. HTML uses Cloudflare's default caching. No custom redirects are necessary. Cloudflare Pages serves directory index routes and normalizes HTML/index URLs; the top-level 404.html prevents SPA fallback. Local tests do not emulate Cloudflare's header/redirect implementation.

References: [Cloudflare Astro guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/) and [Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/).

## Remaining release actions and manual checks

1. Confirm SITE_URL, build again, then inspect production canonical, OG and sitemap origins. Choose the primary host before configuring any alternate-host redirects.
2. Test real screen-reader announcements and keyboard flow using NVDA or VoiceOver, and check Safari/Firefox and a physical lower-powered phone. Chromium automation and CPU throttling do not replace those checks.
3. During a separately authorized deployment, verify Cloudflare's actual trailing-slash/HTML redirects, 404 HTTP status and security/cache headers. Nothing has been deployed during this audit.

Known product limits remain intentional: flat illustrated scene objects, no lens distortion or depth of field, level camera in the main simulator, tilt confined to the horizon challenge, and in-memory quiz/comparison state that clears on reload. Lesson articles are concise introductions.

## Repeat audit: 13 September 2026, 21:17 Pacific

Re-ran prompt4 against the current project. Formatting, Astro Check, production build, 16 unit/site tests and all 21 browser tests passed. The accessibility suite again found no automated violations in its covered states. Both external editorial URLs returned HTTP 200. Runtime dependency audit: zero vulnerabilities. The throttled simulator probe processed 100 updates in 77.2 ms. No new application fixes were needed; this report was updated.

Readiness remains unchanged: local audit complete, deployment pending a confirmed SITE_URL and the manual release checks above. Cloudflare settings remain root PerspectiveLab, build npm run build, output dist and NODE_VERSION 24.19.0. Nothing was deployed. The earlier 14 September audit date uses UTC; this repeat timestamp uses local Pacific time.
