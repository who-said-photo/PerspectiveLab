# Photography Perspective Lab

Static Astro and TypeScript learning lab with an interactive perspective simulator. Nine content routes plus a non-indexed 404 utility page. No deployment was performed.

## Local development

Use Node.js 22.18+ (tested with 24.19) and npm. Native TypeScript stripping is used by model tests.

```sh
npm ci
npm run dev
```

Open the local URL printed by Astro. This Astro release may retain the server in the background; use `npx astro dev stop` to stop it.

```sh
npm run format
npm run format:check
npm run lint
npm run build
npm test
npm run preview
```

`lint` uses Astro Check for Astro and TypeScript diagnostics. Tests inspect the production output, so build before testing. Prettier excludes original prompt documents. The local PostCSS configuration prevents unrelated parent-repository configuration from being inherited.

## Cloudflare Pages settings

- Project root: this `PerspectiveLab` directory (when connecting the parent repository, select its relative path).
- Build command: `npm run build`
- Output directory: `dist`
- Node version: 24.19.0
- Configuration: `wrangler.toml`, static Pages output; no server adapter or bindings.
- Set `SITE_URL` to the confirmed HTTPS production origin before a release build. Example PowerShell: `$env:SITE_URL = 'https://your-confirmed-domain.example'` (replace this example).

Until an origin is confirmed, local builds omit canonical/OG URLs and produce an empty sitemap without invented domains. Production must set SITE_URL and verify the resulting canonical URLs, sitemap and robots. All nine routes are directory-style static pages. Cloudflare serves `404.html` for missing paths; no SPA fallback is configured. Security headers apply site-wide and fingerprinted assets have immutable caching. HTML uses the host's default caching.

Cloudflare reference: https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/
Astro configuration: https://docs.astro.build/en/guides/configuring-astro/

## Scope and future work

See PROJECT_BRIEF.md for the source of truth. Prompts 1, 2 and 3 are implemented. The simulator works entirely in the browser with an original SVG landscape, labelled controls, fixed/matching modes, dynamic explanations and A/B comparisons. Five interactive challenges and a 15-question final exam are available. The quiz includes explanations, previous-answer review, score bands and lesson recommendations. Answers and exercise settings stay in memory only and are cleared by reload. Lesson copy is a concise introduction. Navigation and disclosures work without JavaScript; the simulator supplies a static explanatory fallback.

## Simulator checks

After building, run `npm test` for numerical invariants and generated-page checks. For browser checks, run `npx playwright install chromium`, then `npm run test:e2e`. Playwright serves production output locally on port 4322, checks keyboard interaction, snapshots, responsive layouts and the no-JavaScript fallback, then stops its server. Desktop and mobile screenshots are saved in ignored test-results/. No tests deploy anything.

The model and limits are documented in PROJECT_BRIEF.md and in the simulator’s visible Q&A. Browser automation has been checked in Chromium; other browser engines, real assistive technologies and lower-powered physical phones still warrant manual review before deployment.

## Challenge and exam implementation

The challenges use src/lib/learning/challenges.ts and share the simulator model and renderer. Horizon Control enables optional camera tilt; the original simulator stays level. Quiz questions, topic mappings and scoring are in src/lib/learning/quiz.ts, separated from the presentation and browser controller. Run the existing `npm test` and `npm run test:e2e` commands for the complete suite. The suite checks score-band boundaries, question distribution, recommended solutions, restart, unavailable storage, keyboard interaction, mobile layouts and no-JavaScript content.

## Pre-deployment audit

The local audit is complete. See [AUDIT_REPORT.md](AUDIT_REPORT.md) for fixes, evidence and remaining release actions. Run `npm run test:e2e` to include the new axe accessibility and route checks. The production origin remains required before publishing. For the current parent Git repository, use `PerspectiveLab` as the Cloudflare Pages root directory, `npm run build` as the build command, `dist` as output, and `NODE_VERSION=24.19.0`. This project has not been deployed.
