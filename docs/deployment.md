# Oxen deployment and assessment results

The completed theme is deployed at [https://oxen.iva.lk](https://oxen.iva.lk), from branch `develop`. The homepage uses the selectable Oxen Homepage template; standard pages retain the shared header and footer. The homepage intentionally ends at the dark Contact CTA.

## Production configuration

WordPress 7.1.3 and PHP 8.2.34 run in the dedicated Oxen document root and database. The migration retained 12 tables, 88 Media Library attachments, 89 semantic media assignments, 183 uploads and all menu assignments. Serialized URLs were migrated without replacing GUIDs. Original licensed fonts are self-hosted. No unrelated website or database was changed.

HTTPS validation and the HTTP-to-HTTPS redirect passed. Production debugging is disabled; `wp-config.php` is protected with mode 0600. Directory indexing is disabled, and static assets use caching and Brotli compression. Backups are private, outside the document root with restricted permissions. The initial database credential was rotated immediately after a CLI utility unexpectedly echoed it; that credential is no longer valid.

## Recorded verification

The deployment verification covered quiz/recommendations/Back, calculator results, the inline animated accordion, testimonial boundaries, partner autoplay/pause/reduced motion, service/comparison/contact dialogs, mobile navigation, image loading and shared standard-page templates. Desktop, tablet and mobile layouts had no horizontal overflow. All 28 deployed PHP files passed syntax checks. The hero source-order correction preserved the established layout.

## Mobile performance refinement — 11 October 2026

Genuine production Google PageSpeed Insights, Lighthouse 13.5.0, using the same mobile/desktop profiles before and after:

| Metric | Baseline, 00:23 GMT+5:30 | After, 00:35 GMT+5:30 |
| --- | ---: | ---: |
| Mobile performance | 86 | 100 |
| Desktop performance | 100 | 100 |
| Mobile LCP | 1.4 s | 1.5 s |
| Mobile FCP | 1.0 s | 0.9 s |
| Mobile TBT | 0 ms | 0 ms |
| Mobile CLS | 0.28 | 0 |
| Mobile Speed Index | 2.1 s | 2.7 s |
| Desktop LCP | 0.5 s | 0.3 s |
| Desktop FCP | 0.3 s | 0.3 s |
| Desktop CLS | 0.004 | 0.001 |

[Baseline report](https://pagespeed.web.dev/analysis/https-oxen-iva-lk/aft1xnp7v8?form_factor=mobile), [verified after report](https://pagespeed.web.dev/analysis/https-oxen-iva-lk/5ssr1atsdh?form_factor=mobile). Values use Google's displayed precision; timings can vary between runs. These are lab measurements, not CrUX field results or workstation Lighthouse scores.

The dominant penalty was the hero portrait moving when fallback heading text rewrapped after Noto Serif loaded. Preloading the regular heading face reduced the shift in LocalWP but the first production recheck still measured CLS 0.28, so that result was not treated as success. The correction adds locally available, metric-adjusted serif fallbacks for both normal and italic headings. Advance widths and vertical metrics were measured against the original faces; the loaded original fonts remain first in the font stack. No font binaries, design dimensions or artwork were modified. The final Google report measures mobile CLS 0 and performance 100.

The portrait remains eager and now has high fetch priority. Its image and preload share sizes derived from the actual mobile width and tablet grid column, preserving the desktop expression. Existing Media Library variants and attachment relationships are unchanged. A cold production trace requested the portrait once.

Verification passed at 390, 768 and 1440 pixels, with identical settled section/hero geometry versus the pre-change production layout, decoded images, no horizontal overflow or browser errors, and working navigation, quiz/Back/restart, calculator, accordion, carousel, testimonials and dialogs. Fallback-only geometry also matched at 412 pixels, Google's mobile reference width. A production stress check delayed original heading fonts by eight seconds: the portrait retained its position, with total CLS 0.00028 including minor button/font-metric shifts. PHP syntax passed on LocalWP 8.2.29 and production 8.2.34; JavaScript source/delivery syntax and `git diff --check` passed.

Only `inc/media.php`, `inc/performance.php`, `assets/css/fonts.css`, `assets/css/base.css` and the corresponding critical/shell delivery CSS were deployed. Private two-file/four-file rollback copies remain outside the public root. No database, CMS setting, optimisation plugin or unrelated hosted website changed.

Google's render-blocking, unused CSS/JavaScript, minification and third-party audits already passed. Existing server checks confirmed Brotli CSS, 30-day CSS caching, one-year font caching and approximately 115 ms same-server HTTPS TTFB, so hosting and script loading were preserved. Remaining hints are about 28 KiB of mobile image delivery and 7 KiB of caching; existing contrast, aspect-ratio and meta-description findings are unchanged. The measured performance target is met; further changes were stopped to preserve fidelity.

## Historical performance — 10 October 2026

Public Google PageSpeed Insights, Lighthouse 13.5.0:

| Mode | Performance | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: |
| Mobile | 85 | 2.0 s | 0.28 | 0 ms |
| Desktop | 100 | 0.4 s | 0.004 | 0 ms |

[Public report](https://pagespeed.web.dev/analysis/https-oxen-iva-lk/ktvcuegzzr?form_factor=mobile).

The desktop target is met; mobile remains below the requested 97–100. Google's recheck still reported a portrait/font-related shift despite a targeted browser measurement of CLS 0.0019 after the hero source-order correction. That discrepancy is unresolved. The audit also flagged small image/cache savings, contrast, an image aspect-ratio warning and a missing meta description. No CrUX field data or field INP was available for the new domain.

These are separate from workstation Lighthouse measurements. Earlier isolated LocalWP medians were mobile 61 / desktop 93. Workstation audits of the public URL before the source-order correction were 44 / 63, with Kaspersky-injected resources and incomplete-load warnings; they are not Google PageSpeed results or final post-fix scores. Endpoint protection was not disabled or filtered. Production browser QA used a verified public-IP mapping to bypass this workstation's negative DNS cache, while preserving HTTPS certificate validation.

The cleanup preserves the finished runtime and these assessment limitations. It does not rerun Lighthouse, regenerate the homepage, modify Figma or rewrite Git history.
