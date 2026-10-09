<?php
/** Oxen theme setup and assets. */
defined( 'ABSPATH' ) || exit;

add_action( 'after_setup_theme', function () {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
	register_nav_menus( array( 'primary' => __( 'Primary navigation', 'oxen' ) ) );
} );

add_action( 'wp_enqueue_scripts', function () {
	$path = get_template_directory();
	$uri  = get_template_directory_uri();
	$sheets = is_front_page() ? array( 'fonts', 'base', 'homepage', 'responsive', 'wide-measurements', 'wide' ) : array( 'fonts', 'base' );
	foreach ( $sheets as $sheet ) {
		$file = '/assets/css/' . $sheet . '.css';
		if ( file_exists( $path . $file ) ) {
			wp_enqueue_style( 'oxen-' . $sheet, $uri . $file, array(), (string) filemtime( $path . $file ) );
		}
	}
	$file = '/assets/js/homepage.js';
	if ( is_front_page() && file_exists( $path . $file ) ) {
		wp_enqueue_script( 'oxen-tax', $uri . '/assets/js/tax.js', array(), (string) filemtime( $path . '/assets/js/tax.js' ), array( 'in_footer' => true, 'strategy' => 'defer' ) );
		wp_enqueue_script( 'oxen-homepage', $uri . $file, array( 'oxen-tax' ), (string) filemtime( $path . $file ), array( 'in_footer' => true, 'strategy' => 'defer' ) );
	}
} );

/** Resolve locally stored original Figma assets. */
function oxen_asset( $file ) {
	return esc_url( get_template_directory_uri() . '/assets/images/' . $file );
}

/** Satoshi's license requires each reviewer to obtain their own original files. */
add_action( 'admin_notices', function () {
	if ( ! current_user_can( 'manage_options' ) || file_exists( get_template_directory() . '/assets/fonts/satoshi-400-normal.woff2' ) ) {
		return;
	}
	echo '<div class="notice notice-error"><p>' . esc_html__( 'Oxen needs the original Satoshi font files. Run tools/install-fonts.ps1 from the theme directory before reviewing the design. See README.md for official font sources and licensing.', 'oxen' ) . '</p></div>';
} );
