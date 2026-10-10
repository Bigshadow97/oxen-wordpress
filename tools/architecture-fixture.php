<?php
/** Reversible CMS fixture for the focused architecture check. */
defined( 'ABSPATH' ) || exit;
if ( strtolower( wp_normalize_path( realpath( ABSPATH ) ) ) !== strtolower( 'C:/Users/sachi/Local Sites/oxen-development/app/public' ) ) {
	WP_CLI::error( 'Wrong installation.' );
}
$mode = isset( $args[0] ) ? $args[0] : 'inspect';
$locations = get_nav_menu_locations();
if ( $mode === 'edit' ) {
	if ( get_option( '_oxen_architecture_qa' ) ) { WP_CLI::error( 'Restore the pending fixture first.' ); }
	$item = wp_get_nav_menu_items( $locations['primary'] )[0];
	update_option( '_oxen_architecture_qa', array( 'item' => $item->ID, 'title' => $item->title ), false );
	wp_update_post( array( 'ID' => $item->ID, 'post_title' => 'Services CMS verification' ) );
	$child = wp_update_nav_menu_item( $locations['primary'], 0, array( 'menu-item-title' => 'CMS submenu check', 'menu-item-url' => home_url( '/#services' ), 'menu-item-parent-id' => $item->ID, 'menu-item-type' => 'custom', 'menu-item-status' => 'publish' ) );
	if ( is_wp_error( $child ) ) { WP_CLI::error( $child->get_error_message() ); }
	$backup = get_option( '_oxen_architecture_qa' ); $backup['child'] = $child;
	update_option( '_oxen_architecture_qa', $backup, false );
} elseif ( $mode === 'restore' ) {
	$backup = get_option( '_oxen_architecture_qa' );
	if ( $backup ) {
		wp_update_post( array( 'ID' => $backup['item'], 'post_title' => $backup['title'] ) );
		if ( ! empty( $backup['child'] ) ) { wp_delete_post( $backup['child'], true ); }
		delete_option( '_oxen_architecture_qa' );
	}
}
$home = get_post( get_option( 'page_on_front' ) );
echo wp_json_encode( array(
	'php' => PHP_VERSION, 'theme' => get_stylesheet(), 'show_on_front' => get_option( 'show_on_front' ),
	'home_id' => $home->ID, 'home_status' => $home->post_status,
	'template' => get_page_template_slug( $home ), 'available_templates' => wp_get_theme()->get_page_templates(),
	'locations' => $locations, 'menu_count' => count( wp_get_nav_menus() ),
	'menu_items' => array_map( function ( $id ) { return count( wp_get_nav_menu_items( $id ) ); }, $locations ),
	'standard_url' => get_permalink( 2 ),
) );
