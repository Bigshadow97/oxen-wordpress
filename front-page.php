<?php
/** Complete original Oxen homepage: Figma file X8BzSNzhFvn61KCmzWsEPY, node 1:3. */
defined( 'ABSPATH' ) || exit;
get_header();
get_template_part( 'template-parts/home/navigation' );
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
