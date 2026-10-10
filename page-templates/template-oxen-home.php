<?php
/**
 * Template Name: Oxen Homepage
 * Template Post Type: page
 */
defined( 'ABSPATH' ) || exit;
get_header();

?>
<main id="main-content" class="oxen-home">
<?php
foreach ( array( 'hero', 'statistics', 'quiz', 'services', 'about', 'process', 'results', 'testimonials', 'partners', 'tax-intro', 'calculator', 'contact' ) as $section ) {
	get_template_part( 'template-parts/home/' . $section );
}
?>
</main>
<?php
get_template_part( 'template-parts/home/dialogs' );
get_footer();
