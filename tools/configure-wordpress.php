<?php
/** Run with LocalWP PHP + WP-CLI eval-file. Local setup only; never theme startup. */
defined( 'ABSPATH' ) || exit;
$expected = 'C:/Users/sachi/Local Sites/oxen-development/app/public';
if ( strtolower( wp_normalize_path( realpath( ABSPATH ) ) ) !== strtolower( $expected ) || get_stylesheet() !== 'oxen' ) {
	WP_CLI::error( 'This setup applies only to the oxen-development LocalWP installation with Oxen active.' );
}
$template = 'page-templates/template-oxen-home.php';
if ( ! isset( wp_get_theme()->get_page_templates()[ $template ] ) ) {
	WP_CLI::error( 'Oxen Homepage template is unavailable.' );
}
$home = get_page_by_path( 'home', OBJECT, 'page' );
if ( ! $home ) {
	$matches = get_posts( array( 'post_type' => 'page', 'post_status' => array( 'publish', 'draft', 'private', 'pending', 'future' ), 'title' => 'Home', 'numberposts' => 1 ) );
	$home = $matches ? $matches[0] : null;
}
$home_id = $home ? $home->ID : wp_insert_post( array( 'post_type' => 'page', 'post_title' => 'Home', 'post_name' => 'home', 'post_status' => 'publish' ), true );
if ( is_wp_error( $home_id ) ) { WP_CLI::error( $home_id->get_error_message() ); }
if ( $home && $home->post_status !== 'publish' ) { wp_update_post( array( 'ID' => $home_id, 'post_status' => 'publish' ) ); }
update_post_meta( $home_id, '_wp_page_template', $template );
update_option( 'page_on_front', $home_id );
update_option( 'show_on_front', 'page' );

// Existing design destinations are seed data, never hardcoded template links.
$menus = array(
	'primary' => array( 'Oxen Primary', array(
		array( 'Services', home_url( '/#services' ), 'menu-plus' ),
		array( 'About us', home_url( '/#about' ) ),
		array( 'Resources', home_url( '/#calculator' ) ),
		array( 'Podcasts', 'https://oxen.nz/podcasts/' ),
		array( 'News & Insights', home_url( '/#results' ) ),
		array( 'Contact us', home_url( '/#contact' ), 'menu-contact' ),
	) ),
	'footer_services' => array( 'Oxen Footer Services', array(
		array( 'Tax Preparation', 'https://oxen.nz/services/income-tax-tax-returns/' ),
		array( 'Budgeting and Forecasting', 'https://oxen.nz/services/cash-flow-budgeting-forecasting/' ),
		array( 'Tax Advice', 'https://oxen.nz/services/tax-advice-financial-reporting/' ),
		array( 'Financial Planning', 'https://oxen.nz/services/business-and-financial-coaching/' ),
		array( 'Financial Coaching', 'https://oxen.nz/services/business-and-financial-coaching/' ),
	) ),
	'footer_resources' => array( 'Oxen Footer Resources', array(
		array( 'Resources', home_url( '/#calculator' ) ),
		array( 'News and Articles', home_url( '/#results' ) ),
		array( 'Our Story', home_url( '/#about' ) ),
	) ),
	'footer_legal' => array( 'Oxen Footer Policies', array(
		array( 'Privacy Policy', 'https://oxen.nz/privacy-policy/' ),
		array( 'Cookies Policy', '#policy-dialog', 'menu-cookie' ),
	) ),
	'footer_social' => array( 'Oxen Footer Social', array(
		array( 'Youtube', 'https://www.youtube.com/@OxenAccounting' ),
		array( 'Spotify', 'https://oxen.nz/podcasts/' ),
		array( 'Twitter', '#social-dialog', 'menu-social-alternatives' ),
		array( 'Instagram', 'https://www.instagram.com/oxenaccounting/' ),
		array( 'Linkedin', 'https://www.linkedin.com/company/oxenaccounting/' ),
	) ),
);
$locations = get_nav_menu_locations();
foreach ( $menus as $location => $definition ) {
	list( $name, $items ) = $definition;
	$menu = ! empty( $locations[ $location ] ) ? wp_get_nav_menu_object( $locations[ $location ] ) : wp_get_nav_menu_object( $name );
	$menu_id = $menu ? $menu->term_id : wp_create_nav_menu( $name );
	if ( is_wp_error( $menu_id ) ) { WP_CLI::error( $menu_id->get_error_message() ); }
	// Seed empty menus only: rerunning never duplicates or replaces CMS edits.
	if ( ! wp_get_nav_menu_items( $menu_id ) ) {
		foreach ( $items as $order => $item ) {
			$result = wp_update_nav_menu_item( $menu_id, 0, array(
				'menu-item-title' => $item[0], 'menu-item-url' => $item[1],
				'menu-item-classes' => isset( $item[2] ) ? $item[2] : '',
				'menu-item-type' => 'custom', 'menu-item-status' => 'publish', 'menu-item-position' => $order + 1,
			) );
			if ( is_wp_error( $result ) ) { WP_CLI::error( $result->get_error_message() ); }
		}
	}
	$locations[ $location ] = (int) $menu_id;
}
set_theme_mod( 'nav_menu_locations', $locations );
WP_CLI::success( 'Home ' . $home_id . ' published, Oxen Homepage assigned, static homepage set, existing menu locations configured.' );
echo wp_json_encode( array( 'home_id' => $home_id, 'template' => get_page_template_slug( $home_id ), 'locations' => $locations ), JSON_PRETTY_PRINT ) . "\n";
