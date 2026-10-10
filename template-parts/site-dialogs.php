<?php defined( 'ABSPATH' ) || exit; ?>
<dialog id="contact-dialog" aria-labelledby="contact-dialog-title">
  <button type="button" class="dialog-close" data-close-dialog aria-label="Close contact options">×</button>
  <h2 id="contact-dialog-title">Book a free 30-minute call</h2>
  <p>Speak with a senior accountant about your business. Call or email Oxen to arrange a time.</p>
  <a class="dialog-action" href="tel:0800640001">Call 0800 640 001</a>
  <a class="dialog-action" href="mailto:hello@oxen.nz?subject=Book%20a%2030-minute%20call">Email hello@oxen.nz</a>
</dialog>
<dialog id="policy-dialog" aria-labelledby="policy-dialog-title">
  <button type="button" class="dialog-close" data-close-dialog aria-label="Close cookie information">×</button>
  <h2 id="policy-dialog-title">Cookies Policy</h2>
  <p>This homepage does not set analytics or advertising cookies. Images and fonts are hosted locally. WordPress may use login and administration cookies when you sign in.</p>
</dialog>
<dialog id="social-dialog" aria-labelledby="social-dialog-title">
  <button type="button" class="dialog-close" data-close-dialog aria-label="Close social links">×</button>
  <h2 id="social-dialog-title">Connect with Oxen</h2>
  <p>Find Oxen on these channels.</p>
  <?php wp_nav_menu( array( 'theme_location' => 'footer_social', 'menu_id' => 'social-dialog-menu', 'container' => false, 'fallback_cb' => false, 'oxen_exclude_classes' => array( 'menu-social-alternatives' ) ) ); ?>
</dialog>
