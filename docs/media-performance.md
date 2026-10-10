# Native media and local performance — 10 October 2026

The LocalWP implementation is complete. The **97–100 performance target is not achieved** in this workstation's measured environment. These are local Lighthouse results, **not Google PageSpeed Insights results**. No public staging URL exists; nothing was deployed or pushed. The original Figma document was not modified.

## Assets and CMS

| Item | Result |
| --- | --- |
| Original assets audited | 90: 21 PNGs and 69 SVGs |
| Used source assets | 89; `vector.svg` unused |
| Duplicate originals | `vector1019.svg` / `vector1022.svg`; one attachment reused |
| Original source bytes | 10,875,049 (10.88 MB) |
| Optimised master bytes | 2,979,472 (2.98 MB), including the duplicate export |
| Master-byte reduction | 72.60% |
| Generated modern masters | 7 AVIF photos/textures, 14 lossless WebP branding/avatars, 68 sanitised SVG exports |
| Responsive variants | 95, totalling 6,321,492 bytes; these are storage, not one-page downloads |
| Generated files | 184 masters/variants; deduplication yields 183 uploaded media files |
| Native Media Library | 88 unique attachments backing 89 semantic fields |
| Complete optimised set | 9.30 MB including every responsive variant; unique uploads omit the duplicate SVG |

Originals are retained in `oxen-original-assets/images` and `oxen-original-assets/fonts`, beside this Local site's `app` directory, outside the public web root. They also remain recoverable from checkpoint `checkpoint/media-performance-0564059`. Public raw PNGs/TTFs have been removed. Satoshi remains its original unmodified, locally licensed WOFF2 files; redistribution remains prohibited. Noto Serif and Playfair Display use OFL Latin WOFF2 subsets, preserving outlines, kerning, hinting and OpenType features, including Māori macrons. Their combined source fonts decreased from 1,043,704 to 80,692 bytes.

Photos were oriented and colour-managed to sRGB, stripped of metadata, and encoded with AVIF quality 90 / 4:4:4. Lossless WebP retains exact transparent branding pixels. The photo presentation-scale mean channel errors stayed below 1.1/255. Original/optimised portraits, gradients, logos and photos were inspected, then compared in the rendered page. No asset was stretched or replaced with stock artwork.

Edit **Pages → Home → Meta Boxes → Oxen homepage images**. Expand WordPress's native Meta Boxes pane if collapsed. Each field uses the native Media Library picker, stores an attachment ID in registered `_oxen_media` page meta, and supports Reset to the imported original. Fields cover hero portrait/background, team photo/avatars, case studies, testimonial background, six partner logos, Google/site/RBP branding, masks, corner marks and decorative artwork. Some original decorative assets are intentionally shared by multiple components. Missing/invalid custom IDs fall back to the imported mapping; absent defaults omit the missing image safely. Configure missing defaults before reviewing the design.

The REST schema whitelists semantic fields and integer IDs. Save operations require a valid nonce, page-edit and upload capabilities, and exclude autosaves/revisions. SVG uploads remain disabled. The CLI importer independently verifies file hashes, actual raster MIME and a passive SVG allowlist, rejecting scripts, event attributes, foreign objects, entities and external references. Only validated imported SVGs receive the trusted marker and native library previews.

## Reusable setup and migration

Use this checkout's `tools/local-wp.ps1` to run **LocalWP PHP 8.2.29**, including GD, fileinfo and EXIF. The launcher is intentionally site-specific; adapt its database port on another Local installation.

```powershell
# Development dependencies only; never loaded by the website.
npm install --prefix tools/performance-runtime --no-save --package-lock=false lighthouse@13.5.0 clean-css terser
# Python requires Pillow with AVIF/WebP and colour management, plus lxml.
python tools/optimize-media.py --source '<private-original-images-directory>'
./tools/local-wp.ps1 eval-file tools/import-media.php tools/media-build/optimized
# Repeating the importer reuses attachments/IDs; verified: created 0, reused 89.
node tools/build-performance.cjs
```

The import manifest/build intermediates are ignored. Importing uses native attachment insertion and metadata generation, with pre-optimised uncropped variants registered in attachment metadata. No image processing happens on frontend requests. Recompression updates attachment records in place; custom Home selections are preserved. `tools/prune-media-variants.php` removes only unreferenced older Oxen variants within this site's uploads, excluding files referenced by any attachment. It removed 52 superseded variants (9,554,038 bytes).

`tools/subset-fonts.py <private-original-fonts-directory>` requires fontTools and Brotli. `tools/install-fonts.ps1` obtains only the reviewer's own original Satoshi files and does not overwrite verified CSS. Maintained component CSS/JS remain readable; `assets/dist` contains checked-in delivery files. Rebuild delivery files after source changes. Do not run `build-homepage.py`.

For an eventual authorised migration, move the WordPress database **and uploads**, plus this theme and the reviewer's licensed Satoshi files. Keep attachment IDs, Home `_oxen_media` meta, the `oxen_media_library` option, menu assignments and static Home configuration together. Use a serialisation-aware WordPress URL replacement during migration. Media URLs and CSS masks resolve from WordPress APIs; production code contains no LocalWP media domain/path. The private original archive is a reference/build source, not a public upload directory. Recheck missing attachments and all MIME responses after migration. No staging configuration was created.

## Delivery improvements

- Native responsive `srcset`, explicit geometry, async decoding, lazy loading below the fold, and crop-aware `sizes`. Automatic browser sizing is scoped off for these transformed components because it caused blank/cropped desktop photo rendering; standard WordPress content remains unaffected.
- Media-specific LCP preloads: portrait below 1440px, texture from 1440px. The mobile composition does not download the hidden desktop texture. Hero images are eager.
- Inlined minified above-the-fold CSS; remaining homepage CSS loads asynchronously with a no-JavaScript fallback. Standard pages load only the shared shell.
- Eight small minified, deferred vanilla JS modules; existing component handlers and animations preserved. The WordPress emoji compatibility runtime is removed; native emoji still render.
- Locally hosted WOFF2 fonts, swap display, two essential font preloads, versioned CSS/JS and one bulk attachment/meta cache prime per request. No plugins added.
- Oxen's LocalWP Nginx lacked AVIF/WebP MIME mappings. Its two site templates and corresponding live files were backed up, patched and syntax-validated before reloading **only site WQ8J8IEwe**. Modern images now return correct MIME types and the site's existing `max-age=300, public` local cache policy. Other installations were not touched. The idempotent helper is `tools/configure-local-media.ps1 -SiteId WQ8J8IEwe`.

Production hosting should provide correct AVIF/WebP/SVG/WOFF2 MIME types, compressed HTML/CSS/JS, appropriate cache lifetimes/CDN handling and cache invalidation after media updates. This task did not configure a public server. Local security injection also changes the delivered HTML; the theme cannot control that response transformation.

## Verification

One consolidated functional regression passed at **1440, 1920, 768 and 390px**: full-width geometry, shared header/footer, quiz/recommendation/Back/restart, company/sole-trader calculator, animated accordion including rapid clicks, slider boundaries, modal flows, mobile menu, logo autoplay/pause/reduced motion and browser errors. Section geometry matched the baseline exactly.

Screenshot comparison caught and corrected the native auto-sizing issue; only affected image captures were repeated. Final full-page mean RGB differences were 0.24/255 at 1440px, 0.14 at 1920px, 0.32 at 768px and 0.20 at 390px. Differences reflect responsive resampling, colour management and compression; no copy, layout or visible design change was introduced. Captures are in ignored `tools/screenshots/media-performance/`.

The targeted CMS pass verified the native picker, secure save callback, a replacement reaching the frontend, invalid IDs rejected, assignments restored, SVG upload restrictions and reusable standard-page shell. All **183 media URLs** returned HTTP 200 with their expected MIME types; all native metadata/files were present. No broken images were found. PHP 8.2.29 syntax passed for all 72 PHP files inspected. Admin JavaScript syntax passed.

Interaction Event Timing samples during real quiz/calculator/accordion clicks measured maxima of **120ms desktop / 16ms mobile** in local Chrome. These are small unthrottled lab samples, **not field INP or proof of a production INP percentile**. Field INP needs real-user data on an accessible deployment.

## Local Lighthouse measurements

Lighthouse **13.5.0**, headless installed Chrome, standard simulated mobile and desktop presets, performance category, fresh audit storage. Mobile is 412×823 / DPR 1.75 / simulated 4× CPU slowdown; desktop is 1350×940 / DPR 1 with its standard preset. The desktop preset uses the existing compact composition below the Figma reference width. Separate visual tests cover exact 1440px and wider layouts. No content, animations or security software were disabled for audits.

| Mode | Three scores | Median | Median LCP | Median CLS | Median TBT | Median FCP | Median Speed Index | Median payload | Median JS execution |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Mobile | 59, 58, 56 | **58** | **10.42s** | **0** | 165.5ms | 5.80s | 6.25s | 1.70 MB | 1.56s |
| Desktop | 93, 91, 92 | **92** | **1.63s** | **0.0010** | 0ms | 0.98s | 0.98s | 1.74 MB | 0.38s |

Desktop's worst observed CLS was 0.0617, still below 0.1. Mobile's highest TBT was 207.5ms. Baseline scores were mobile 52 / desktop 65; mobile LCP was 64.1s and desktop 10.3s. The optimised mobile network payload is substantially smaller despite the retained external security overhead.

After the MIME/cache-header correction, **one affected-metric check per mode** returned mobile **58** (LCP 10.53s, CLS 0, TBT 148ms) and desktop **93** (LCP 1.64s, CLS 0.0010, TBT 0). The three-run medians above are the grouped theme optimisation batch; these subsequent checks validate the server correction separately. Raw `.lhr.json` files and settings are retained locally, not selected by best score.

**Remaining measured limitation:** Kaspersky injects `main.js` (~258 KB), render-blocking `main.css` (~216 KB), and initialisation traffic into the local browser. In mobile run 2, its domain contributed **927,792 of 1,697,212 transferred bytes (54.7%)**, approximately 1.52s of scripting, and the two render blockers were attributed 4.06s and 3.80s durations. They are absent from theme sources and were not disabled, filtered or excluded from the scores. The theme's largest measured image opportunities were reduced through responsive delivery and controlled recompression; the remaining image hint is ~70–78 KiB, where more aggressive compression risks fidelity. There are no remaining theme CSS render blockers in these reports.

The mobile LCP and 97–100 acceptance targets therefore remain unmet in this measured environment. Public **Google PageSpeed Insights has not been run**. Audit the real public deployment once the user supplies and authorises staging; no score without this workstation injection has been inferred or claimed.

Native image API reference: [WordPress `wp_get_attachment_image()`](https://developer.wordpress.org/reference/functions/wp_get_attachment_image/). Audit method: [official Lighthouse throttling documentation](https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md).

## Changed files

- `functions.php`, `header.php`, `footer.php`; `inc/media.php`, `inc/media-manifest.json`, `inc/performance.php`, `inc/visuals.php`, `inc/class-oxen-menu-walker.php`, `inc/home-services.php`, `inc/home-process.php`.
- Image references in `template-parts/home/{hero,statistics,quiz,services,about,process,results,testimonials,partners,tax-intro,calculator,contact}.php`; existing wrappers and component structure retained.
- Background/mask references in `assets/css/{hero,quiz,services,about,process,testimonials,calculator}.css`, updated `fonts.css`, new `media-admin.css`/`assets/js/media-admin.js`, three WOFF2 subsets and eleven `assets/dist` delivery files.
- Original public `assets/images` files and the three TTF files removed after private backup and native import.
- `tools/{local-wp,install-fonts,configure-local-media}.ps1`, media audit/optimisation/import/pruning/subsetting/build/verification/audit tools, `.gitignore`, `README.md` and this report. Original homepage generator and functional JavaScript component sources were not modified.
- Outside Git: this site's database/uploads; LocalWP Nginx `site.conf.hbs` and `includes/mime-types.conf.hbs` plus their two live equivalents. Backups are adjacent with `.oxen-media-backup` suffixes.
