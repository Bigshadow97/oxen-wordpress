# Oxen WordPress theme

Custom PHP, modular CSS and vanilla JavaScript implementation of the [Oxen interview assessment, Figma node 1:3](https://www.figma.com/design/X8BzSNzhFvn61KCmzWsEPY/Oxen-Home-Page---Interview-Assessment?node-id=1-3). The original Figma document was read only. No page builders or frontend frameworks are required.

**Live:** [oxen.iva.lk](https://oxen.iva.lk). **Source branch:** `develop`. Deployment and measured performance are recorded in [docs/deployment.md](docs/deployment.md).

## Installation and CMS

1. Install the theme in `wp-content/themes/oxen` on WordPress 6.3+ and PHP 8.2+.
2. Obtain the original Satoshi fonts using `./tools/install-fonts.ps1` in PowerShell before reviewing the design. The installer preserves the checked-in font CSS and fails rather than substituting unavailable fonts.
3. Activate Oxen. Create or select Home, assign **Oxen Homepage**, and select it as the static homepage in Settings → Reading. `front-page.php` is intentionally absent so WordPress honors the assigned template.
4. Restore the associated database and uploads from an authorised site backup. Theme code alone does not contain the Media Library, page settings or menu assignments. The existing site has 88 attachments backing 89 semantic media fields, with 183 upload files. Edit homepage imagery through **Oxen homepage media** in the page editor; attachment relationships and sanitised SVG trust metadata must be retained.
5. Manage Primary navigation and the four footer menus through Appearance → Menus. Preserve `menu-contact` on the contact CTA and `menu-plus` on Services; submenu hierarchy uses normal WordPress menu nesting.

`header.php` and `footer.php` form the reusable shell; `page.php` renders standard CMS pages. The selectable template is `page-templates/template-oxen-home.php`, with reusable sections in `template-parts/home/`. The homepage ends at the dark Contact CTA; the full footer renders on standard pages. `wp_footer()` remains on both.

## Design, assets and licensing

1440px is the reference viewport, not a maximum website width. Sections remain full-width; internal reading widths and artwork adapt across desktop, tablet and mobile.

Original Figma assets are represented by native Media Library attachments. `inc/media-manifest.json` defines the semantic fields; `assets/asset-map.json` and `assets/provenance.json` retain original source relationships and checksums. The 90 original PNG/SVG exports are preserved privately outside the public document root and remain recoverable from pre-migration Git history. No stock replacements or recreated icons were used. A duplicate source SVG shares one attachment; one unused source SVG was not imported.

- [Satoshi / Fontshare licence](https://www.fontshare.com/licenses/itf-ffl): original, unmodified WOFF2 files are self-hosted on the site and excluded from Git because repository redistribution is restricted. Each reviewer must obtain their own copy through the supplied official-CDN installer.
- [Noto Serif](https://fonts.google.com/specimen/Noto+Serif) and [Playfair Display](https://fonts.google.com/specimen/Playfair+Display): included Latin WOFF2 subsets preserve the original outlines and OpenType features, with the corresponding SIL Open Font License texts in `assets/fonts/`.
- The export names **Noto Sans Devanagari UI Condensed** on non-rendering wrapper nodes. That font was unavailable; visible child text explicitly uses Noto Serif. No rendered font was silently substituted.

The maintained CSS/JavaScript sources, compiled delivery files, font licences, original asset provenance and existing Git history are retained. Cleanup does not change authorship or provenance.

## Assessment disclosures

- Figma provides only the initial quiz state. Questions 2/3 and the recommendation behaviour were authored for the functioning assessment; Back and restart preserve selections.
- The initial Amanda testimonial is supplied content. The other slides are explicitly labelled **Client stories** and use the supplied case studies, rather than invented endorsements.
- Booking controls open the original contact options; there is no external appointment-submission backend. Where Figma supplied no destination, verified Oxen destinations are used. News links use local results, the Twitter control offers verified social alternatives, the Spotify control uses the official podcast, and Cookies Policy describes this implementation in a dialog.
- The calculator uses company tax of 28% and progressive individual brackets effective 1 April 2025. Partnerships assume equal shares and no other partner income. GST, ACC, credits, deductions, provisional tax and shareholder-specific circumstances are excluded. Calculations remain local. Sources: [IRD business rates](https://www.ird.govt.nz/income-tax/income-tax-for-businesses-and-organisations/tax-rates-for-businesses), [IRD individual rates](https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-rates-for-individuals).
- Original source-colour contrast limitations remain outside the corrected standard-page footer. Native `prefers-contrast` and reduced-motion support, semantic controls, keyboard focus, Escape handling and dialog focus restoration are preserved. There is no extra contrast button.
- The measured mobile performance target of 97–100 is not achieved; see the deployment report. LocalWP's unused Imagick startup warning remains an environment limitation. Local development used LocalWP PHP 8.2.29, not system XAMPP PHP.

## Maintenance

Production loads the existing minified files in `assets/dist/`; Node.js and build tools are not required by WordPress. Edit the component sources under `assets/css/` and `assets/js/`. To rebuild delivery files when intentionally changing sources:

```powershell
npm install --prefix tools/performance-runtime --no-save --package-lock=false clean-css@5.3.3 terser@5.51.2
node tools/build-performance.cjs
```

The build does not regenerate templates. Font installation uses `tools/install-fonts.ps1` and its `satoshi-source.css`. The reusable calculator tests remain available:

```powershell
node --test tools/tax.test.cjs
```

Keep credentials, backups, environment files and local audit captures outside the public document root and Git. Runtime releases should contain only PHP templates, `inc/`, `template-parts/`, CSS/JavaScript, required fonts and assets; never upload `tools/`, documentation or Git metadata.
