<?php
/** Render original decorative assets with explicit transform/crop containers. */
defined( 'ABSPATH' ) || exit;

function oxen_render_decoration( array $visual ) {
	$classes = isset( $visual['class'] ) ? $visual['class'] : '';
	if ( isset( $visual['asset'] ) ) {
		printf( '<img class="%s" src="%s" alt="" decoding="async"', esc_attr( $classes ), oxen_asset( $visual['asset'] ) );
		foreach ( array( 'width', 'height' ) as $dimension ) {
			if ( isset( $visual[ $dimension ] ) ) {
				printf( ' %s="%s"', esc_attr( $dimension ), esc_attr( $visual[ $dimension ] ) );
			}
		}
		echo '>';
		return;
	}
	printf( '<div class="%s" aria-hidden="true">', esc_attr( $classes ) );
	foreach ( isset( $visual['children'] ) ? $visual['children'] : array() as $child ) {
		oxen_render_decoration( $child );
	}
	echo '</div>';
}
