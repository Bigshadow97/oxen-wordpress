# Semantic theme refactor

The refactor starts from develop commit `6dd40c3`, preserved by local tag
`checkpoint/semantic-refactor-6dd40c3`. It changes code architecture without
changing homepage copy, assets, typography or the original Figma file.

- Production templates and styles use BEM component names. Generated node
  attributes, 337 numeric layer classes and 356 numeric artwork classes are gone.
- Service and onboarding cards use reusable template parts with escaped content
  arrays. A restricted decoration renderer retains original crop/transform
  composition while removing transparent redundant containers and hidden duplicates.
- Shared tokens and primitives replace repeated typography/layout declarations.
  Component styles own their desktop geometry, responsive layout and states.
  Obsolete aggregate stylesheets, 298 unused selector branches and 55 unused heading rules were removed.
  Media blocks merge where viewport conditions are mutually exclusive, preserving
  cascade order where overlapping responsive rules require it.
- Separate vanilla JavaScript modules retain stable functional data attributes.
  Service/comparison dialogs use delegated events and the shared dialog controller.
  Quiz answer selection is delegated; the existing accordion motion, finite
  testimonial navigation, seamless logo loop and calculator are retained.
- The selectable homepage, standard pages, reusable header/footer and five
  WordPress menu locations remain intact. No menu labels or URLs moved into PHP.

Validation compares full-page screenshots and section bounds at 1440, 1920,
768 and 390. The browser pass covers quiz/recommendation/Back/restart, calculator,
accordion switching and rapid clicks, testimonials, dialogs, mobile navigation,
logo autoplay/focus/reduced motion, generated-markup removal and browser errors.
CMS checks exercise a standard page, template assignment, idempotent setup and
menu label/hierarchy edits, restoring the fixture afterward. LocalWP PHP 8.2.29
syntax and the independent calculator tests are also checked.

The one-off migration scripts, checkpoint rendering and screenshots are ignored
QA artifacts. They are not loaded by WordPress or committed as production code.
The legacy homepage generator was not run; Figma was not accessed or modified.
No push or deployment was performed.

Validation outcome: all four section-bound inventories match the checkpoint
exactly. All component screenshots match apart from at most 2/255 channel
variation within the desktop hero’s blurred gradient rendering. The interaction,
CMS and PHP checks passed; temporary menu changes were restored.
