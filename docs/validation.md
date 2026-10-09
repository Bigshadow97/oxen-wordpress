# Implementation validation — 10 October 2026

The active theme is **Oxen 1.0.0**, on `develop`, in the LocalWP theme directory. Validation used LocalWP PHP **8.2.29** and Chrome against **http://localhost:10016**. No files were modified in Figma, and nothing was pushed or deployed externally.

## Focused quiz refinement — 10 October

Checkpoint: **`checkpoint/oxen-before-quiz-refinement-e240b82`**. This pass follows the latest instruction to fix quiz states only. The broader stage-list, case-study, testimonial, statistics, skip-panel and footer refinement requests were not included or retested.

Read-only Figma context and screenshot for node **1:331** confirm the 567 × 452.849px first-question card, 26.637px progress circles, 55px answer buttons and original fonts/colours. The original first question keeps its desktop 3+2 arrangement; the four-answer later questions use two equal Grid columns. The same original circle and divider SVG assets are reused. The card remains fluid above 1440px, and the full-width section rules are untouched.

Progress now has three individually labelled steps with active/completed/upcoming states and `aria-current`. Labels wrap within padded buttons; selected classes and `aria-pressed` agree. Header, question, answers, Back and supporting text flow inside the card instead of relying on page offsets. Back restores earlier selections and focuses the question; automatic advancement, restart and the existing recommendation algorithm are preserved.

**Targeted checks passed at 1440, 768 and 390px:** progress states for every question, balanced 2×2 rows, label containment, circle dimensions, header/divider ordering, answer/Back/support spacing, keyboard focus and activation, previous selections, restart and recommendation destinations. No HTTP or JavaScript errors occurred. LocalWP PHP lint passed for the two changed PHP files, and JavaScript syntax passed. Screenshot review found an older responsive ordering rule; it was corrected and only these focused quiz checks were rerun. The full homepage regression suite was not restarted.

First-question crops were compared with the original cached Figma render: raw mean RGB channel difference decreased from **3.242 to 2.414** on a 0–255 scale. This is not a percentage of design accuracy or a pixel-identical claim. Captures for questions 1/3 and recommendations, comparison images and geometry are retained in gitignored `tools/screenshots/quiz-refinement/`.

Changed files: `template-parts/home/quiz.php`, `assets/css/quiz.css`, `assets/js/homepage.js`, `functions.php` (stylesheet loading), `tools/quiz-checks.cjs` and this validation record. There are no remaining known failures in the requested quiz states. No homepage regeneration was performed. The generator's default check is expected to report the deliberately authored quiz-template difference; retain this structure and the existing checkpoint/backup protections rather than overwriting it with generated markup. Earlier full-homepage results below describe their recorded runs, not a new whole-page audit after this focused change.

## Consolidated issue record

| Issue | Status and resolution |
| --- | --- |
| Outer page capped at the Figma frame width | Completed: all 14 sections span the viewport; content and artwork adapt independently above 1440px. |
| Wide quiz badge drift | Fixed: badge and text retain the original measured offsets from Advisory, with no overlap at 1440/1600/1920/2560px. |
| SVG divider length in quiz, calculator and footer | Fixed together: scale the original rotated SVG's inner height to its fluid container. All eight divider bounds pass. |
| Generator overwriting verified corrections | Protected by the existing Git checkpoint, verified backups and non-writing default. No live regeneration was needed for these changes. |
| Reference fidelity and responsive regression | Passed one complete regression after the batched fixes; screenshots compared at all six mandatory widths. Only the sandbox-denied WordPress status check was retried. |
| Original source text contrast | The historical full-page audit flagged 21 source-colour nodes at 1440px. The focused footer correction now passes default text contrast at 1440/1920/768/390px; other source-colour limitations remain. Native `prefers-contrast: more` support is retained in CSS. |
| Font availability and redistribution | All eight rendered original faces load locally. Reviewers must install Satoshi separately under its licence. The unavailable non-rendering wrapper font is documented below; no rendered font was substituted. |
| LocalWP hostname and Imagick | Localhost works and the browser-only hostname mapping passes. System-wide hostname resolution and the unused Imagick startup warning remain environment limitations. |
| Additional source states and booking backend | Only the first quiz state and one testimonial were supplied. Additional behavior is labelled/documented; booking provides the original phone/email options because no backend was supplied. |

There are no remaining known layout or interaction failures from this consolidated implementation queue. The source and environment limitations above remain explicit assessment notes.

## Batched correction verification — 10 October

Changed only the authored wide-screen stylesheet, related browser assertions and validation records. Generated PHP/CSS, existing responsive rules, application JavaScript, original image assets and font files were preserved. The CSS correction applies only above 1440px.

One complete regression passed: all 20 PHP files under LocalWP PHP 8.2.29, both application JavaScript syntax checks, four tax tests, three generator-preservation tests, 90 original asset hashes, active-theme status, browser interactions, fonts/images, HTTP/JavaScript errors and all nine existing viewport checks. Required screenshots at **1440, 1600, 1920, 2560, 1024 and 390px** include the complete footer. Wide quiz and calculator/footer crops were reviewed after comparison; no further implementation changes or full-suite reruns were needed.

The current 1440px capture is pixel-identical to `before-full-width-1440.png`. Compared with the preservation checkpoint, its mean RGB difference is **0.00283** on a 0–255 scale, confined to hero compositing; section geometry is unchanged. The 1024px and 390px captures are pixel-identical to the checkpoint. Wide captures show the intended badge/divider corrections and retain their previous page dimensions. Comparisons against the original Figma screenshot still have the rendering differences documented below; no pixel-identical Figma claim is made.

## Completed checks

| Check | Result |
| --- | --- |
| WordPress activation and WP-CLI theme status | Active |
| Local PHP syntax | All 20 PHP files pass |
| JavaScript syntax | Both application scripts pass |
| Tax calculation tests | 4 pass: source company example/losses, individual thresholds, partnerships, currency validation |
| Source image assets | All 90 original downloads present; SHA-256 hashes match provenance |
| Font loading | All 8 original rendered faces loaded |
| Browser image, HTTP and JavaScript errors | None during tested flows |
| Page sections | All 14 present, including full footer |
| Quiz | All steps, recommendation, back/restart and correct service destination |
| Service previews and comparison | Dialog content, all 4 comparison rows, Escape |
| Booking and case-study dialogs | Open, Escape, focus restoration; dialog Shift+Tab wraps inside |
| Slider | Next/previous and arrow keys, original slide restored |
| Tax UI | Company, sole-trader and partnership results, invalid inputs/recovery, form Tab order |
| Responsive sizes | 1440, 1600, 1920, 2560, 1280, 1024, 768, 390 and 320px; no horizontal overflow |
| Full-width section bounds | All 14 sections start at x=0 and end at the viewport edge at every tested width |
| Wide-screen components | Portrait aspect ratio, non-overlapping service cards, CTA containment, quiz/restart, service dialog and tax calculation pass |
| Mobile menu | Open, Escape and close at responsive widths |
| Local hostname test | Browser-only mapping reaches `oxen-development.local:10016` |

## Visual comparison

Original Figma frame: **1440 × 8443**. Browser page including all footer children: **1440 × 9072**. Side-by-side comparisons were reviewed for every section at 1440px, followed by full mobile and tablet captures. Corrections included image mask placement, source paint order, artwork clipping, text wrapping, the hero blur, partner-logo blending, responsive heading/grid placement, calculator columns and component reading order.

[visual-metrics.json](visual-metrics.json) records the latest per-section mean absolute RGB channel difference against the original screenshot, on a 0–255 scale. It is a raw rendering comparison, **not a percentage of design accuracy**. Browser antialiasing, blur/mask compositing, native select controls and the added previous-slide control leave nonzero differences. Source measurements, fonts and original assets remain the basis of the implementation. No pixel-identical Figma claim is made.

The original 8443px screenshot does not include the footer that extends below the frame. That portion was implemented from the original child-node measurements and reviewed in browser captures.

Screenshots, side-by-side section comparisons and complete audit JSON are retained locally in `tools/screenshots/` and excluded from Git. The WordPress theme preview is included as `screenshot.png`.

## Full-width layout correction

Removed the outer 1440px section width and fixed grid track. Section backgrounds now span the browser, including navigation, hero artwork, statistics, content, calculator, CTA and footer. Wide layout rules use source-derived percentage anchors, four fluid statistics/service tracks, bounded copy widths and proportional portrait sizing. Nested image containers and decorative backgrounds were corrected rather than stretching the entire page. Below 1440px, Grid/Flex reflow replaces the old intermediate page-zoom behavior.

The **1440 × 9072** page retains its original section geometry and measured CSS. The 10 October capture matches the saved pre-fix browser capture pixel-for-pixel. Relative to the preservation checkpoint, its mean absolute RGB difference is **0.00283** on a 0–255 scale, with differences confined to the hero's compositing area. This confirms that this correction preserved the previous reference layout; the original Figma comparison retains the nonzero rendering differences documented above.

Full-page captures and section crops were inspected at all mandatory sizes:

| Viewport width | Section bounds | Horizontal overflow | Capture |
| --- | --- | --- | --- |
| 1440px | All 14 span 0–1440px | None | `desktop-1440.png` |
| 1600px | All 14 span 0–1600px | None | `responsive-1600.png` |
| 1920px | All 14 span 0–1920px | None | `responsive-1920.png` |
| 2560px | All 14 span 0–2560px | None | `responsive-2560.png` |
| 1024px | All 14 span 0–1024px | None | `responsive-1024.png` |
| 390px | All 14 span 0–390px | None | `responsive-390.png` |

Captures are in `tools/screenshots/`. `full-width-layout.json` records section/card/control geometry; `reference-regression.json` records the 1440px before/after comparison. The browser check waits for responsive layout to settle and verifies PNG dimensions include the complete footer. Original assets and fonts are unchanged, and Figma was not modified.

## Generator preservation checkpoint

Created local Git tag **`checkpoint/oxen-verified-full-width-5adfd96`** before checking the generator. A SHA-256 manifest, 27 source-file copies and all six mandatory viewport captures are retained in gitignored `tools/generator-backups/verified-5adfd96/`.

The staged generator check confirms that all **17 generated files** already match the verified theme. No live regeneration was needed. Backed-up theme CSS, PHP, JavaScript and asset mapping remain byte-for-byte unchanged; existing corrections in the generator and separate override stylesheets were retained.

The generator now defaults to a non-writing check. Explicit `--write` requires the current theme directory and `develop`, verifies a backup before applying differences, and leaves matching files and separate authored styles/scripts untouched. Three tests on isolated theme copies pass: default non-writing behavior, preservation/reporting of a manual CSS correction, and backup integrity before an explicit write.

The 9 October preservation check passed browser interaction, font/image, error, viewport and accessibility checks. Its screenshot comparisons against the checkpoint showed **zero changed pixels at 1440, 1600, 1920, 1024 and 390px**. At 2560px, page dimensions and source files were unchanged; raw mean RGB difference was **0.03274** on a 0–255 scale. The subsequent batched correction results are recorded above. Figma was not modified.

## Accessibility findings

axe-core 4.10.3 audited WCAG 2 A/AA, WCAG 2.1 A/AA and best-practice rules:

- **Historical original desktop palette audit:** 21 nodes flagged for text contrast; no other automated violations. This predates the direct footer text-colour corrections below.
- **Historical higher-contrast audit at 1440px:** zero automated violations.
- **Historical higher-contrast audit at 2560px:** zero automated violations.
- **Historical higher-contrast audit at 390px:** zero automated violations.

The footer toggle and its JavaScript, event handlers, device-storage preference and dedicated CSS have been removed. Operating-system contrast preferences are handled directly by CSS. The default footer now uses muted blue `#62759f` (4.60:1) for its four column headings and grey `#727272` (4.81:1) for introduction copy on white. Other original source-colour limitations remain outside this focused footer pass.

The footer-only contrast audit passes at 1440px, 1920px, 768px and 390px. Text, font metrics, content coordinates, column alignment and desktop footer height match the pre-change baseline; removing the button eliminates the extra responsive grid row and its gap. Cookies Policy and social-dialog keyboard activation, Escape and focus restoration pass. A stale saved contrast value no longer changes the page. Native system contrast support passes the mobile footer contrast check. PHP/JavaScript syntax and browser-error checks pass. The full-site regression suite was not rerun for this component fix; its assertions now use native contrast preference emulation and check the control is absent.

## Homepage footer removal — 10 October

Per the updated requirement, `front-page.php` no longer renders the homepage footer. `template-parts/home/site-footer.php` and its exclusive CSS, cookie/social dialogs and JavaScript handlers have been removed. `footer.php` is unchanged: it still calls `wp_footer()` and closes `body` and `html`. The page ends immediately after the Contact CTA; no footer wrapper, reserved height or white space remains. Earlier footer validation entries describe the previous implementation.

Checkpoint: `checkpoint/remove-home-footer-ad141ec`. `tools/footer-removal-checks.cjs` passed at **1440, 1920 and 390px**, checking absent footer HTML, document height ending at Contact CTA, full-width layout, loaded original contact assets, WordPress footer-script output and booking keyboard activation/Escape/focus restoration. Contact content geometry and typography match the pre-removal evidence, and screenshot comparisons have **zero changed pixels** in the retained Contact CTA region at all three widths. Page-end screenshots and results are in ignored `tools/screenshots/footer-removal/`.

LocalWP PHP **8.2.29** lint passed for `front-page.php`, `footer.php` and `dialogs.php`. JavaScript syntax, browser errors and `git diff --check` passed. Consolidated browser assertions now expect the footer to be absent; only the focused removal check was run. Contact files, original Figma data/assets and the homepage generator were untouched.

## Environment and source limitations

### Contact CTA focused correction — 10 October

Checkpoint: `checkpoint/contact-cta-a5ec4cf`. The contact component now uses the original two gradient SVGs and six dashed guides on one right-aligned artboard, with native proportions at desktop widths. Figma's angular graph edges and dotted lines are intentional and retained. The original calculator glow continues into the CTA; separate clipping containers avoid a doubled glow and preserve the source artwork's 59.727px overlap into the calculator transition. The section background stays full-width. Heading, paragraph, button and response geometry at 1440px agrees with the saved original node measurements within 0.15px of browser rounding. Normal-flow content keeps reading widths and alignment stable at larger widths; mobile text precedes the stacked buttons and retains the response dot.

Focused browser checks and screenshots passed at **1440, 1920, 2560 and 390px**: both SVG aspect ratios and shared baselines, continuous calculator/CTA glow coordinates, original copy, viewport width, no clipped copy or controls, button-label fit, keyboard focus, booking-dialog activation/Escape/focus restoration, telephone destination and hover state. No browser console/page errors occurred. LocalWP PHP **8.2.29** lint passed for `contact.php` and `functions.php`; `git diff --check` passed. The full-site suite was not rerun.

Evidence is stored locally in ignored `tools/screenshots/contact/`: before/after screenshots, `report.json`, `1440-reference-overlay.png` and `visual-comparison.json`. Comparison uses the saved original Figma node data, SVG assets and reference PNG; live MCP access was previously quota-limited. The PNG ends at y8443, so its visual overlay covers the transition and first 423px of the CTA; the remaining 80px is checked against the original SVGs and node bounds. Background RMS difference in the available comparison region fell from 4.84 to 1.76 per RGB channel (0–255), excluding text rasterization. Figma and its original assets were not modified, and the homepage generator was not run.

Satoshi is installed locally but intentionally excluded from Git because Fontshare prohibits repository redistribution. Reviewers must run `tools/install-fonts.ps1` to obtain their own original files. Noto Serif and Playfair Display are included with OFL license texts. The non-rendering wrapper font `Noto Sans Devanagari UI Condensed` was unavailable; its visible child spans explicitly use Noto Serif.

The LocalWP Imagick dependency startup warning remains. The theme does not require it; PHP lint, activation and browser rendering succeed. The canonical localhost URL works without Windows administrator access. A system-wide hosts edit was unavailable; the alias is resolved inside the test browser only.

Only the first quiz state and one testimonial are supplied by Figma. Additional quiz behavior and client-story slides are documented in README. No booking backend or authenticated social destination was supplied. Booking controls provide real telephone/email options, and footer destinations use verified official pages or clearly labelled local dialogs.

IRD business and individual tax rates were checked against the official pages linked in README. The calculator is an indicative income-tax estimate with the documented partnership assumptions and exclusions.
