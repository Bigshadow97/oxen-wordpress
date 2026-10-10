<?php
/** WP-CLI only: import already optimised, hash-verified assets into this Oxen site. */
if ( ! defined( 'WP_CLI' ) || ! WP_CLI ) { exit; }
if ( 'oxen' !== get_stylesheet() || realpath( get_template_directory() ) !== realpath( dirname( __DIR__ ) ) ) { WP_CLI::error( 'Run this importer only against its own Oxen installation.' ); }
require_once ABSPATH . 'wp-admin/includes/image.php';
$directory = realpath( $args[0] ?? __DIR__ . '/media-build/optimized' );
$manifest = $directory ? json_decode( file_get_contents( $directory . '/manifest.json' ), true ) : null;
if ( empty( $manifest['assets'] ) ) { WP_CLI::error( 'Missing optimised media manifest.' ); }

function oxen_import_validate_svg( $file ) {
	$text = file_get_contents( $file );
	if ( preg_match( '/<!DOCTYPE|<!ENTITY/i', $text ) ) { throw new RuntimeException( 'SVG entities are forbidden.' ); }
	$xml = new DOMDocument();
	if ( ! $xml->loadXML( $text, LIBXML_NONET ) ) { throw new RuntimeException( 'Invalid SVG.' ); }
	$allowed = explode( ' ', 'svg g defs path rect circle ellipse line polyline polygon linearGradient radialGradient stop clipPath mask filter feGaussianBlur feBlend feFlood feComposite feColorMatrix feOffset feMerge feMergeNode feComponentTransfer feFuncR feFuncG feFuncB feFuncA feDropShadow use title desc' );
	foreach ( $xml->getElementsByTagName( '*' ) as $node ) {
		if ( ! in_array( $node->localName, $allowed, true ) ) { throw new RuntimeException( 'Unsafe SVG element.' ); }
		foreach ( $node->attributes as $attribute ) {
			$name = strtolower( $attribute->localName ); $value = $attribute->value;
			if ( str_starts_with( $name, 'on' ) || 'src' === $name || ( 'href' === $name && ! str_starts_with( $value, '#' ) ) || preg_match( '/javascript:|@import|expression\s*\(|(?:https?|file|data):/i', $value ) ) { throw new RuntimeException( 'Unsafe SVG attribute.' ); }
			preg_match_all( '/url\(([^)]+)\)/i', $value, $matches );
			foreach ( $matches[1] as $reference ) { if ( ! str_starts_with( trim( $reference, " \"'" ), '#' ) ) { throw new RuntimeException( 'External SVG resource.' ); } }
		}
	}
}

// Validate the complete batch before creating any uploads or attachment records.
foreach ( $manifest['assets'] as $asset ) {
	if ( ! isset( oxen_media_fields()[ $asset['key'] ] ) || ! in_array( $asset['mime'], array( 'image/avif', 'image/webp', 'image/svg+xml' ), true ) ) { WP_CLI::error( 'Unexpected asset key or MIME.' ); }
	foreach ( array_merge( array( $asset ), $asset['sizes'] ) as $file ) {
		if ( basename( $file['file'] ) !== $file['file'] || ! preg_match( '/^[a-z0-9_-]+\.(?:avif|webp|svg)$/', $file['file'] ) ) { WP_CLI::error( 'Unsafe optimised filename.' ); }
		$path = $directory . '/' . basename( $file['file'] );
		if ( ! is_file( $path ) || hash_file( 'sha256', $path ) !== $file['sha256'] ) { WP_CLI::error( 'Media hash mismatch: ' . $file['file'] ); }
		if ( 'image/svg+xml' === $asset['mime'] ) { oxen_import_validate_svg( $path ); }
		elseif ( wp_get_image_mime( $path ) !== $asset['mime'] ) { WP_CLI::error( 'Raster MIME mismatch.' ); }
	}
}

$uploads = wp_upload_dir();
if ( $uploads['error'] ) { WP_CLI::error( $uploads['error'] ); }
$map = array(); $created = 0; $reused = 0;
add_filter( 'intermediate_image_sizes_advanced', '__return_empty_array' );
add_filter( 'big_image_size_threshold', '__return_false' );
foreach ( $manifest['assets'] as $asset ) {
	$existing = get_posts( array( 'post_type' => 'attachment', 'post_status' => 'inherit', 'posts_per_page' => 1, 'fields' => 'ids', 'meta_key' => '_oxen_source_sha256', 'meta_value' => $asset['source_sha256'] ) );
	if ( $existing && oxen_valid_media( $existing[0] ) && get_post_meta( $existing[0], '_oxen_optimized_sha256', true ) === $asset['sha256'] ) { $map[ $asset['key'] ] = (int) $existing[0]; $reused++; continue; }
	$refresh = $existing && oxen_valid_media( $existing[0] );
	$old_metadata = $refresh ? wp_get_attachment_metadata( $existing[0] ) : array();
	$filename = $refresh ? basename( get_attached_file( $existing[0] ) ) : wp_unique_filename( $uploads['path'], $asset['file'] );
	$target = $refresh ? get_attached_file( $existing[0] ) : $uploads['path'] . '/' . $filename;
	if ( ! copy( $directory . '/' . $asset['file'], $target ) ) { WP_CLI::error( 'Unable to copy optimised asset.' ); }
	$id = $refresh ? $existing[0] : wp_insert_attachment( array( 'post_title' => $asset['label'], 'post_mime_type' => $asset['mime'], 'post_status' => 'inherit' ), $target, (int) get_option( 'page_on_front' ), true );
	if ( is_wp_error( $id ) ) { WP_CLI::error( $id->get_error_message() ); }
	if ( 'image/svg+xml' === $asset['mime'] ) {
		update_post_meta( $id, '_oxen_sanitized_svg', $asset['sha256'] );
		$metadata = array( 'width' => $asset['width'], 'height' => $asset['height'], 'file' => _wp_relative_upload_path( $target ), 'sizes' => array(), 'filesize' => filesize( $target ) );
	} else { $metadata = wp_generate_attachment_metadata( $id, $target ); }
	$target_directory = dirname( $target );
	foreach ( $asset['sizes'] as $size ) {
		$name = $old_metadata['sizes'][ $size['name'] ]['file'] ?? wp_unique_filename( $target_directory, $size['file'] );
		if ( ! copy( $directory . '/' . $size['file'], $target_directory . '/' . $name ) ) { WP_CLI::error( 'Unable to copy responsive variant.' ); }
		$metadata['sizes'][ $size['name'] ] = array( 'file' => $name, 'width' => $size['width'], 'height' => $size['height'], 'mime-type' => $asset['mime'], 'filesize' => $size['filesize'] );
	}
	wp_update_attachment_metadata( $id, $metadata );
	update_post_meta( $id, '_wp_attachment_image_alt', $asset['alt'] );
	update_post_meta( $id, '_oxen_source_sha256', $asset['source_sha256'] );
	update_post_meta( $id, '_oxen_optimized_sha256', $asset['sha256'] );
	$map[ $asset['key'] ] = $id;
	$refresh ? $reused++ : $created++;
}
update_option( 'oxen_media_library', $map, false );
if ( ! metadata_exists( 'post', (int) get_option( 'page_on_front' ), '_oxen_media' ) ) {
	update_post_meta( (int) get_option( 'page_on_front' ), '_oxen_media', $map );
}
// Custom choices remain overrides. The defaults option is the reversible imported set.
WP_CLI::success( wp_json_encode( array( 'created' => $created, 'reused' => $reused, 'fields' => count( $map ), 'unique_attachments' => count( array_unique( $map ) ), 'variants' => $manifest['summary']['variants'] ) ) );
