<?php
/** Standard WordPress fallback. */
defined( 'ABSPATH' ) || exit;
get_header();
?>
<main id="main-content" class="content-page">
<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
	<article <?php post_class(); ?>>
		<h1><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h1>
		<?php the_content(); ?>
	</article>
<?php endwhile; the_posts_navigation(); else : ?>
	<h1><?php esc_html_e( 'Welcome to Oxen', 'oxen' ); ?></h1>
<?php endif; ?>
</main>
<?php get_footer(); ?>
