<?php defined( 'ABSPATH' ) || exit; ?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link" href="#main-content"><?php esc_html_e( 'Skip to content', 'oxen' ); ?></a>
<header id="navigation" class="section site-header">
 <div class="site-header__branding">
 <?php if ( has_custom_logo() ) : the_custom_logo(); else : ?>
 <a class="site-header__brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>">
 <img alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>" src="<?php echo oxen_asset( 'image3.png' ); ?>" width="88" height="18">
 </a>
 <?php endif; ?>
 </div>
 <nav class="site-header__navigation" aria-label="<?php esc_attr_e( 'Main navigation', 'oxen' ); ?>">
 <?php wp_nav_menu( array( 'theme_location' => 'primary', 'container' => false, 'menu_id' => 'primary-menu', 'menu_class' => 'site-header__menu', 'fallback_cb' => false, 'walker' => new Oxen_Menu_Walker( 'desktop' ) ) ); ?>
 </nav>
 <button class="site-header__toggle" aria-expanded="false" aria-controls="mobile-navigation" type="button"><?php esc_html_e( 'Menu', 'oxen' ); ?> <span aria-hidden="true">☰</span></button>
 <nav id="mobile-navigation" class="site-header__mobile" aria-label="<?php esc_attr_e( 'Mobile navigation', 'oxen' ); ?>" hidden>
 <?php wp_nav_menu( array( 'theme_location' => 'primary', 'container' => false, 'menu_id' => 'mobile-menu', 'menu_class' => 'site-header__menu', 'fallback_cb' => false, 'walker' => new Oxen_Menu_Walker( 'mobile' ) ) ); ?>
 </nav>
</header>
