<?php
defined( 'ABSPATH' ) || exit;
// Native assets and the visual sizes supplied by the original Figma nodes.
$partner_logos = array(
	array( 'name' => 'Bootleg Jerky Co', 'asset' => 'image6.png', 'pixels' => 818, 'class' => 'partners__logo--bootleg' ),
	array( 'name' => 'Cali Woods', 'asset' => 'image7.png', 'pixels' => 400, 'class' => 'partners__logo--cali' ),
	array( 'name' => 'Low Carb Haven', 'asset' => 'image8.png', 'pixels' => 504, 'class' => 'partners__logo--low-carb' ),
	array( 'name' => 'Manage', 'asset' => 'image9.png', 'pixels' => 400, 'class' => 'partners__logo--manage' ),
	array( 'name' => 'Follow', 'asset' => 'image10.png', 'pixels' => 648, 'class' => 'partners__logo--follow' ),
	array( 'name' => 'Tikitibu', 'asset' => 'image11.png', 'pixels' => 1200, 'class' => 'partners__logo--tikitibu' ),
);
?>
<section id="partners" class="section partners" aria-label="Clients and partners">
<p class="section__item partners__title section__text">
              Clients and Partners
            </p>
<div class="partners__carousel" data-logo-carousel tabindex="0" role="group" aria-label="Client and partner logos. Focus to pause scrolling.">
<div class="partners__track">
<?php for ( $copy = 0; $copy < 2; $copy++ ) : ?>
<ul class="partners__group" role="list"<?php echo $copy ? ' data-logo-clone aria-hidden="true" inert' : ''; ?>>
<?php foreach ( $partner_logos as $logo ) : ?>
<li class="partners__logo <?php echo esc_attr( $logo['class'] ); ?>">
<span class="partners__image"><img alt="<?php echo $copy ? '' : esc_attr( $logo['name'] ); ?>" src="<?php echo oxen_asset( $logo['asset'] ); ?>" width="<?php echo esc_attr( $logo['pixels'] ); ?>" height="<?php echo esc_attr( $logo['pixels'] ); ?>" decoding="async"></span>
</li>
<?php endforeach; ?>
</ul>
<?php endfor; ?>
</div>
</div>
</section>
