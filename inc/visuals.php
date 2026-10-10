<?php
/** Render original decorative assets with explicit transform/crop containers. */
defined( 'ABSPATH' ) || exit;

function oxen_render_decoration( array $visual ) {
	$classes = isset( $visual['class'] ) ? $visual['class'] : '';
	if ( isset( $visual['asset'] ) ) {
		$attributes = array( 'class' => $classes, 'alt' => '' );
		foreach ( array( 'width', 'height' ) as $dimension ) {
			if ( isset( $visual[ $dimension ] ) ) {
				$attributes[ $dimension ] = $visual[ $dimension ];
			}
		}
		echo oxen_media_image( $visual['asset'], $attributes );
		return;
	}
	printf( '<div class="%s" aria-hidden="true">', esc_attr( $classes ) );
	foreach ( isset( $visual['children'] ) ? $visual['children'] : array() as $child ) {
		oxen_render_decoration( $child );
	}
	echo '</div>';
}
