<?php
defined( 'ABSPATH' ) || exit;
$process_cards = require get_template_directory() . '/inc/home-process.php';
?>
<section id="process" class="section process" aria-labelledby="process-title">
<h2 class="section__item process__title section__text" id="process-title"><span class="process__title-prefix">A simple path from </span><span class="process__title-emphasis">&quot;let&#x27;s talk&quot;</span><span class="process__title-ending"> to working together.</span></h2>
<p class="section__item process__eyebrow section__text">
            Your first 30 days with Oxen
          </p>
<?php get_template_part( 'template-parts/components/process-card', null, $process_cards[0] ); ?>
<?php get_template_part( 'template-parts/components/process-card', null, $process_cards[1] ); ?>
<?php get_template_part( 'template-parts/components/process-card', null, $process_cards[2] ); ?>
</section>
