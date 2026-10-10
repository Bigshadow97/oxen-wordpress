# Local LCP investigation — 10 October 2026

**The 97–100 requirement is not achieved.** The verified theme fixes are committed locally; performance acceptance remains open. These are local Lighthouse 13.5.0 / Chrome 154 results, not public Google PageSpeed Insights. No deployment, push, staging configuration, Figma edits or homepage regeneration occurred.

## Diagnosis before changes

The original mobile LCP is Jeremy's portrait:

- Selector: `.hero__portrait-frame > .hero__portrait-image`.
- Native WordPress URL: `http://localhost:10016/wp-content/uploads/2026/10/hero_portrait-960w-1.avif`.
- At Lighthouse's 412px viewport: x20/y561, 372×340px visible image box; approximately 80KB transferred. The crop requires more source width than the clipped box.
- Responsive preload, high request priority and eager loading all pass Lighthouse's discovery checks. The image was already discoverable in initial HTML. Fonts use local WOFF2 subsets and `font-display: swap`; theme JavaScript is deferred and non-critical CSS is asynchronous.

The original `mobile-2.lhr.json` LCP breakdown is **observed**, whereas the headline 10.42s uses Lighthouse's standard simulated mobile model. Mixing these time bases would give a misleading breakdown:

| Observed subpart | Before | After, isolated mobile run 1 |
| --- | ---: | ---: |
| TTFB | 136.68ms | 117.83ms |
| Resource load delay | 10.82ms | 10.55ms |
| Resource load duration | 14.38ms | 13.15ms |
| Element render delay | 2,030.61ms | 1,058.45ms |
| Observed LCP total | 2.192s | 1.200s |

Previous reports did not retain Chrome traces. This investigation captured an initial trace and traces for the first final run of each environment/device pair.

The top three measured bottlenecks were:

1. **Environment-injected blocking resources and document transformation.** Kaspersky `main.js` transferred 258,256B and `abn/main.css` 216,143B. They were the only render blockers. The old report estimated approximately 2.9s of FCP savings; its estimated LCP savings were zero, so this is not a proven 2.9s LCP reduction. Total vendor traffic was 927,792B, 54.7% of the old mobile transfer. The dependency tree also includes a roughly 448KB vendor initialization response and polling. The browser receives a much larger, uncompressed document than the origin's gzip response.
2. **Injected main-thread work.** Old mobile script evaluation totaled 1,576ms; Kaspersky accounted for 1,521ms of scripting. Style/layout added 467ms. The old report contained 19 long tasks and median TBT of 165.5ms. Desktop TBT was already zero; its slower FCP/LCP still lowered the score.
3. **Theme carousel startup forced layout.** The captured diagnostic identifies `partners.min.js` forcing 32.8ms of observed layout/style work through synchronous sizing and repeated animation lookups. The old report attributed a 184ms modeled long task to this module. Its actual scripting was only 3.6ms; layout attribution must not be mistaken for 374ms of JavaScript execution.

DOM size is 1,060 elements, maximum depth 11 and maximum siblings 21. Unused CSS in the old report was predominantly injected vendor styles, including 215,864B of vendor stylesheet and three injected selector lists. No image masks, blur effects, typography or component structure were changed without evidence. Remaining image-delivery estimates are small: about 7.7KB for the hero and 21.5KB for the below-fold CFO background in the first final mobile report.

## Focused fixes

- Carousel initialization now consumes the initial and subsequent `ResizeObserver` border-box measurements. It reuses the CSSAnimation instead of immediately looking it up again after a style write. Pixel position, 24px/s linear speed, pause/resume, resizing and reduced-motion behaviour remain intact. A scheduled legacy fallback remains available.
- The dedicated homepage, which does not render Gutenberg content, omits unused WordPress block/classic/global styles. Standard pages and the editor retain them. This removes 14,108B from origin HTML: 206,811B → 192,703B. Compressed delivery falls from 29,462B → 26,797B.
- Only the changed delivery JavaScript was rebuilt. Native Media Library IDs/URLs, image variants, loading priorities and responsive crops remain in place. Existing gzip and local cache headers remain intact; no speculative server cache or security configuration changes were made.

Final traces contain no carousel-attributed forced layout; Lighthouse's forced-reflow items are empty. Isolated mobile run 1 has seven long tasks and approximately 1,390ms of Kaspersky scripting. Median mobile TBT falls to 35ms. This improvement cannot be assigned wholly to the theme because vendor timing also varies.

## Browser environment comparison

Normal headed **installed Chrome with a task-owned profile** was compared with Lighthouse's fresh isolated headless profiles. Both used the same URL and standard Lighthouse mobile/desktop configurations, cold-cache storage reset, normal motion and all website functionality. Mobile: 412×823, DPR 1.75, standard simulated 4× CPU / 150ms RTT / 1638.4kbps. Desktop: standard desktop preset, 1350×940. Audits ran sequentially without concurrent browser tests.

The normal Chrome connector was unavailable, so the user's daily profile was not inspected or modified. Headed Chrome used only startup/debugging flags; isolated Chrome used standard Lighthouse launch behaviour. No antivirus settings, exclusions, CSP/request blocking or website-resource filtering were applied.

**Neither profile is free of Kaspersky injection.** The origin's direct gzip response contains no Kaspersky code. The final isolated browser document reports 193,561B transfer and no `Content-Encoding` header, versus 26,797B gzip from the origin. Injection outside the theme is established; the precise security interception implementation is not inspected. Both browser variants add approximately 924–928KB of vendor traffic, representing 53.6–55.0% of transferred page bytes.

Headed versus isolated medians differ by +3 mobile points / −1 desktop point and about −2.11s / +0.08s LCP. These are **observed environment differences**, not a causal estimate of removing antivirus injection. No genuinely uninjected Chrome measurement was obtainable. An unchanged-code diagnostic scored 69 when the injected workload was temporarily smaller, demonstrating why an isolated favourable run is not sufficient evidence of acceptance.

## Three-run results

Medians are calculated independently for each metric. Historical comparison uses the original three isolated headless runs.

| Environment / device | Three scores | Median | Median LCP | Median CLS | Median TBT |
| --- | --- | ---: | ---: | ---: | ---: |
| Previous isolated mobile | 59, 58, 56 | 58 | 10.42s | 0 | 165.5ms |
| Previous isolated desktop | 93, 91, 92 | 92 | 1.63s | 0.001012 | 0ms |
| Updated headed mobile | 64, 64, 64 | 64 | 8.29s | 0.002043 | 35ms |
| Updated headed desktop | 92, 92, 92 | 92 | 1.64s | 0.001012 | 0ms |
| Updated isolated mobile | 61, 61, 60 | 61 | 10.40s | 0.002043 | 35ms |
| Updated isolated desktop | 94, 93, 93 | 93 | 1.57s | 0.003389 | 0ms |

**Remaining acceptance issues:** neither device reaches 97; mobile simulated LCP exceeds 2.5s. CLS is comfortably below 0.1 in every final run. The injected network/CPU workload persists in fresh profiles, and therefore the website-only performance score and exact causal score penalty cannot be established here. Public PSI remains pending a user-provided staging URL. There is no evidence that merely lowering photo quality or removing functional/design elements would meet the target appropriately.

## Verification and reproducibility

One consolidated regression passed at 1440/1920/768/390: quiz/Back/recommendation, calculator, accordion/rapid clicks, slider boundaries, service/comparison/contact dialogs, menus, shared shell, carousel autoplay/pause/reduced motion, loaded images and no browser errors. Section geometry matched exactly. Screenshot mean RGB differences from the retained pre-media baseline were 0.234/0.167/0.308/0.193 out of 255, respectively; these include the earlier media conversion. A resize-only carousel check additionally confirmed pixel-offset preservation and 24px/s speed. The standard Sample Page still returns native block/global styles and exactly one header/footer. LocalWP PHP 8.2.29 syntax, JavaScript syntax and Git whitespace checks pass.

Checkpoint: `checkpoint/lcp-investigation-1cc5ab6`. Source changes: `inc/performance.php`, `assets/js/partners.js`; delivery change: `assets/dist/partners.min.js`. Supporting runner: `tools/investigate-lcp.cjs`; documentation: this file and the previous media report's follow-up link.

Raw reports/traces, origin measurement and computed medians remain in ignored `tools/screenshots/lcp-investigation/`; original reports remain in `tools/screenshots/media-performance/`. Run `node tools/investigate-lcp.cjs` for a new complete comparison. `--resume` preserves completed reports solely when resuming an interrupted batch. A headed browser connection failed before the first desktop report; only unfinished audits were resumed, with separate headed processes thereafter. No successful audit or complete regression was repeated.
