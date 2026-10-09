<?php
defined( 'ABSPATH' ) || exit;
// Native assets and the visual sizes supplied by the original Figma nodes.
$partner_logos = array(
	array( 'name' => 'Bootleg Jerky Co', 'asset' => 'image6.png', 'pixels' => 818, 'size' => 128.603, 'node' => '1:628', 'class' => 'partner-logo--bootleg' ),
	array( 'name' => 'Cali Woods', 'asset' => 'image7.png', 'pixels' => 400, 'size' => 128.603, 'node' => '1:629', 'class' => '' ),
	array( 'name' => 'Low Carb Haven', 'asset' => 'image8.png', 'pixels' => 504, 'size' => 192.314, 'node' => '1:630', 'class' => '' ),
	array( 'name' => 'Manage', 'asset' => 'image9.png', 'pixels' => 400, 'size' => 138.613, 'node' => '1:631', 'class' => '' ),
	array( 'name' => 'Follow', 'asset' => 'image10.png', 'pixels' => 648, 'size' => 128.231, 'node' => '1:632', 'class' => '' ),
	array( 'name' => 'Tikitibu', 'asset' => 'image11.png', 'pixels' => 1200, 'size' => 144.773, 'node' => '1:633', 'class' => '' ),
);
?>
<section id="partners" class="home-section partners-section" aria-label="Clients and partners">
<p data-node-id="1:626" class="design-layer layer-626 copy-layer">
              Clients and Partners
            </p>
<div class="partners-carousel" data-logo-carousel tabindex="0" role="group" aria-label="Client and partner logos. Focus to pause scrolling.">
<div class="partners-track">
<?php for ( $copy = 0; $copy < 2; $copy++ ) : ?>
<ul class="partners-logo-group" role="list"<?php echo $copy ? ' data-logo-clone aria-hidden="true" inert' : ''; ?>>
<?php foreach ( $partner_logos as $logo ) : ?>
<li class="partner-logo <?php echo esc_attr( $logo['class'] ); ?>" style="--logo-size: <?php echo esc_attr( $logo['size'] ); ?>px;"<?php if ( ! $copy ) : ?> data-node-id="<?php echo esc_attr( $logo['node'] ); ?>"<?php endif; ?>>
<span class="partner-logo-image"><img alt="<?php echo $copy ? '' : esc_attr( $logo['name'] ); ?>" src="<?php echo oxen_asset( $logo['asset'] ); ?>" width="<?php echo esc_attr( $logo['pixels'] ); ?>" height="<?php echo esc_attr( $logo['pixels'] ); ?>" decoding="async"></span>
</li>
<?php endforeach; ?>
</ul>
<?php endfor; ?>
</div>
</div>
</section>
