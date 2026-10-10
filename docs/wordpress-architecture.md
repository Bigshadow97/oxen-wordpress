WordPress architecture correction — 10 October 2026

The selectable Oxen Homepage template now renders the existing twelve homepage
sections. The superseded front-page.php and hardcoded navigation part were
removed. Shared header.php/footer.php render branding, CMS navigation, original
footer content, document hooks and shared dialogs on both homepage and standard
pages. No homepage regeneration or Figma changes were made.

LocalWP configuration:
- Oxen active; LocalWP PHP 8.2.29; MySQL port 10017.
- Published Home page ID 11; template page-templates/template-oxen-home.php.
- show_on_front=page; page_on_front=11.
- Assigned menus: Primary (3), Footer Services (4), Resources (5), Policies (6),
  Social (7). Setup rerun preserved IDs, counts and existing CMS data.
- The setup script is explicit, installation-guarded and idempotent. It runs only
  through WP-CLI, never on frontend requests or theme activation.

Focused verification:
- PHP syntax passed for theme templates and setup/check files.
- Home and existing Sample Page returned HTTP 200 with one header/footer each.
- Shared styles/scripts loaded on standard pages; homepage-only scripts did not.
- No browser errors, duplicate element IDs or horizontal overflow in checked
  1440/1920 desktop and 390 mobile layouts.
- Quiz recommendation/restart, calculator, Why Oxen accordion, testimonials,
  comparison/service dialogs and contact/policy dialogs passed smoke checks.
- Temporary CMS label and hierarchy edits reached desktop/mobile navigation.
  All fixture changes were restored afterward.
- The single consolidated check exposed a missing submenu toggle. After fixing
  the walker, only targeted navigation checks were rerun; keyboard submenu flow
  and mobile contact-dialog focus restoration passed.

No full-site screenshot/a11y/regression loop, external push or deployment was
performed. No architecture blockers remain. Earlier design validation and
environment/font notes remain in README.md and docs/validation.md.
