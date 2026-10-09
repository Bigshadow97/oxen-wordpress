<?php defined( 'ABSPATH' ) || exit; ?>
<dialog id="contact-dialog" aria-labelledby="contact-dialog-title">
  <button type="button" class="dialog-close" data-close-dialog aria-label="Close contact options">×</button>
  <h2 id="contact-dialog-title">Book a free 30-minute call</h2>
  <p>Speak with a senior accountant about your business. Call or email Oxen to arrange a time.</p>
  <a class="dialog-action" href="tel:0800640001">Call 0800 640 001</a>
  <a class="dialog-action" href="mailto:hello@oxen.nz?subject=Book%20a%2030-minute%20call">Email hello@oxen.nz</a>
</dialog>
<dialog id="plan-dialog" aria-labelledby="plan-dialog-title">
	<button class="dialog-close" type="button" data-close-dialog aria-label="Close service details">×</button>
	<h2 id="plan-dialog-title">Your service</h2>
	<p id="plan-dialog-description"></p>
	<ul id="plan-dialog-features"></ul>
	<a class="dialog-action" href="#contact" data-close-dialog>Book a strategy call</a>
</dialog>
<dialog id="case-dialog" aria-labelledby="case-dialog-title">
  <button type="button" class="dialog-close" data-close-dialog aria-label="Close client story">×</button>
  <h2 id="case-dialog-title"></h2><p id="case-dialog-description"></p>
  <a class="dialog-action" href="#contact" data-close-dialog>Talk to Oxen</a>
</dialog>
<dialog id="policy-dialog" aria-labelledby="policy-dialog-title">
  <button type="button" class="dialog-close" data-close-dialog aria-label="Close cookie information">×</button>
  <h2 id="policy-dialog-title">Cookies Policy</h2>
  <p>This homepage does not set analytics or advertising cookies. Images and fonts are hosted locally. WordPress may use login and administration cookies when you sign in. The text contrast preference is stored on your device.</p>
</dialog>
<dialog id="social-dialog" aria-labelledby="social-dialog-title">
  <button type="button" class="dialog-close" data-close-dialog aria-label="Close social links">×</button>
  <h2 id="social-dialog-title">Connect with Oxen</h2>
  <p>Find Oxen on these channels.</p>
  <a class="dialog-action" href="https://www.linkedin.com/company/oxenaccounting/">LinkedIn</a>
  <a class="dialog-action" href="https://www.instagram.com/oxenaccounting/">Instagram</a>
  <a class="dialog-action" href="https://www.youtube.com/@OxenAccounting">YouTube</a>
</dialog>
<dialog id="comparison-dialog" aria-labelledby="comparison-title">
	<button class="dialog-close" type="button" data-close-dialog aria-label="Close service comparison">×</button>
	<h2 id="comparison-title">Compare all four side-by-side</h2>
	<div class="table-scroll" tabindex="0" role="region" aria-label="Service comparison, scroll horizontally on small screens">
		<table class="comparison-table">
			<caption class="sr-only">Oxen services by business stage</caption>
			<thead><tr><th scope="col">Service</th><th scope="col">Business stage</th><th scope="col">Included support</th></tr></thead>
			<tbody id="comparison-rows"></tbody>
		</table>
	</div>
</dialog>
<dialog id="about-dialog" aria-labelledby="about-dialog-title">
	<button class="dialog-close" type="button" data-close-dialog aria-label="Close details">×</button>
	<h2 id="about-dialog-title"></h2><p id="about-dialog-description"></p>
	<a class="dialog-action" href="#contact" data-close-dialog>Talk to Jeremy</a>
</dialog>
