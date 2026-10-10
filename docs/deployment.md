# Oxen deployment and assessment results

The completed theme is deployed at [https://oxen.iva.lk](https://oxen.iva.lk), from branch `develop`. The homepage uses the selectable Oxen Homepage template; standard pages retain the shared header and footer. The homepage intentionally ends at the dark Contact CTA.

## Production configuration

WordPress 7.1.3 and PHP 8.2.34 run in the dedicated Oxen document root and database. The migration retained 12 tables, 88 Media Library attachments, 89 semantic media assignments, 183 uploads and all menu assignments. Serialized URLs were migrated without replacing GUIDs. Original licensed fonts are self-hosted. No unrelated website or database was changed.

HTTPS validation and the HTTP-to-HTTPS redirect passed. Production debugging is disabled; `wp-config.php` is protected with mode 0600. Directory indexing is disabled, and static assets use caching and Brotli compression. Backups are private, outside the document root with restricted permissions. The initial database credential was rotated immediately after a CLI utility unexpectedly echoed it; that credential is no longer valid.

## Recorded verification

The deployment verification covered quiz/recommendations/Back, calculator results, the inline animated accordion, testimonial boundaries, partner autoplay/pause/reduced motion, service/comparison/contact dialogs, mobile navigation, image loading and shared standard-page templates. Desktop, tablet and mobile layouts had no horizontal overflow. All 28 deployed PHP files passed syntax checks. The hero source-order correction preserved the established layout.

## Measured performance — 10 October 2026

Public Google PageSpeed Insights, Lighthouse 13.5.0:

| Mode | Performance | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: |
| Mobile | 85 | 2.0 s | 0.28 | 0 ms |
| Desktop | 100 | 0.4 s | 0.004 | 0 ms |

[Public report](https://pagespeed.web.dev/analysis/https-oxen-iva-lk/ktvcuegzzr?form_factor=mobile).

The desktop target is met; mobile remains below the requested 97–100. Google's recheck still reported a portrait/font-related shift despite a targeted browser measurement of CLS 0.0019 after the hero source-order correction. That discrepancy is unresolved. The audit also flagged small image/cache savings, contrast, an image aspect-ratio warning and a missing meta description. No CrUX field data or field INP was available for the new domain.

These are separate from workstation Lighthouse measurements. Earlier isolated LocalWP medians were mobile 61 / desktop 93. Workstation audits of the public URL before the source-order correction were 44 / 63, with Kaspersky-injected resources and incomplete-load warnings; they are not Google PageSpeed results or final post-fix scores. Endpoint protection was not disabled or filtered. Production browser QA used a verified public-IP mapping to bypass this workstation's negative DNS cache, while preserving HTTPS certificate validation.

The cleanup preserves the finished runtime and these assessment limitations. It does not rerun Lighthouse, regenerate the homepage, modify Figma or rewrite Git history.
