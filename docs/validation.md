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
| Responsive sizes | 1440, 1280, 1024, 768, 390 and 320px; no horizontal overflow |
| Mobile menu | Open, Escape and close at responsive widths |
| Local hostname test | Browser-only mapping reaches `oxen-development.local:10016` |

## Visual comparison

Original Figma frame: **1440 × 8443**. Browser page including all footer children: **1440 × 9072**. Side-by-side comparisons were reviewed for every section at 1440px, followed by full mobile and tablet captures. Corrections included image mask placement, source paint order, artwork clipping, text wrapping, the hero blur, partner-logo blending, responsive heading/grid placement, calculator columns and component reading order.

[visual-metrics.json](visual-metrics.json) records the final per-section mean absolute RGB channel difference against the original screenshot, on a 0–255 scale. It is a raw rendering comparison, **not a percentage of design accuracy**. Browser antialiasing, blur/mask compositing, native select controls and the added previous-slide control leave nonzero differences. Source measurements, fonts and original assets remain the basis of the implementation. No pixel-identical claim is made.

The original 8443px screenshot does not include the footer that extends below the frame. That portion was implemented from the original child-node measurements and reviewed in browser captures.

Screenshots, side-by-side section comparisons and complete audit JSON are retained locally in `tools/screenshots/` and excluded from Git. The WordPress theme preview is included as `screenshot.png`.

## Accessibility findings

axe-core 4.10.3 audited WCAG 2 A/AA, WCAG 2.1 A/AA and best-practice rules:

- **Original desktop palette:** 21 nodes flagged for text contrast; no other automated violations. These colours are present in the source design, including section labels, footer labels and the white tax-introduction text on the pale background.
- **Higher-contrast mode at 1440px:** zero automated violations.
- **Higher-contrast mode at 390px:** zero automated violations.

The footer contrast toggle is keyboard accessible, respects the operating-system contrast preference and preserves the default Figma colours. Native dialogs and the mobile menu were checked for Escape behavior and focus restoration. Automated auditing does not establish full WCAG conformance or replace a screen-reader usability review. The original colour version does not meet all text-contrast requirements.

## Environment and source limitations

Satoshi is installed locally but intentionally excluded from Git because Fontshare prohibits repository redistribution. Reviewers must run `tools/install-fonts.ps1` to obtain their own original files. Noto Serif and Playfair Display are included with OFL license texts. The non-rendering wrapper font `Noto Sans Devanagari UI Condensed` was unavailable; its visible child spans explicitly use Noto Serif.

The LocalWP Imagick dependency startup warning remains. The theme does not require it; PHP lint, activation and browser rendering succeed. The canonical localhost URL works without Windows administrator access. A system-wide hosts edit was unavailable; the alias is resolved inside the test browser only.

Only the first quiz state and one testimonial are supplied by Figma. Additional quiz behavior and client-story slides are documented in README. No booking backend or authenticated social destination was supplied. Booking controls provide real telephone/email options, and footer destinations use verified official pages or clearly labelled local dialogs.

IRD business and individual tax rates were checked against the official pages linked in README. The calculator is an indicative income-tax estimate with the documented partnership assumptions and exclusions.
