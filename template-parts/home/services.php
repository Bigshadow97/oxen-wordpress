<?php
defined( 'ABSPATH' ) || exit;
$service_cards = require get_template_directory() . '/inc/home-services.php';
?>
<section id="services" class="section services" aria-labelledby="services-title">
<p class="section__item services__introduction section__text">Whether you&#x27;re starting out tomorrow or planning your exit in five years, there&#x27;s one package built for where you are. Move up the tiers as your business grows — same team, more support.</p>
<h2 class="section__item services__title section__text" id="services-title"><span class="services__title-prefix">Pick the stage you&#x27;re at. </span><span class="services__title-line">We do the rest.</span></h2>
<p class="section__item services__eyebrow section__text">
            Services
          </p>
<?php get_template_part( 'template-parts/components/service-card', null, $service_cards[0] ); ?>
<?php get_template_part( 'template-parts/components/service-card', null, $service_cards[1] ); ?>
<p class="section__item services__supporting-copy section__text">
        Budgeting, financial planning, and coaching to build sustainable business models and achieve goals.
      </p>
<button type="button" data-open-comparison="" aria-haspopup="dialog" aria-controls="comparison-dialog" class="section__item services__comparison section__text text-button service-comparison">
  <span class="service-comparison__label">Compare all four side-by-side</span>
  <?php echo oxen_media_image( 'service_comparison_icon', array( 'class' => 'service-comparison__icon', 'alt' => '', 'aria-hidden' => 'true', 'decoding' => 'async' ) ); ?>
  <?php echo oxen_media_image( 'service_comparison_rule', array( 'class' => 'service-comparison__rule', 'alt' => '', 'aria-hidden' => 'true', 'decoding' => 'async' ) ); ?>
</button>
<div class="layout-group service-path"><div class="section__item service-path__halo section__visual" aria-hidden="true"><div class="service-path__halo-orientation"><div class="service-path__halo-canvas"><div class="service-path__halo-frame"><?php echo oxen_media_image( 'service_path_halo', array( 'alt' => '', 'decoding' => 'async', 'class' => 'service-path__halo-image' ) ); ?></div></div></div></div>
<div class="section__item service-path__outline section__visual" aria-hidden="true"></div>
<div class="section__item service-path__background section__visual" aria-hidden="true"></div>
<div class="section__item service-path__start-divider section__visual" aria-hidden="true"><div class="service-path__start-divider-frame"><?php echo oxen_media_image( 'service_path_start_divider', array( 'alt' => '', 'decoding' => 'async', 'class' => 'service-path__start-divider-image' ) ); ?></div></div>
<div class="section__item service-path__end-divider section__visual" aria-hidden="true"><div class="service-path__end-divider-orientation"><div class="service-path__end-divider-canvas"><div class="service-path__end-divider-frame"><?php echo oxen_media_image( 'service_path_start_divider', array( 'alt' => '', 'decoding' => 'async', 'class' => 'service-path__end-divider-image' ) ); ?></div></div></div></div>
<p class="section__item service-path__eyebrow section__text">How it works </p>
<button type="button" data-preview-plan="0" class="section__item service-path__foundations section__text text-button">
            Just Starting
          </button>
<button type="button" data-preview-plan="1" class="section__item service-path__essentials section__text text-button">
            Up and Running
          </button>
<button type="button" data-preview-plan="2" class="section__item service-path__advisory section__text text-button">
            Growing Fast
          </button>
<button type="button" data-preview-plan="3" class="section__item service-path__cfo section__text text-button">
            Scaling up
          </button>
<div class="section__item service-path__first-arrow section__visual" aria-hidden="true"><?php echo oxen_media_image( 'service_path_first_arrow', array( 'alt' => '', 'decoding' => 'async', 'class' => 'service-path__first-arrow-image' ) ); ?></div>
<div class="section__item service-path__second-arrow section__visual" aria-hidden="true"><?php echo oxen_media_image( 'service_path_first_arrow', array( 'alt' => '', 'decoding' => 'async', 'class' => 'service-path__second-arrow-image' ) ); ?></div>
<div class="section__item service-path__third-arrow section__visual" aria-hidden="true"><?php echo oxen_media_image( 'service_path_first_arrow', array( 'alt' => '', 'decoding' => 'async', 'class' => 'service-path__third-arrow-image' ) ); ?></div>
<p class="section__item service-path__description section__text">
          Same team. More support as you grow.
        </p>
<div class="section__item service-path__start-marker section__visual" aria-hidden="true"><div class="service-path__start-marker-orientation"><div class="service-path__start-marker-canvas"><div class="service-path__start-marker-frame"><?php echo oxen_media_image( 'service_path_start_divider', array( 'alt' => '', 'decoding' => 'async', 'class' => 'service-path__start-marker-image' ) ); ?></div></div></div></div>
<div class="section__item service-path__end-marker section__visual" aria-hidden="true"><div class="service-path__end-marker-orientation"><div class="service-path__end-marker-canvas"><div class="service-path__end-marker-frame"><?php echo oxen_media_image( 'service_path_start_divider', array( 'alt' => '', 'decoding' => 'async', 'class' => 'service-path__end-marker-image' ) ); ?></div></div></div></div></div>
<?php get_template_part( 'template-parts/components/service-card', null, $service_cards[2] ); ?>
<?php get_template_part( 'template-parts/components/service-card', null, $service_cards[3] ); ?>
</section>
