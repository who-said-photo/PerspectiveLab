# Photography Perspective Lab: project brief

## Purpose and relationship

A compact educational photography website for photographers, teachers and camera clubs. Help visitors understand viewpoint and framing, support natural educational backlinks and direct interested readers to relevant WhoSaidPhotography.com education. The lab is created by Who Said Photography. Always keep the supplied linked footer attribution. No separate About page.

## Routes

1. `/`: learning hub with a prominent simulator entry.
2. `/perspective-simulator/`: interactive landscape, camera controls, fixed/matching modes and A/B comparisons.
3. `/how-perspective-works/`: perspective relationships.
4. `/camera-distance-perspective/`: near-to-far apparent scale.
5. `/focal-length-vs-perspective/`: field of view versus viewpoint.
6. `/landscape-perspective/`: layers and overlap.
7. `/perspective-challenges/`: five interactive exercises with objectives, checks, solutions and resets.
8. `/perspective-quiz/`: 15-question exam with explanations, answer review, score bands and topic-based lesson recommendations.
9. `/perspective-resources/`: learning sequence and further reading.

Nine editorial pages maximum. The noindex 404 is a utility response, not an additional editorial page.

## Content rules

Canadian English; no em dashes; no portrait-photography material. Write useful, concise original content. Clearly label staged features; do not show inert controls as if they work. No login, database, advertising or ecommerce. No copied photographic assets. Current original geometric diagram is explanatory and explicitly not to scale.

Camera position controls perspective. Focal length controls field of view for a given sensor size. Changing focal length from a fixed viewpoint changes framing, not relative perspective. When matching framing requires movement, state that the movement caused the perspective change. Landscape composition has creative choices, not universally correct outcomes.

## Design and accessibility

Restrained forest green, warm paper, ochre accent, serif headings and system body font. Compact introduction, prominent simulator entry, framing cues and consistent responsive spacing. Semantic headings, visible keyboard focus, skip link, crawlable navigation, native mobile menu and Q&A disclosures. No animation, external fonts or client-side framework. Reading and navigation work without scripts.

## SEO rules

Unique titles/descriptions; exactly one H1 per page; language en-CA; shared Open Graph metadata; trailing slash routes; canonical URLs based only on confirmed SITE_URL. No fabricated host, social image, ratings, reviews or FAQ schema. The completed simulator uses WebApplication structured data without ratings, reviews or unsupported claims. Sitemap includes nine editorial pages and excludes 404. Confirm production origin before publishing. Local unset-origin builds omit canonical and OG URL fields, and do not advertise an empty sitemap in robots.txt.

## External-link policy

Use verified HTTPS URLs with descriptive text and useful context. Ordinary editorial links need no nofollow and open in the same tab. No tracking or affiliate links. Currently use only the explicitly supplied Who Said Photography homepage. Add article-level recommendations after verifying URL and topical relevance; do not guess article slugs.

## Technical decisions

Astro static output with strict TypeScript; npm lockfile; output dist; Cloudflare Pages configuration; no server adapter, APIs or storage. Reusable header, footer, breadcrumb, SEO, lesson layout, callout, Q&A and recommendation components. A local empty PostCSS configuration isolates this nested project from parent configuration. Parent Git deletions are outside scope and must remain untouched. Formatting: Prettier with Astro plugin. Lint/type diagnostics: Astro Check. Node built-in tests validate generated routes, links and metadata. Build errors fail the build; static missing-page handling uses 404.html.

## Simulator implementation

Prompt2 is implemented. The original SVG landscape uses a rectilinear pinhole model with a 36 × 24 mm sensor and a 900 × 600 drawing frame. World distances are metres; sensor and focal lengths are millimetres. Camera is at (lateral, height, -distance), facing +Z with no tilt, roll or yaw. Projected x = 450 + (900 f / 36)(X - lateral)/(Z + distance); projected y = 300 - (600 f / 24)(Y - height)/(Z + distance).

The rock is 1.5 m tall at Z=0, the tree is 7 m tall at Z=18, and the mountain is 45 m tall at Z=180. Original constant-depth polygons provide a lightweight illustrated scene. Camera travel: 3–300 m; focal length: 24–200 mm; height: 0.3–5 m; lateral travel: -6–6 m. The camera never crosses a scene plane. Cropping is real frame clipping, never automatic rescaling.

Matching subject size preserves the rock’s projected height by setting new distance = old distance × new focal / old focal. Manual distance changes establish a new reference. Travel limits clamp distance and explicitly explain incomplete matching. Full-precision internal state prevents cumulative rounding errors. Height changes foreground placement relative to the fixed level horizon. The main simulator remains level. An optional tilt parameter is supported for Horizon Control; volumetric surfaces, lens distortion, depth of field and lighting remain outside this model.

Calculations, educational wording and drawing are separate modules under src/lib/simulator. The browser controller is in src/scripts; the Astro component provides the static default view before JavaScript starts. Controls enable only after successful startup. Native range and numeric inputs, mode radios and a synchronized checkbox work with the keyboard. Meaningful screen-reader updates are debounced. Comparison A/B hold independent in-memory snapshots; camera reset preserves comparisons, and reload clears them. No API, external assets or storage is needed.

Node tests cover model invariants, bounds, reset and snapshots. Playwright tests exercise built output for keyboard input, mode synchronization, comparisons, mobile overflow, no-JavaScript fallback and schema. Browser tooling is development-only.

Before release, confirm the canonical origin and verify selected Who Said Photography article recommendations. The pre-deployment audit remains a separate stage.

## Challenges and final exam

Prompt3 is implemented. Five independently resettable exercises reuse the same scene renderer, projection, control bounds and size calculations as the simulator. Foreground Power checks increased rock dominance; Mountain Presence requires stepping back and reframing; Forest Separation checks a tree crown clearing the mountain summit; Stronger Depth combines near-to-far scale and a visible rock/tree gap; Horizon Control combines height and tilt. Measurements use the 900 × 600 drawing coordinates, not device pixels. Thresholds are explicit practice objectives, not aesthetic judgements. Each exercise has a recommended solution, trade-off and relevant lesson link.

Horizon Control adds optional downward pitch of -12° to +12°. World vertical offset Y and depth Z rotate into camera coordinates: cameraY = Y cos(pitch) + Z sin(pitch); cameraDepth = Z cos(pitch) - Y sin(pitch). The existing projection then divides by cameraDepth. Horizon y = 300 - (600 f / 24) tan(pitch). With zero tilt the original simulator is unchanged. Apparent heights use projected top and bottom positions, preserving a single model for both level and tilted scenes.

Quiz content is structured separately in src/lib/learning/quiz.ts. Exactly 15 questions use four choices and one correct answer each: position 3, focal length 3, scale 3, height 2, landscape 2, misconceptions 2. Each has an explanation and topic tag. Answers are revealed in the interface only after submission and locked for that attempt. Previous/next navigation preserves explanations. Restart creates a fresh attempt. Score bands are 13–15, 10–12, 7–9 and 0–6. Missed topics map to deduplicated lesson links. No personal data, browser storage or API is used; reloading loses progress. This is a learning quiz, not a tamper-resistant examination system.

New browser coverage includes a complete exam with browser storage deliberately blocked, answer review, restart, keyboard operation, every challenge solution/reset, static fallbacks, 320 px layouts and 200% text enlargement. All generated pages retain metadata and one H1. Real assistive technologies, other browser engines and physical low-powered devices remain manual pre-release checks.

## Audit status

Prompt4 is complete locally; see AUDIT_REPORT.md. All nine routes have accessibility, link, metadata and responsive regression coverage. Resources now includes a verified Who Said Photography composition article alongside the homepage attribution. Production SITE_URL and real-device/assistive-technology checks remain release actions. No deployment was performed.

## Site schema

The homepage includes WebSite JSON-LD with the site name, educational description, en-CA language and Who Said Photography as publisher. Its URL and stable identifier come from SITE_URL when configured; localhost and invented production URLs are never emitted. The simulator retains its separate WebApplication schema. No search action, ratings or unsupported organisation details are added. Set the confirmed production origin before release, then validate the published markup.
