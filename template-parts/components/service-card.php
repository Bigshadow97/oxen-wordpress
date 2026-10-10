<?php
/** Reusable service card; content is supplied by inc/home-services.php. */
defined( 'ABSPATH' ) || exit;
$variant = sanitize_html_class( $args['variant'] );
?>
<article id="service-<?php echo esc_attr( absint( $args['index'] ) ); ?>" class="layout-group service-card service-card--<?php echo esc_attr( $variant ); ?>" data-service-card>
	<?php foreach ( $args['decorations'] as $decoration ) { oxen_render_decoration( $decoration ); } ?>
	<p class="section__item section__text service-card__stage service-card__stage--<?php echo esc_attr( $variant ); ?>"><?php echo esc_html( $args['stage'] ); ?></p>
	<?php if ( isset( $args['popular_badge'] ) ) : ?>
		<p class="section__item section__text service-card__popular-badge service-card__popular-badge--<?php echo esc_attr( $variant ); ?>"><?php echo esc_html( $args['popular_badge'] ); ?></p>
	<?php endif; ?>
	<h3 class="section__item section__text service-card__title service-card__title--<?php echo esc_attr( $variant ); ?>"><?php echo esc_html( $args['title'] ); ?></h3>
	<p class="section__item section__text service-card__revenue service-card__revenue--<?php echo esc_attr( $variant ); ?>"><?php echo esc_html( $args['revenue'] ); ?></p>
	<p class="section__item section__text service-card__description service-card__description--<?php echo esc_attr( $variant ); ?>"><?php echo esc_html( $args['description'] ); ?></p>
	<ul class="service-card__features" role="list">
		<?php foreach ( $args['features'] as $feature ) : ?>
			<li class="service-card__feature-item">
				<?php oxen_render_decoration( $feature['icon'] ); ?>
				<p class="section__item section__text service-card__feature service-card__<?php echo esc_attr( sanitize_html_class( $feature['key'] ) ); ?>-feature--<?php echo esc_attr( $variant ); ?>"><?php echo esc_html( $feature['label'] ); ?></p>
			</li>
		<?php endforeach; ?>
	</ul>
	<a href="#contact" class="section__item section__visual button service-card__button--<?php echo esc_attr( $variant ); ?>" data-open-contact aria-haspopup="dialog">
		<span class="section__item section__text service-card__button-label--<?php echo esc_attr( $variant ); ?>"><?php echo esc_html( $args['button'] ); ?></span>
		<?php oxen_render_decoration( $args['button_icon'] ); ?>
	</a>
</article>
