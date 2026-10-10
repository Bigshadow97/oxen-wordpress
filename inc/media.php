<?php
/** Native attachment-backed visual assets, shared by the Home page and site shell. */
defined( 'ABSPATH' ) || exit;

function oxen_media_fields() {
	static $fields;
	if ( null === $fields ) {
		$manifest = json_decode( file_get_contents( __DIR__ . '/media-manifest.json' ), true );
		$fields = array_column( $manifest['assets'], null, 'key' );
	}
	return $fields;
}

function oxen_media_assignments() {
	static $assignments;
	if ( null === $assignments ) {
		$defaults = (array) get_option( 'oxen_media_library', array() );
		$custom = (array) get_post_meta( (int) get_option( 'page_on_front' ), '_oxen_media', true );
		$ids = array_unique( array_filter( array_merge( array_values( $defaults ), array_values( $custom ) ) ) );
		if ( $ids ) {
			get_posts( array( 'post_type' => 'attachment', 'post_status' => 'inherit', 'post__in' => $ids, 'posts_per_page' => count( $ids ), 'update_post_meta_cache' => true, 'update_post_term_cache' => false ) );
		}
		$assignments = $defaults;
		foreach ( $custom as $key => $id ) {
			if ( isset( oxen_media_fields()[ $key ] ) && oxen_valid_media( $id ) ) { $assignments[ $key ] = (int) $id; }
		}
	}
	return $assignments;
}

function oxen_valid_media( $id ) {
	return 'attachment' === get_post_type( $id ) && wp_attachment_is_image( $id ) && ( 'image/svg+xml' !== get_post_mime_type( $id ) || get_post_meta( $id, '_oxen_sanitized_svg', true ) );
}

function oxen_media_id( $key ) {
	$id = (int) ( oxen_media_assignments()[ $key ] ?? 0 );
	return $id && oxen_valid_media( $id ) ? $id : 0;
}

function oxen_media_url( $key, $size = 'full' ) {
	return esc_url( wp_get_attachment_image_url( oxen_media_id( $key ), $size ) ?: '' );
}

function oxen_media_sizes( $key ) {
	if ( 'hero_portrait' === $key ) { return '(min-width: 1440px) calc(50vw + 490px), (min-width: 768px) calc((100vw - 92px) / 2.1), calc(100vw - 40px)'; }
	if ( 'hero_background' === $key ) { return '(min-width: 1440px) 100vw, 1px'; }
	if ( 'testimonial_background' === $key ) { return '(min-width: 1440px) calc(100vw + 100px), (min-width: 768px) 375px, 350px'; }
	if ( 'about_team_image' === $key ) { return '(min-width: 1440px) 55vw, 350px'; }
	if ( str_starts_with( $key, 'case_study_' ) ) { return '(min-width: 1440px) 45vw, 350px'; }
	if ( str_starts_with( $key, 'partner_' ) ) { return '180px'; }
	if ( str_starts_with( $key, 'team_portrait_' ) ) { return '80px'; }
	if ( 'site_logo' === $key ) { return '88px'; }
	if ( 'google_review_logo' === $key ) { return '25px'; }
	if ( 'footer_partner_logo' === $key ) { return '120px'; }
	return '100vw';
}

function oxen_media_image( $key, $attributes = array() ) {
	$id = oxen_media_id( $key );
	if ( ! $id ) { return ''; }
	$attributes = array_merge( array( 'alt' => oxen_media_fields()[ $key ]['alt'] ?? '', 'loading' => 'lazy', 'decoding' => 'async', 'fetchpriority' => 'auto', 'sizes' => oxen_media_sizes( $key ) ), $attributes );
	if ( 'hero_portrait' === $key ) { $attributes['fetchpriority'] = 'high'; }
	if ( in_array( $key, array( 'hero_portrait', 'hero_background', 'site_logo' ), true ) || str_starts_with( $attributes['class'] ?? '', 'hero__' ) ) { $attributes['loading'] = 'eager'; }
	// Browser auto-sizes measures the clipped box, losing pixels needed by transformed crops.
	$disable_auto_sizes = fn() => false;
	add_filter( 'wp_img_tag_add_auto_sizes', $disable_auto_sizes );
	$image = wp_get_attachment_image( $id, 'full', false, $attributes );
	remove_filter( 'wp_img_tag_add_auto_sizes', $disable_auto_sizes );
	// The texture is absent from the original tablet/mobile composition: do not fetch it there.
	if ( 'hero_background' === $key ) {
		$image = '<picture><source media="(max-width: 1439px)" srcset="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%271%27 height=%271%27/%3E">' . $image . '</picture>';
	}
	return $image;
}

/** Responsive uploads URL variables preserve existing background/mask geometry. */
add_action( 'wp_head', function () {
	$variables = array();
	foreach ( oxen_media_fields() as $key => $field ) {
		if ( array_filter( $field['components'], fn( $file ) => str_starts_with( $file, 'assets/css/' ) ) ) {
			// CSS raw-text URLs must retain query ampersands used by future CDN signatures.
			$url = esc_url_raw( wp_get_attachment_image_url( oxen_media_id( $key ), 'full' ) ?: '' );
			if ( $url ) { $variables[] = '--oxen-media-' . str_replace( '_', '-', $key ) . ':url("' . $url . '")'; }
		}
	}
	if ( $variables ) { echo '<style id="oxen-media-urls">:root{' . implode( ';', $variables ) . '}</style>'; }
	if ( ! is_page_template( 'page-templates/template-oxen-home.php' ) ) { return; }
	foreach ( array( 'hero_background' => '(min-width:1440px)', 'hero_portrait' => '(max-width:1439px)' ) as $key => $media ) {
		$id = oxen_media_id( $key );
		if ( ! $id ) { continue; }
		printf( '<link rel="preload" as="image" href="%s" imagesrcset="%s" imagesizes="%s" media="%s" fetchpriority="high">', oxen_media_url( $key ), esc_attr( wp_get_attachment_image_srcset( $id, 'full' ) ?: '' ), esc_attr( oxen_media_sizes( $key ) ), esc_attr( $media ) );
	}
}, 2 );

function oxen_sanitize_media_assignments( $value ) {
	$clean = array();
	foreach ( is_array( $value ) ? $value : array() as $key => $id ) {
		if ( isset( oxen_media_fields()[ $key ] ) && oxen_valid_media( absint( $id ) ) ) { $clean[ $key ] = absint( $id ); }
	}
	return $clean;
}

add_action( 'init', function () {
	$properties = array_fill_keys( array_keys( oxen_media_fields() ), array( 'type' => 'integer', 'minimum' => 0 ) );
	register_post_meta( 'page', '_oxen_media', array( 'type' => 'object', 'single' => true, 'sanitize_callback' => 'oxen_sanitize_media_assignments', 'auth_callback' => fn( $allowed, $key, $id ) => current_user_can( 'edit_post', $id ) && current_user_can( 'upload_files' ), 'show_in_rest' => array( 'schema' => array( 'type' => 'object', 'properties' => $properties, 'additionalProperties' => false ) ) ) );
} );

add_action( 'add_meta_boxes_page', function ( $post ) {
	if ( 'page-templates/template-oxen-home.php' !== get_page_template_slug( $post ) ) { return; }
	add_meta_box( 'oxen-home-media', __( 'Oxen homepage images', 'oxen' ), function ( $post ) {
		wp_nonce_field( 'oxen_save_media', 'oxen_media_nonce' );
		$custom = (array) get_post_meta( $post->ID, '_oxen_media', true );
		$defaults = (array) get_option( 'oxen_media_library', array() );
		echo '<p>Choose native Media Library images. Reset restores the imported original. Decorative SVGs require the sanitised CLI import.</p><div class="oxen-media-grid">';
		foreach ( oxen_media_fields() as $key => $field ) {
			$id = (int) ( $custom[ $key ] ?? $defaults[ $key ] ?? 0 );
			printf( '<div class="oxen-media-field"><strong>%s</strong><img src="%s" alt=""><input type="hidden" name="oxen_media[%s]" value="%s"><button type="button" class="button oxen-media-choose">Choose image</button> <button type="button" class="button-link oxen-media-reset" data-default="%s">Reset</button><code>%s</code></div>', esc_html( $field['label'] ), esc_url( wp_get_attachment_url( $id ) ?: '' ), esc_attr( $key ), esc_attr( $id ), esc_url( wp_get_attachment_url( $defaults[ $key ] ?? 0 ) ?: '' ), esc_html( $key ) );
		}
		echo '</div>';
	}, 'page', 'normal', 'default' );
} );

add_action( 'admin_enqueue_scripts', function ( $hook ) {
	if ( ! in_array( $hook, array( 'post.php', 'post-new.php' ), true ) || 'page-templates/template-oxen-home.php' !== get_page_template_slug( get_the_ID() ) ) { return; }
	wp_enqueue_media();
	wp_enqueue_script( 'oxen-media-admin', get_template_directory_uri() . '/assets/js/media-admin.js', array( 'media-views' ), filemtime( get_template_directory() . '/assets/js/media-admin.js' ), true );
	wp_enqueue_style( 'oxen-media-admin', get_template_directory_uri() . '/assets/css/media-admin.css', array(), filemtime( get_template_directory() . '/assets/css/media-admin.css' ) );
} );

add_action( 'save_post_page', function ( $id ) {
	if ( empty( $_POST['oxen_media_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['oxen_media_nonce'] ) ), 'oxen_save_media' ) || wp_is_post_revision( $id ) || wp_is_post_autosave( $id ) || ! current_user_can( 'edit_post', $id ) || ! current_user_can( 'upload_files' ) || 'page-templates/template-oxen-home.php' !== get_page_template_slug( $id ) ) { return; }
	update_post_meta( $id, '_oxen_media', oxen_sanitize_media_assignments( wp_unslash( $_POST['oxen_media'] ?? array() ) ) );
} );

// SVG uploading remains disabled. Only the validated importer sets this trust marker.
add_filter( 'wp_prepare_attachment_for_js', function ( $response, $attachment ) {
	if ( 'image/svg+xml' === $attachment->post_mime_type && get_post_meta( $attachment->ID, '_oxen_sanitized_svg', true ) ) {
		$meta = wp_get_attachment_metadata( $attachment->ID );
		$width = $meta['width'] ?? 1; $height = $meta['height'] ?? 1;
		$response['sizes']['full'] = array( 'url' => wp_get_attachment_url( $attachment->ID ), 'width' => $width, 'height' => $height, 'orientation' => $width > $height ? 'landscape' : 'portrait' );
	}
	return $response;
}, 10, 2 );

add_action( 'admin_notices', function () {
	if ( current_user_can( 'manage_options' ) && ! get_option( 'oxen_media_library' ) ) {
		echo '<div class="notice notice-warning"><p>' . esc_html__( 'Oxen media is not configured. Restore the associated database and uploads from an authorised site backup, or assign images in the Oxen Homepage page editor.', 'oxen' ) . '</p></div>';
	}
} );
