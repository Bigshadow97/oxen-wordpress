<?php defined( 'ABSPATH' ) || exit; ?>
<section id="about" class="section about" aria-labelledby="about-title">
<div class="section__item about__glow section__visual" aria-hidden="true"><div class="about__glow-orientation"><div class="about__glow-canvas"><div class="about__glow-frame"><?php echo oxen_media_image( 'about_glow', array( 'alt' => '', 'decoding' => 'async', 'class' => 'about__glow-image' ) ); ?></div></div></div></div>
<div class="layout-group about__content"><p class="section__item about__eyebrow section__text">
            Why Oxen
          </p>
<h2 class="section__item about__title section__text" id="about-title"><span class="about__title-prefix">&quot;The chartered accountant industry treats clients </span><span class="about__title-line">
            <span class="about__title-emphasis">like a number.</span><span class="about__title-ending"> We don&#x27;t.&quot;</span></span></h2>
<p class="section__item about__quote section__text">&quot;We started Oxen because I was tired of watching good business owners get handed off to whoever was free. Your accountant should be the person who knows your business best after you.&quot;</p>
<p class="section__item about__attribution section__text">— Jeremy Wilson, Founder &amp; Managing Director</p></div>
<?php
// Preserve the descriptions previously supplied by the three detail controls.
// Figma defines one photo for this section, shared by the inline panels.
$why_items = array(
  array( 'title' => 'Senior, not junior', 'description' => 'Budgeting, financial planning, and coaching to build sustainable business models and achieve goals.' ),
  array( 'title' => 'Direct access, real responsiveness', 'description' => '"We started Oxen because I was tired of watching good business owners get handed off to whoever was free. Your accountant should be the person who knows your business best after you."' ),
  array( 'title' => 'Strategy, not just compliance', 'description' => 'Budgeting, financial planning, and coaching to build sustainable business models and achieve goals.' ),
);
?>
<div class="why-accordion" data-why-accordion>
<?php foreach ( $why_items as $index => $item ) : ?>
  <div class="why-accordion__item<?php echo 0 === $index ? ' is-open' : ''; ?>">
    <div id="why-image-<?php echo esc_attr( $index ); ?>" class="why-accordion__reveal why-accordion__image-reveal" aria-hidden="<?php echo 0 === $index ? 'false' : 'true'; ?>"<?php echo 0 === $index ? '' : ' inert'; ?>>
      <div class="why-accordion__photo-clip"><div class="why-accordion__photo"><?php echo oxen_media_image( 'about_team_image', array( 'alt' => '', 'decoding' => 'async' ) ); ?></div></div>
    </div>
    <h3 class="why-accordion__heading">
      <button id="why-control-<?php echo esc_attr( $index ); ?>" class="why-accordion__toggle" type="button" data-about-detail="<?php echo esc_attr( $index ); ?>" aria-expanded="<?php echo 0 === $index ? 'true' : 'false'; ?>" aria-controls="why-image-<?php echo esc_attr( $index ); ?> why-panel-<?php echo esc_attr( $index ); ?>">
        <span class="why-accordion__number" aria-hidden="true"><?php echo esc_html( sprintf( '%02d', $index + 1 ) ); ?></span>
        <span class="why-accordion__label"><?php echo esc_html( $item['title'] ); ?></span>
        <span class="why-accordion__icon" aria-hidden="true"><?php echo 0 === $index ? '−' : '+'; ?></span>
      </button>
    </h3>
    <div id="why-panel-<?php echo esc_attr( $index ); ?>" class="why-accordion__reveal why-accordion__panel" role="region" aria-labelledby="why-control-<?php echo esc_attr( $index ); ?>" aria-hidden="<?php echo 0 === $index ? 'false' : 'true'; ?>"<?php echo 0 === $index ? '' : ' inert'; ?>>
      <div class="why-accordion__copy-clip"><p class="why-accordion__description"><?php echo esc_html( $item['description'] ); ?></p></div>
    </div>
    <div class="why-accordion__corners" aria-hidden="true">
      <?php foreach ( array( 'top-left', 'top-right', 'bottom-left', 'bottom-right' ) as $corner ) : ?>
        <?php echo oxen_media_image( 'why_accordion_corner', array( 'class' => 'why-accordion__corner why-accordion__corner--' . (esc_attr( $corner )), 'alt' => '', 'decoding' => 'async' ) ); ?>
      <?php endforeach; ?>
    </div>
  </div>
<?php endforeach; ?>
</div>
<div class="layout-group about__team"><div class="section__item about__portrait-jeremy section__visual" aria-hidden="true"><div class="about__portrait-jeremy-frame"><?php echo oxen_media_image( 'team_portrait_jeremy', array( 'alt' => '', 'height' => '79.969', 'width' => '79.969', 'decoding' => 'async', 'class' => 'about__portrait-jeremy-image' ) ); ?></div></div>
<div class="section__item about__portrait-accountant section__visual" aria-hidden="true"><div class="about__portrait-accountant-frame"><?php echo oxen_media_image( 'team_portrait_accountant', array( 'alt' => '', 'height' => '79.969', 'width' => '79.969', 'decoding' => 'async', 'class' => 'about__portrait-accountant-image' ) ); ?></div></div>
<div class="section__item about__portrait-adviser section__visual" aria-hidden="true"><div class="about__portrait-adviser-frame"><?php echo oxen_media_image( 'team_portrait_adviser', array( 'alt' => '', 'height' => '79.969', 'width' => '79.969', 'decoding' => 'async', 'class' => 'about__portrait-adviser-image' ) ); ?></div></div>
<div class="section__item about__portrait-manager section__visual" aria-hidden="true"><div class="about__portrait-manager-frame"><?php echo oxen_media_image( 'team_portrait_manager', array( 'alt' => '', 'height' => '79.969', 'width' => '79.969', 'decoding' => 'async', 'class' => 'about__portrait-manager-image' ) ); ?></div></div>
<div class="section__item about__portrait-associate section__visual" aria-hidden="true"><div class="about__portrait-associate-frame"><?php echo oxen_media_image( 'team_portrait_associate', array( 'alt' => '', 'height' => '79.969', 'width' => '79.969', 'decoding' => 'async', 'class' => 'about__portrait-associate-image' ) ); ?></div></div>
<p class="section__item about__team-caption section__text"><span class="about__team-caption-text">The Oxen team — five people, one promise. </span><a href="https://oxen.nz/about-us/" class="about__team-caption-text-inner">Meet everyone</a></p></div>
</section>
