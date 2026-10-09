<?php defined( 'ABSPATH' ) || exit; ?>
<section id="about" class="home-section about-section" aria-labelledby="heading-520">
<div data-node-id="1:518" class="design-layer layer-518 art-layer" aria-hidden="true"><div class="art-490"><div class="art-491"><div class="art-492"><img alt="" src="<?php echo oxen_asset( 'ellipse2146.svg' ); ?>" decoding="async" class="art-493"></div></div></div></div>
<div class="responsive-group about-copy"><p data-node-id="1:522" class="design-layer layer-522 copy-layer">
            Why Oxen
          </p>
<h2 data-node-id="1:520" class="design-layer layer-520 copy-layer" id="heading-520"><span class="art-496">&quot;The chartered accountant industry treats clients </span><span class="art-497">
            <span class="art-498">like a number.</span><span class="art-499"> We don&#x27;t.&quot;</span></span></h2>
<p data-node-id="1:523" class="design-layer layer-523 copy-layer">&quot;We started Oxen because I was tired of watching good business owners get handed off to whoever was free. Your accountant should be the person who knows your business best after you.&quot;</p>
<p data-node-id="1:519" class="design-layer layer-519 copy-layer">— Jeremy Wilson, Founder &amp; Managing Director</p></div>
<?php
// Preserve the descriptions previously supplied by the three detail controls.
// Figma defines one photo for this section, shared by the inline panels.
$why_items = array(
  array( 'title' => 'Senior, not junior', 'node' => '1:528', 'description' => 'Budgeting, financial planning, and coaching to build sustainable business models and achieve goals.' ),
  array( 'title' => 'Direct access, real responsiveness', 'node' => '1:533', 'description' => '"We started Oxen because I was tired of watching good business owners get handed off to whoever was free. Your accountant should be the person who knows your business best after you."' ),
  array( 'title' => 'Strategy, not just compliance', 'node' => '1:536', 'description' => 'Budgeting, financial planning, and coaching to build sustainable business models and achieve goals.' ),
);
?>
<div class="why-accordion" data-why-accordion>
<?php foreach ( $why_items as $index => $item ) : ?>
  <div class="why-item<?php echo 0 === $index ? ' is-open' : ''; ?>">
    <h3 class="why-heading">
      <button id="why-control-<?php echo esc_attr( $index ); ?>" class="why-toggle" type="button" data-node-id="<?php echo esc_attr( $item['node'] ); ?>" data-about-detail="<?php echo esc_attr( $index ); ?>" aria-expanded="<?php echo 0 === $index ? 'true' : 'false'; ?>" aria-controls="why-panel-<?php echo esc_attr( $index ); ?>">
        <span class="why-number" aria-hidden="true"><?php echo esc_html( sprintf( '%02d', $index + 1 ) ); ?></span>
        <span class="why-label"><?php echo esc_html( $item['title'] ); ?></span>
      </button>
    </h3>
    <div id="why-panel-<?php echo esc_attr( $index ); ?>" class="why-panel" role="region" aria-labelledby="why-control-<?php echo esc_attr( $index ); ?>"<?php echo 0 === $index ? '' : ' hidden'; ?>>
      <div class="why-photo"><img alt="" src="<?php echo oxen_asset( 'team-photos-fauxels6.png' ); ?>" decoding="async"></div>
      <p class="why-description"><?php echo esc_html( $item['description'] ); ?></p>
    </div>
    <div class="why-corners" aria-hidden="true">
      <?php foreach ( array( 'top-left', 'top-right', 'bottom-left', 'bottom-right' ) as $corner ) : ?>
        <img class="why-corner <?php echo esc_attr( $corner ); ?>" alt="" src="<?php echo oxen_asset( 'vector1023.svg' ); ?>" decoding="async">
      <?php endforeach; ?>
    </div>
  </div>
<?php endforeach; ?>
</div>
<div class="responsive-group about-team"><div data-node-id="1:547" class="design-layer layer-547 art-layer" aria-hidden="true"><div class="art-538"><img alt="" height="79.969" width="79.969" src="<?php echo oxen_asset( 'ellipse2147.png' ); ?>" decoding="async" class="art-539"></div></div>
<div data-node-id="1:548" class="design-layer layer-548 art-layer" aria-hidden="true"><div class="art-541"><img alt="" height="79.969" width="79.969" src="<?php echo oxen_asset( 'ellipse2148.png' ); ?>" decoding="async" class="art-542"></div></div>
<div data-node-id="1:549" class="design-layer layer-549 art-layer" aria-hidden="true"><div class="art-544"><img alt="" height="79.969" width="79.969" src="<?php echo oxen_asset( 'ellipse2149.png' ); ?>" decoding="async" class="art-545"></div></div>
<div data-node-id="1:550" class="design-layer layer-550 art-layer" aria-hidden="true"><div class="art-547"><img alt="" height="79.969" width="79.969" src="<?php echo oxen_asset( 'ellipse2150.png' ); ?>" decoding="async" class="art-548"></div></div>
<div data-node-id="1:551" class="design-layer layer-551 art-layer" aria-hidden="true"><div class="art-550"><img alt="" height="79.969" width="79.969" src="<?php echo oxen_asset( 'ellipse2151.png' ); ?>" decoding="async" class="art-551"></div></div>
<p data-node-id="1:552" class="design-layer layer-552 copy-layer"><span class="art-553">The Oxen team — five people, one promise. </span><a href="https://oxen.nz/about-us/" class="art-554">Meet everyone</a></p></div>
</section>
