<?php
/** Prebuilt assets only: no compilation or image processing on page requests. */
defined( 'ABSPATH' ) || exit;

add_action( 'wp_enqueue_scripts', function () {
	$path = get_template_directory(); $uri = get_template_directory_uri();
	$home = is_page_template( 'page-templates/template-oxen-home.php' );
	if ( $home ) {
		wp_register_style( 'oxen-critical', false );
		wp_enqueue_style( 'oxen-critical' );
		$critical = file_get_contents( $path . '/assets/dist/critical.min.css' );
		// Inline styles have no stylesheet base URL. Font URLs remain migration-safe.
		wp_add_inline_style( 'oxen-critical', str_replace( '../fonts/', esc_url( $uri . '/assets/fonts/' ), $critical ) );
	}
	$file = '/assets/dist/' . ( $home ? 'home' : 'shell' ) . '.min.css';
	wp_enqueue_style( $home ? 'oxen-home' : 'oxen-shell', $uri . $file, array(), (string) filemtime( $path . $file ) );
	$modules = $home ? array( 'site', 'tax', 'partners', 'services', 'quiz', 'accordion', 'testimonials', 'calculator' ) : array( 'site' );
	foreach ( $modules as $module ) {
		$file = '/assets/dist/' . $module . '.min.js';
		$deps = 'site' === $module || 'tax' === $module ? array() : array( 'calculator' === $module ? 'oxen-tax' : 'oxen-site' );
		wp_enqueue_script( 'oxen-' . $module, $uri . $file, $deps, (string) filemtime( $path . $file ), array( 'in_footer' => true, 'strategy' => 'defer' ) );
	}
} );

add_filter( 'style_loader_tag', function ( $html, $handle ) {
	if ( 'oxen-home' !== $handle ) { return $html; }
	return str_replace( "media='all'", "media='print' onload=\"this.media='all'\"", $html ) . '<noscript>' . $html . '</noscript>';
}, 10, 2 );

add_action( 'wp_head', function () {
	if ( ! is_page_template( 'page-templates/template-oxen-home.php' ) ) { return; }
	foreach ( array( 'satoshi-400-normal.woff2', 'noto-serif-400-italic.woff2' ) as $font ) {
		printf( '<link rel="preload" as="font" type="font/woff2" href="%s" crossorigin>', esc_url( get_template_directory_uri() . '/assets/fonts/' . $font ) );
	}
}, 1 );

// Native browser emoji rendering preserves text without the compatibility runtime.
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );
remove_action( 'wp_enqueue_scripts', 'wp_enqueue_emoji_styles' );
