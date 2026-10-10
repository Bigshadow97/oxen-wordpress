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
require_once get_template_directory() . '/inc/visuals.php';

// The social alternatives dialog uses the same CMS links, excluding its opener.
add_filter( 'wp_nav_menu_objects', function ( $items, $args ) {
	if ( empty( $args->oxen_exclude_classes ) ) { return $items; }
	return array_filter( $items, function ( $item ) use ( $args ) {
		return ! array_intersect( (array) $item->classes, $args->oxen_exclude_classes );
	} );
}, 10, 2 );

add_action( 'wp_enqueue_scripts', function () {
	$path = get_template_directory();
	$uri  = get_template_directory_uri();
	$is_home = is_page_template( 'page-templates/template-oxen-home.php' );
	$sheets = $is_home ? array( 'fonts', 'base', 'hero', 'statistics', 'quiz', 'services', 'about', 'process', 'case-studies', 'testimonials', 'partners', 'tax-intro', 'calculator', 'contact' ) : array( 'fonts', 'base' );
	$sheets[] = 'site';
	$sheets[] = 'site-footer';
	foreach ( $sheets as $sheet ) {
		$file = '/assets/css/' . $sheet . '.css';
		if ( file_exists( $path . $file ) ) {
			wp_enqueue_style( 'oxen-' . $sheet, $uri . $file, array(), (string) filemtime( $path . $file ) );
		}
	}
	wp_enqueue_script( 'oxen-site', $uri . '/assets/js/site.js', array(), (string) filemtime( $path . '/assets/js/site.js' ), array( 'in_footer' => true, 'strategy' => 'defer' ) );
	if ( $is_home ) {
		wp_enqueue_script( 'oxen-tax', $uri . '/assets/js/tax.js', array(), (string) filemtime( $path . '/assets/js/tax.js' ), array( 'in_footer' => true, 'strategy' => 'defer' ) );
		foreach ( array( 'partners', 'services', 'quiz', 'accordion', 'testimonials', 'calculator' ) as $module ) {
			$script = '/assets/js/' . $module . '.js';
			$dependencies = 'calculator' === $module ? array( 'oxen-tax' ) : array( 'oxen-site' );
			wp_enqueue_script( 'oxen-' . $module, $uri . $script, $dependencies, (string) filemtime( $path . $script ), array( 'in_footer' => true, 'strategy' => 'defer' ) );
		}
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
