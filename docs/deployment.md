# Oxen public deployment — 10 October 2026

Status: deployed and verified at https://oxen.iva.lk. Source branch: `develop`.

## Scope and migration

- Strict SSH host-key checking; authenticated as `ivalqsuq` on port 21098.
- cPanel verified the isolated root `/home/ivalqsuq/oxen`. It initially contained only hosting default directories, which were backed up and retained.
- Created a dedicated Oxen database and user with privileges limited to that database. No unrelated domain, directory, database or account PHP setting was changed.
- Official WordPress 7.1.3, Oxen theme, Home page 11 and its selectable homepage template are active. Primary and four footer menu locations retained their assignments.
- Migrated 12 database tables, 88 attachments, 89 media fields and 183 upload files. Payload SHA-256 checks passed. Serialized-aware URL replacement skipped GUIDs; the post-migration dry run found zero remaining localhost replacements outside GUIDs.
- Original licensed fonts were deployed. The existing logo attachment is the native WordPress site icon; no additional image import was necessary.
- HTTPS certificate validation and HTTP-to-HTTPS redirect passed. Oxen alone uses PHP 8.2.34 with mysqli, mbstring, GD, fileinfo and OPcache. The provider's full php.ini override caused 503 responses and was removed; its documented domain handler works without it.
- Production debug is disabled, the configuration is protected, directory indexing is disabled, and static assets have cache headers. Server-side Brotli compression was confirmed directly from the hosting server.
- Migration backups and credentials remain outside the public document root with restricted permissions. WP-CLI unexpectedly echoed the initial database password; it was immediately rotated, and that password is no longer valid.

## Verification

One consolidated public component pass covered 1440, 1920, 768 and 390 pixels: quiz and Back flow, calculator results, inline animated accordion, testimonial boundaries, partner animation/pause/reduced motion, service/comparison/contact dialogs and mobile navigation. Images decoded and there was no horizontal overflow.

The homepage ends at the dark Contact CTA with no footer markup. The standard Sample Page retains its header and footer. Browser errors are absent after assigning the site icon. LocalWP continues to load with its original URL and homepage configuration. All 28 deployed theme PHP files passed syntax checks.

The geometry comparison initially failed because its arrays used different ordering; comparing the saved results in the same order confirmed exact agreement with the verified local geometry, excluding the intentionally removed footer. No component test rerun was needed.

Public mobile first-load testing revealed the portrait moving from the top of the hero to below its content. `template-parts/home/hero.php` now places the content before the portrait in source order. This preserves the final layout, artwork and CSS. A targeted slow-network check measured CLS 0.0019, and a separate geometry check preserved all four viewport layouts. No other interactions were changed.

## Public performance results

Google PageSpeed Insights, Lighthouse 13.5.0, report captured at 23:02 GMT+5:30 on 10 October:

| Mode | Performance | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: |
| Mobile | 85 | 2.0 s | 0.28 | 0 ms |
| Desktop | 100 | 0.4 s | 0.004 | 0 ms |

Report: https://pagespeed.web.dev/analysis/https-oxen-iva-lk/ktvcuegzzr?form_factor=mobile

The unauthenticated API returned quota error 429; the public web interface successfully ran the audits. The desktop target is met. Mobile remains below 97–100: Google's recheck still reports a portrait/font-related shift despite the improved targeted browser result. This discrepancy remains unresolved; no further repetitive audit loop was run. Google also flags small image/cache savings, contrast, an image aspect-ratio warning and a missing meta description. No CrUX field data or field INP is available for this new domain.

Separate workstation Lighthouse measurements against the public URL, before the source-order correction, were 44 mobile / 63 desktop. These included roughly 911 KB of Kaspersky-injected resources and incomplete-load warnings; they are not Google PageSpeed results or final post-fix performance measurements. Endpoint protection was not disabled or filtered.

Screenshots and raw diagnostics are local, ignored deployment artifacts. This machine retained a negative DNS cache; browser QA used the independently verified public IP with certificate validation intact. Google DNS, the hosting resolver and Google PageSpeed verified the public destination without that browser mapping.

The Figma file was not modified. No homepage generation, staging setup, force push or main-branch merge was performed.
