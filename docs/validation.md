# Implementation validation — 9 October 2026

The active theme is **Oxen 1.0.0**, on `develop`, in the LocalWP theme directory. Validation used LocalWP PHP **8.2.29** and Chrome against **http://localhost:10016**. No files were modified in Figma, and nothing was pushed or deployed externally.

## Completed checks

| Check | Result |
| --- | --- |
| WordPress activation and final WP-CLI theme status | Active |
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

[visual-metrics.json](visual-metrics.json) records the final per-section mean absolute RGB channel difference against the original screenshot, on a 0–255 scale. It is a raw rendering comparison, **not a percentage of design accuracy**. Browser antialiasing, blur/mask compositing, native select controls and the added previous-slide control leave nonzero differences. Source measurements, fonts and original assets remain the basis of the implementation. No pixel-identical claim is made.

The original 8443px screenshot does not include the footer that extends below the frame. That portion was implemented from the original child-node measurements and reviewed in browser captures.

Screenshots, side-by-side section comparisons and complete audit JSON are retained locally in `tools/screenshots/` and excluded from Git. The WordPress theme preview is included as `screenshot.png`.

## Full-width layout correction

Removed the outer 1440px section width and fixed grid track. Section backgrounds now span the browser, including navigation, hero artwork, statistics, content, calculator, CTA and footer. Wide layout rules use source-derived percentage anchors, four fluid statistics/service tracks, bounded copy widths and proportional portrait sizing. Nested image containers and decorative backgrounds were corrected rather than stretching the entire page. Below 1440px, Grid/Flex reflow replaces the old intermediate page-zoom behavior.

The **1440 × 9072** page retains its original section geometry and measured CSS. An intermediate capture matched the saved pre-fix browser capture pixel-for-pixel. The final capture's mean absolute RGB difference is **0.00283** on a 0–255 scale, with differences confined to the hero's compositing area. This confirms that this correction preserved the previous reference layout; the original Figma comparison retains the nonzero rendering differences documented above.

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

Browser interaction, font/image, error, viewport and accessibility checks were rerun. Screenshot comparisons against the checkpoint show **zero changed pixels at 1440, 1600, 1920, 1024 and 390px**. At 2560px, page dimensions and source files are unchanged; raw mean RGB difference is **0.03274** on a 0–255 scale. All 14 section bounds and complete-footer captures pass. Original Figma comparisons were also regenerated from the read-only local source capture. Figma was not modified.

## Accessibility findings

axe-core 4.10.3 audited WCAG 2 A/AA, WCAG 2.1 A/AA and best-practice rules:

- **Original desktop palette:** 21 nodes flagged for text contrast; no other automated violations. These colours are present in the source design, including section labels, footer labels and the white tax-introduction text on the pale background.
- **Higher-contrast mode at 1440px:** zero automated violations.
- **Higher-contrast mode at 2560px:** zero automated violations.
- **Higher-contrast mode at 390px:** zero automated violations.

The footer contrast toggle is keyboard accessible, respects the operating-system contrast preference and preserves the default Figma colours. Native dialogs and the mobile menu were checked for Escape behavior and focus restoration. Automated auditing does not establish full WCAG conformance or replace a screen-reader usability review. The original colour version does not meet all text-contrast requirements.

## Environment and source limitations

Satoshi is installed locally but intentionally excluded from Git because Fontshare prohibits repository redistribution. Reviewers must run `tools/install-fonts.ps1` to obtain their own original files. Noto Serif and Playfair Display are included with OFL license texts. The non-rendering wrapper font `Noto Sans Devanagari UI Condensed` was unavailable; its visible child spans explicitly use Noto Serif.

The LocalWP Imagick dependency startup warning remains. The theme does not require it; PHP lint, activation and browser rendering succeed. The canonical localhost URL works without Windows administrator access. A system-wide hosts edit was unavailable; the alias is resolved inside the test browser only.

Only the first quiz state and one testimonial are supplied by Figma. Additional quiz behavior and client-story slides are documented in README. No booking backend or authenticated social destination was supplied. Booking controls provide real telephone/email options, and footer destinations use verified official pages or clearly labelled local dialogs.

IRD business and individual tax rates were checked against the official pages linked in README. The calculator is an indicative income-tax estimate with the documented partnership assumptions and exclusions.
