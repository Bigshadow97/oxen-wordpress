<?php
/** Standard CMS page. */
defined( 'ABSPATH' ) || exit;
get_header();
?>
<main id="main-content" class="content-page">
	<?php while ( have_posts() ) : the_post(); ?>
		<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
			<h1><?php the_title(); ?></h1>
			<div class="entry-content"><?php the_content(); ?></div>
			<?php wp_link_pages(); ?>
		</article>
	<?php endwhile; ?>
</main>
<?php get_footer(); ?>
