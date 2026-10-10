<?php
/** Local CLI verification fixture: reversible assignments and a temporary admin session. */
if ( ! defined( 'WP_CLI' ) || ! WP_CLI ) { exit; }
$home = (int) get_option( 'page_on_front' );
$mode = $args[0] ?? 'inspect';
$admin = get_users( array( 'role' => 'administrator', 'number' => 1 ) )[0];
wp_set_current_user( $admin->ID );
if ( 'auth' === $mode ) {
	$expiration = time() + 3600;
	$token = WP_Session_Tokens::get_instance( $admin->ID )->create( $expiration );
	update_option( 'oxen_media_verification_session', array( 'user' => $admin->ID, 'token' => $token ), false );
	WP_CLI::line( wp_json_encode( array( 'home' => $home, 'cookies' => array( array( 'name' => AUTH_COOKIE, 'value' => wp_generate_auth_cookie( $admin->ID, $expiration, 'auth', $token ), 'url' => home_url() ), array( 'name' => LOGGED_IN_COOKIE, 'value' => wp_generate_auth_cookie( $admin->ID, $expiration, 'logged_in', $token ), 'url' => home_url() ) ) ) ) );
	return;
}
if ( 'replace' === $mode ) {
	$before = get_post_meta( $home, '_oxen_media', true );
	update_option( 'oxen_media_verification_backup', array( 'exists' => metadata_exists( 'post', $home, '_oxen_media' ), 'value' => $before ), false );
	$_POST['oxen_media_nonce'] = wp_create_nonce( 'oxen_save_media' );
	$_POST['oxen_media'] = array_merge( (array) $before, array( 'hero_portrait' => oxen_media_id( 'about_team_image' ), 'invalid_key' => 123, 'site_logo' => $home ) );
	wp_update_post( array( 'ID' => $home ) );
}
if ( 'restore' === $mode ) {
	$backup = get_option( 'oxen_media_verification_backup' );
	if ( $backup ) {
		$backup['exists'] ? update_post_meta( $home, '_oxen_media', $backup['value'] ) : delete_post_meta( $home, '_oxen_media' );
		delete_option( 'oxen_media_verification_backup' );
	}
	$session = get_option( 'oxen_media_verification_session' );
	if ( $session ) { WP_Session_Tokens::get_instance( $session['user'] )->destroy( $session['token'] ); delete_option( 'oxen_media_verification_session' ); }
}
$ids = array_values( (array) get_option( 'oxen_media_library' ) );
if ( 'http' === $mode ) {
	$resources = array();
	foreach ( array_unique( $ids ) as $id ) {
		$url = wp_get_attachment_url( $id ); $mime = get_post_mime_type( $id );
		$resources[] = array( 'url' => $url, 'mime' => $mime );
		foreach ( wp_get_attachment_metadata( $id )['sizes'] ?? array() as $size ) { $resources[] = array( 'url' => dirname( $url ) . '/' . $size['file'], 'mime' => $mime ); }
	}
	WP_CLI::line( wp_json_encode( $resources ) ); return;
}
$broken = array();
foreach ( array_unique( $ids ) as $id ) {
	$metadata = wp_get_attachment_metadata( $id );
	if ( ! oxen_valid_media( $id ) || ! file_exists( get_attached_file( $id ) ) || empty( $metadata['width'] ) || empty( $metadata['height'] ) ) { $broken[] = $id; }
	foreach ( $metadata['sizes'] ?? array() as $size ) { if ( ! file_exists( dirname( get_attached_file( $id ) ) . '/' . $size['file'] ) ) { $broken[] = $id; } }
}
$custom = (array) get_post_meta( $home, '_oxen_media', true );
$portrait = $custom['hero_portrait'] ?? get_option( 'oxen_media_library' )['hero_portrait'];
WP_CLI::line( wp_json_encode( array( 'home' => $home, 'template' => get_page_template_slug( $home ), 'static_home' => get_option( 'show_on_front' ), 'fields' => count( oxen_media_fields() ), 'attachments' => count( array_unique( $ids ) ), 'broken' => $broken, 'svg_upload_allowed' => isset( get_allowed_mime_types()['svg'] ), 'custom' => $custom, 'portrait_url' => wp_get_attachment_image_url( $portrait, 'full' ) ) ) );
