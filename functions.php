<?php
/** Oxen theme setup and assets. */
defined( 'ABSPATH' ) || exit;

add_action( 'after_setup_theme', function () {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
	add_theme_support( 'custom-logo', array( 'height' => 18, 'width' => 88, 'flex-height' => true, 'flex-width' => true ) );
	register_nav_menus( array(
		'primary' => __( 'Primary navigation', 'oxen' ),
		'footer_services' => __( 'Footer services', 'oxen' ),
		'footer_resources' => __( 'Footer resources', 'oxen' ),
		'footer_legal' => __( 'Footer policies', 'oxen' ),
		'footer_social' => __( 'Footer social links', 'oxen' ),
	) );
} );

require_once get_template_directory() . '/inc/class-oxen-menu-walker.php';
require_once get_template_directory() . '/inc/media.php';
require_once get_template_directory() . '/inc/visuals.php';

// The social alternatives dialog uses the same CMS links, excluding its opener.
add_filter( 'wp_nav_menu_objects', function ( $items, $args ) {
	if ( empty( $args->oxen_exclude_classes ) ) { return $items; }
	return array_filter( $items, function ( $item ) use ( $args ) {
		return ! array_intersect( (array) $item->classes, $args->oxen_exclude_classes );
	} );
}, 10, 2 );

require_once get_template_directory() . '/inc/performance.php';

/** Satoshi's license requires each reviewer to obtain their own original files. */
add_action( 'admin_notices', function () {
	if ( ! current_user_can( 'manage_options' ) || file_exists( get_template_directory() . '/assets/fonts/satoshi-400-normal.woff2' ) ) {
		return;
	}
	echo '<div class="notice notice-error"><p>' . esc_html__( 'Oxen needs the original Satoshi font files. Run tools/install-fonts.ps1 from the theme directory before reviewing the design. See README.md for official font sources and licensing.', 'oxen' ) . '</p></div>';
} );
