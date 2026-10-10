<?php
/** Reusable onboarding step. */
defined( 'ABSPATH' ) || exit;
$variant = sanitize_html_class( $args['variant'] );
$description_tag = 'div' === $args['description_tag'] ? 'div' : 'p';
?>
<article class="layout-group process-card process-card--<?php echo esc_attr( $variant ); ?>">
	<?php if ( isset( $args['glow'] ) ) { oxen_render_decoration( $args['glow'] ); } ?>
	<div class="section__item section__visual process-card__frame--<?php echo esc_attr( $variant ); ?>" aria-hidden="true"></div>
	<p class="section__item section__text process-card__number--<?php echo esc_attr( $variant ); ?>"><?php echo esc_html( $args['number'] ); ?></p>
	<h3 class="section__item section__text process-card__title--<?php echo esc_attr( $variant ); ?>"><?php echo esc_html( $args['title'] ); ?></h3>
	<?php printf( '<%1$s class="section__item section__text process-card__description--%2$s">%3$s</%1$s>', $description_tag, esc_attr( $variant ), wp_kses_post( $args['description'] ) ); ?>
	<?php if ( isset( $args['button'] ) ) : ?>
		<a href="#contact" class="section__item section__visual button process-card__button" data-open-contact aria-haspopup="dialog">
			<span class="section__item section__text process-card__button-label"><?php echo esc_html( $args['button'] ); ?></span>
		</a>
	<?php endif; ?>
</article>
