<?php defined( 'ABSPATH' ) || exit; ?>
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
