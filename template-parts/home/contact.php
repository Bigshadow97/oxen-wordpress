<?php defined( 'ABSPATH' ) || exit; ?>
<section id="contact" class="section contact" aria-labelledby="contact-title">
	<!-- Continue Figma's original calculator glow across the shared navy background. -->
	<div class="contact__glow-clip" aria-hidden="true"><div class="contact__glow"><?php echo oxen_media_image( 'calculator_bridge_glow', array( 'alt' => '', 'width' => '1183', 'height' => '1067', 'decoding' => 'async' ) ); ?></div></div>
	<!-- One artboard keeps both original graph fills and their guides in registration. -->
	<div class="contact__artwork-clip" aria-hidden="true"><div class="contact__artwork">
		<?php echo oxen_media_image( 'contact_graph', array( 'class' => 'contact__graph contact__graph--primary', 'alt' => '', 'width' => '1441', 'height' => '513', 'decoding' => 'async' ) ); ?>
		<?php echo oxen_media_image( 'contact_graph_secondary', array( 'class' => 'contact__graph contact__graph--secondary', 'alt' => '', 'width' => '1441', 'height' => '378', 'decoding' => 'async' ) ); ?>
		<?php echo oxen_media_image( 'contact_guide', array( 'class' => 'contact__guide contact__guide--one', 'alt' => '', 'width' => '1', 'height' => '563', 'decoding' => 'async' ) ); ?>
		<?php echo oxen_media_image( 'contact_guide_middle', array( 'class' => 'contact__guide contact__guide--two', 'alt' => '', 'width' => '1', 'height' => '457', 'decoding' => 'async' ) ); ?>
		<?php echo oxen_media_image( 'contact_guide_short', array( 'class' => 'contact__guide contact__guide--three', 'alt' => '', 'width' => '1', 'height' => '201', 'decoding' => 'async' ) ); ?>
		<?php echo oxen_media_image( 'contact_guide_lower', array( 'class' => 'contact__guide contact__guide--four', 'alt' => '', 'width' => '1', 'height' => '160', 'decoding' => 'async' ) ); ?>
		<?php echo oxen_media_image( 'contact_guide_lower', array( 'class' => 'contact__guide contact__guide--five', 'alt' => '', 'width' => '1', 'height' => '160', 'decoding' => 'async' ) ); ?>
		<?php echo oxen_media_image( 'contact_guide_right', array( 'class' => 'contact__guide contact__guide--six', 'alt' => '', 'width' => '1', 'height' => '196', 'decoding' => 'async' ) ); ?>
	</div></div>
	<div class="contact__content">
		<p class="contact__eyebrow section__text">Let’s talk</p>
		<h2 class="contact__heading section__text" id="contact-title"><span>Let's get your numbers </span><span>in check.</span></h2>
		<p class="contact__description section__text">30 minutes with a senior accountant looking at your numbers. No pitch. No follow-up sales call you didn't ask for. Just real, useful advice.</p>
		<div class="contact__actions">
			<a href="#contact" class="contact__button contact__button--primary button" data-open-contact aria-haspopup="dialog"><span class="section__text">Book a strategy call</span></a>
			<a href="tel:0800640001" class="contact__button button"><span class="section__text">Call 0800 640 001</span></a>
		</div>
		<p class="contact__response"><?php echo oxen_media_image( 'status_indicator', array( 'alt' => '', 'width' => '8', 'height' => '8', 'decoding' => 'async', 'aria-hidden' => 'true' ) ); ?><span class="section__text">Usually responds within 4 hours, Mon–Fri</span></p>
	</div>
</section>
