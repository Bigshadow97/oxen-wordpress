# Oxen WordPress homepage

A custom PHP theme built from the original [Oxen assessment Figma file, node 1:3](https://www.figma.com/design/X8BzSNzhFvn61KCmzWsEPY/Oxen-Home-Page---Interview-Assessment?node-id=1-3). The implementation uses HTML5, CSS Grid/Flexbox and vanilla JavaScript. No page builders, frontend frameworks or runtime build step are required.

## Review locally

1. Place this repository in `wp-content/themes/oxen` on WordPress 6.3+ with PHP 8.2+.
2. **Install the original Satoshi files before reviewing.** From the theme directory in PowerShell, run `./tools/install-fonts.ps1`. Each reviewer obtains their own unmodified files from the official font CDNs. The script fails on unavailable downloads instead of choosing another font.
3. Activate **Oxen** in Appearance → Themes, or run `wp theme activate oxen` in Local's site shell. Run `./tools/local-wp.ps1 eval-file tools/configure-wordpress.php` for this LocalWP installation, or create Home, assign **Oxen Homepage**, and select it in Settings → Reading. The selectable `page-templates/template-oxen-home.php` renders the existing sections; `front-page.php` is intentionally absent so WordPress honors the assigned template.
4. Start the Local site. For this checkout, open **[http://localhost:10016](http://localhost:10016)**.

The current site uses Local's **localhost router mode**. The unresolved `oxen-development.local` name is not its configured canonical URL. Local browser tests also map that name to `127.0.0.1` and verify `http://oxen-development.local:10016`. This mapping belongs to the test browser; no global Windows hosts entry was changed. Use the working localhost URL for normal browsing.

All commands in this implementation used LocalWP's **PHP 8.2.29**, rather than the XAMPP PHP on PATH. The executable on this workstation is `%APPDATA%/Local/lightning-services/php-8.2.29+0/bin/win64/php.exe`. The Local site ID is `WQ8J8IEwe`; its PHP configuration is `%APPDATA%/Local/run/WQ8J8IEwe/conf/php/php.ini`. Local's existing Imagick DLL dependency warning remains an environment issue; the theme renders successfully and does not require Imagick.

## Homepage and interactions

The page includes navigation, hero, statistics, quiz, all four service tiers, about/team, onboarding process, case studies, testimonial slider, partner logos, tax introduction, calculator, contact and the complete footer.

- The three-question quiz supports back/restart and links to the recommended service. Its first question and visible options match Figma. Figma supplies only the initial quiz state, so the two later questions and recommendation behavior are implemented locally.
- Service previews and comparison use the original card content. Booking buttons open contact options with the original telephone and email; they do not pretend to submit an appointment to an unavailable booking service.
- The slider has previous/next and arrow-key controls. It starts with the supplied Amanda testimonial. The additional slides use the two supplied case studies, explicitly labelled **Client stories**. No testimonials have been invented.
- The tax calculator validates revenue/profit, supports companies, sole traders and equal-share partnerships, and announces results/errors. It calculates locally without sending financial inputs elsewhere.
- Native dialogs support Escape, focus containment and focus restoration. The mobile navigation supports Escape. Skip navigation, semantic headings, form labels, image alternatives, visible focus and reduced-motion preferences are included.

Footer text contrast is corrected directly: muted column headings and introduction copy meet 4.5:1 against the original white background. There is no extra footer contrast control or stored device preference. CSS respects the operating system's `prefers-contrast: more` preference. Contrast limitations in other original source colours remain documented in [validation](docs/validation.md).

Figma does not supply external link or booking destinations. Verified Oxen service, story, podcast, privacy and social destinations are used where available. News links point to the local client-results section. The Twitter-labelled control opens verified social alternatives; the Spotify-labelled link opens the official podcast page. Cookies Policy explains this implementation's local behavior in a dialog.

## Design data and original assets

Figma remained strictly **read-only**. The source was read using design context, node metadata, screenshots and asset exports. When an export hit the 20-asset cap, smaller node groups were requested. All **90 original PNG/SVG assets** are stored in `assets/images`; the mapping and original-download SHA-256 checksums are in `assets/asset-map.json` and `assets/provenance.json`. No stock-image replacements or recreated icons were used.

Desktop CSS follows the original 1440px coordinates, typography, masks, image cropping, colours and paint order. `data-node-id` attributes preserve source references. The source frame is 1440 × 8443, but its footer children extend to approximately y=9072; the implemented page includes that full footer. The 1440px comparison covers the entire exported frame, and the remaining footer uses the original child measurements. **1440px is the reference viewport, not a maximum page width.** All section containers span the viewport. Above 1440px, percentage anchors, fluid Grid/Flex components and bounded reading widths adapt the composition; photographs use cover/contain crops and the hero portrait scales uniformly. Below 1440px the same semantic content reflows into tablet/mobile layouts, without page zoom.

Rendered fonts are **Satoshi** (400/500 normal and italic, 700 normal), **Noto Serif** (400 normal/italic), and **Playfair Display** (400 normal). Eight original font faces were loaded successfully in browser verification.

- [Satoshi / Fontshare license](https://www.fontshare.com/licenses/itf-ffl): permits self-hosting on one's own website but restricts redistribution through repositories. Satoshi binaries are therefore deliberately gitignored; the setup script obtains each reviewer's own copy. Files are not subset, converted or modified.
- [Noto Serif](https://fonts.google.com/specimen/Noto+Serif) and [Playfair Display](https://fonts.google.com/specimen/Playfair+Display): official Google Fonts files are included with their SIL Open Font License texts.
- The export mentions **Noto Sans Devanagari UI Condensed** on wrapper nodes. That font file was not supplied or obtained. Every visible glyph in those wrappers is explicitly styled with the available Noto Serif face; no visible font substitution was made. A future design change that renders the wrapper font requires its original licensed file.

## Source layout and checks

`header.php` and `footer.php` provide the shared site shell; `page.php` handles standard CMS pages. Appearance → Menus manages Primary navigation and four footer locations. Preserve the `menu-contact` class on the contact CTA and `menu-plus` on Services (Screen Options → CSS Classes); submenu hierarchy is managed normally in Menus. `template-parts/home/` contains one PHP component per section plus homepage dialogs. `assets/js/site.js` owns shared mobile navigation, submenu controls and dialogs; `site.css` and `site-footer.css` style the shared shell. `assets/css/` contains shared tokens/primitives and one stylesheet per homepage component, including each component’s responsive rules and states. `template-parts/components/` renders reusable service and process cards from the escaped content in `inc/home-services.php` and `inc/home-process.php`. `inc/visuals.php` renders original decorative assets with only the transform/crop containers they need. All production classes use descriptive component names; Figma node metadata stays in development reference files.

Homepage interactions are isolated in `services.js`, `quiz.js`, `accordion.js`, `testimonials.js`, `calculator.js` and `partners.js`. They use stable component/data hooks, and service dialogs communicate with the shared shell through a DOM event. `tax.js` remains the independently testable calculation API. Homepage modules load only on the selectable Home template.

```powershell
# In Local's site shell (or use the explicit Local PHP 8.2.29 executable):
php -n -l functions.php
node --check assets/js/quiz.js
node --check assets/js/tax.js
node --test tools/tax.test.cjs
```

For browser verification, install Playwright and Chrome on the review workstation. For `--axe`, obtain axe-core 4.10.3's `axe.min.js` in `tools/axe.min.js`. These tools are development-only and are not loaded by the theme.

```powershell
npm install --no-save --package-lock=false playwright axe-core@4.10.3
Copy-Item node_modules/axe-core/axe.min.js tools/axe.min.js
$env:OXEN_URL = 'http://localhost:10016'
node tools/browser-checks.cjs --axe
```

The check covers all interactions, image/font loads, browser/network errors, hostname mapping and widths **1440, 1600, 1920, 2560, 1280, 1024, 768, 390 and 320**. It checks every section's viewport bounds, horizontal overflow, hero portrait proportions, card/CTA containment and complete-footer screenshot coverage. Wide-screen quiz, service dialog and calculator behavior is also exercised. The alias check targets this Local site's port; adapt it for another installation. It saves screenshots, geometry and audit JSON in gitignored `tools/screenshots/`.

`tools/flat-layers.json` retains the original measured layer data. The legacy generator predates this CMS architecture. **Do not run `tools/build-homepage.py --write` on this theme:** it would recreate the superseded homepage/navigation files and overwrite verified components. Any future generator update must account for the selectable template and reusable site shell before regeneration is considered.

The legacy generator targets the superseded generated markup and CSS. It is retained only as reference tooling; do not use it to modify this semantic theme. Original image/font assets and development reference data remain unchanged. Expiring Figma asset URLs and bulky QA captures are excluded from Git.

`python tools/generator-check.test.py` tests non-writing checks, manual-correction preservation and verified backups using isolated copies inside the theme's ignored backup directory.

The calculator uses [IRD business rates](https://www.ird.govt.nz/income-tax/income-tax-for-businesses-and-organisations/tax-rates-for-businesses) and [individual rates effective 1 April 2025](https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-rates-for-individuals): company tax is 28%; individual tax uses progressive brackets. Partnerships assume equal shares and no other partner income. GST, ACC, credits, deductions, provisional tax and shareholder-specific circumstances are outside this estimate.

Focused architecture verification: `node tools/architecture-checks.cjs`. It verifies static Home/template settings, idempotent setup, reusable header/footer on Sample Page, CMS menu edits with restoration, and interaction smoke checks. The site-specific CLI launcher uses LocalWP PHP 8.2.29 and MySQL port 10017; adapt those paths/port for another workstation.


Semantic refactor verification: `node tools/refactor-checks.cjs --baseline` captures an explicit checkpoint; `node tools/refactor-checks.cjs` checks the 1440/1920/768/390 layouts and interactions against it. Captures and migration diagnostics are gitignored. `node tools/architecture-checks.cjs --navigation-only` checks CMS configuration, a standard page and temporary menu edits with restoration. See `docs/semantic-refactor.md` for the scope and validation record.
