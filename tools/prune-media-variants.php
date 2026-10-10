<?php
/** Remove only obsolete Oxen variants left by a previous optimisation revision. */
if ( ! defined( 'WP_CLI' ) || ! WP_CLI || realpath( get_template_directory() ) !== realpath( dirname( __DIR__ ) ) ) { exit; }
$uploads = wp_upload_dir(); $used = array(); $owned = array();
$attachments = get_posts( array( 'post_type' => 'attachment', 'post_status' => 'inherit', 'posts_per_page' => -1 ) );
foreach ( $attachments as $attachment ) {
	$file = get_attached_file( $attachment->ID ); $meta = wp_get_attachment_metadata( $attachment->ID );
	$used[ wp_normalize_path( $file ) ] = true;
	foreach ( $meta['sizes'] ?? array() as $size ) { $used[ wp_normalize_path( dirname( $file ) . '/' . $size['file'] ) ] = true; }
	if ( get_post_meta( $attachment->ID, '_oxen_source_sha256', true ) && in_array( $attachment->post_mime_type, array( 'image/avif', 'image/webp' ), true ) ) { $owned[] = $file; }
}
$removed = 0; $bytes = 0;
foreach ( $owned as $file ) {
	$base = preg_quote( pathinfo( $file, PATHINFO_FILENAME ), '/' );
	$directory = wp_normalize_path( dirname( $file ) );
	if ( ! str_starts_with( $directory . '/', trailingslashit( wp_normalize_path( $uploads['basedir'] ) ) ) ) { WP_CLI::error( 'Attachment directory outside this site uploads.' ); }
	foreach ( glob( dirname( $file ) . '/' . pathinfo( $file, PATHINFO_FILENAME ) . '-*.' . pathinfo( $file, PATHINFO_EXTENSION ) ) as $candidate ) {
		if ( isset( $used[ wp_normalize_path( $candidate ) ] ) || ! preg_match( '/^' . $base . '-\d+w(?:-\d+)?\.(?:avif|webp)$/', basename( $candidate ) ) ) { continue; }
		$bytes += filesize( $candidate ); unlink( $candidate ); $removed++;
	}
}
WP_CLI::success( "Removed $removed unreferenced previous Oxen variants ($bytes bytes); active attachments unchanged." );
