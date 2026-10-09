# Oxen WordPress homepage

A custom PHP theme built from the original [Oxen assessment Figma file, node 1:3](https://www.figma.com/design/X8BzSNzhFvn61KCmzWsEPY/Oxen-Home-Page---Interview-Assessment?node-id=1-3). The implementation uses HTML5, CSS Grid/Flexbox and vanilla JavaScript. No page builders, frontend frameworks or runtime build step are required.

## Review locally

1. Place this repository in `wp-content/themes/oxen` on WordPress 6.3+ with PHP 8.2+.
2. **Install the original Satoshi files before reviewing.** From the theme directory in PowerShell, run `./tools/install-fonts.ps1`. Each reviewer obtains their own unmodified files from the official font CDNs. The script fails on unavailable downloads instead of choosing another font.
3. Activate **Oxen** in Appearance → Themes, or run `wp theme activate oxen` in Local's site shell. `front-page.php` renders the homepage without importing page-builder content or modifying WordPress core.
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

The exact original colour palette includes several insufficient text-contrast combinations. An **Increase text contrast** button in the footer provides a higher-contrast version; it also respects `prefers-contrast: more` and remembers the choice on the current device. The default palette remains the original design. See [validation](docs/validation.md) for audit results and limits.

Figma does not supply external link or booking destinations. Verified Oxen service, story, podcast, privacy and social destinations are used where available. News links point to the local client-results section. The Twitter-labelled control opens verified social alternatives; the Spotify-labelled link opens the official podcast page. Cookies Policy explains this implementation's local behavior in a dialog.

## Design data and original assets

Figma remained strictly **read-only**. The source was read using design context, node metadata, screenshots and asset exports. When an export hit the 20-asset cap, smaller node groups were requested. All **90 original PNG/SVG assets** are stored in `assets/images`; the mapping and original-download SHA-256 checksums are in `assets/asset-map.json` and `assets/provenance.json`. No stock-image replacements or recreated icons were used.

Desktop CSS follows the original 1440px coordinates, typography, masks, image cropping, colours and paint order. `data-node-id` attributes preserve source references. The source frame is 1440 × 8443, but its footer children extend to approximately y=9072; the implemented page includes that full footer. The 1440px comparison covers the entire exported frame, and the remaining footer uses the original child measurements. **1440px is the reference viewport, not a maximum page width.** All section containers span the viewport. Above 1440px, percentage anchors, fluid Grid/Flex components and bounded reading widths adapt the composition; photographs use cover/contain crops and the hero portrait scales uniformly. Below 1440px the same semantic content reflows into tablet/mobile layouts, without page zoom.

Rendered fonts are **Satoshi** (400/500 normal and italic, 700 normal), **Noto Serif** (400 normal/italic), and **Playfair Display** (400 normal). Eight original font faces were loaded successfully in browser verification.

- [Satoshi / Fontshare license](https://www.fontshare.com/licenses/itf-ffl): permits self-hosting on one's own website but restricts redistribution through repositories. Satoshi binaries are therefore deliberately gitignored; the setup script obtains each reviewer's own copy. Files are not subset, converted or modified.
- [Noto Serif](https://fonts.google.com/specimen/Noto+Serif) and [Playfair Display](https://fonts.google.com/specimen/Playfair+Display): official Google Fonts files are included with their SIL Open Font License texts.
- The export mentions **Noto Sans Devanagari UI Condensed** on wrapper nodes. That font file was not supplied or obtained. Every visible glyph in those wrappers is explicitly styled with the available Noto Serif face; no visible font substitution was made. A future design change that renders the wrapper font requires its original licensed file.

## Source layout and checks

`template-parts/home/` contains one PHP component per section plus dialogs. `assets/css/` separates fonts, shared behavior, measured desktop styling and responsive styling. `wide-measurements.css` translates source anchors to percentages; `wide.css` controls fluid components, backgrounds and image focal points above the reference viewport. `assets/js/homepage.js` handles UI; `assets/js/tax.js` contains independently testable calculations.

```powershell
# In Local's site shell (or use the explicit Local PHP 8.2.29 executable):
php -n -l functions.php
node --check assets/js/homepage.js
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

`tools/flat-layers.json` retains the original measured layer data. `python tools/build-homepage.py` reproduces section PHP and measured desktop CSS from that data without connecting to Figma. Responsive CSS, shared behavior and dialogs are maintained separately. For a future read-only design refresh, `parse-figma.py` accepts a fresh `figma-reference.jsx` and `figma-metadata.xml` export. `compare-screenshots.py` uses Pillow and a fresh original `tools/figma-reference.png` to produce side-by-side comparisons and channel-difference metrics. Expiring Figma asset URLs and bulky QA captures are intentionally excluded from Git.

The calculator uses [IRD business rates](https://www.ird.govt.nz/income-tax/income-tax-for-businesses-and-organisations/tax-rates-for-businesses) and [individual rates effective 1 April 2025](https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-rates-for-individuals): company tax is 28%; individual tax uses progressive brackets. Partnerships assume equal shares and no other partner income. GST, ACC, credits, deductions, provisional tax and shareholder-specific circumstances are outside this estimate.
