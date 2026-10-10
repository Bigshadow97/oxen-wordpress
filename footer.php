<?php defined( 'ABSPATH' ) || exit; ?>
<footer id="site-footer" class="section site-footer">
<div class="section__item site-footer__background section__visual" aria-hidden="true"></div>
<div class="section__item site-footer__policy-divider section__visual" aria-hidden="true"><div class="site-footer__policy-divider-frame"><div class="site-footer__policy-divider-frame-inner"><div class="site-footer__policy-divider-frame-outer"><img alt="" src="<?php echo oxen_asset( 'vector7.svg' ); ?>" decoding="async" class="site-footer__policy-divider-image"></div></div></div></div>
<div class="section__item site-footer__copyright-divider section__visual" aria-hidden="true"><div class="site-footer__copyright-divider-frame"><div class="site-footer__copyright-divider-frame-inner"><div class="site-footer__copyright-divider-frame-outer"><img alt="" src="<?php echo oxen_asset( 'vector7.svg' ); ?>" decoding="async" class="site-footer__copyright-divider-image"></div></div></div></div>
<div class="layout-group site-footer__services"><p class="section__item site-footer__services-title section__text">
          Sectores
        </p>
<nav class="site-footer__menu site-footer__menu--services" aria-label="<?php echo esc_attr( get_registered_nav_menus()['footer_services'] ); ?>">
<?php wp_nav_menu( array( 'theme_location' => 'footer_services', 'container' => false, 'fallback_cb' => false, 'walker' => new Oxen_Menu_Walker( 'footer_services' ) ) ); ?>
</nav></div>
<div class="layout-group site-footer__address-group"><p class="section__item site-footer__address-title section__text">
          Sectores
        </p>
<div class="section__item site-footer__address section__text"><p class="site-footer__address-text">156a Penrose Road, </p><p class="site-footer__address-text-inner">Mt Wellington, </p><p class="site-footer__address-text-outer">Auckland 1060</p></div></div>
<div class="layout-group site-footer__contact"><p class="section__item site-footer__contact-title section__text">
          Contact
        </p>
<a href="tel:0800640001" class="section__item site-footer__phone section__text"><p class="site-footer__phone-text">0800 640 001</p></a>
<a href="mailto:hello@oxen.nz" class="section__item site-footer__email section__text text-link">
          hello@oxen.nz
        </a></div>
<div class="layout-group site-footer__resources"><p class="section__item site-footer__resources-title section__text">
          Other
        </p>
<nav class="site-footer__menu site-footer__menu--resources" aria-label="<?php echo esc_attr( get_registered_nav_menus()['footer_resources'] ); ?>">
<?php wp_nav_menu( array( 'theme_location' => 'footer_resources', 'container' => false, 'fallback_cb' => false, 'walker' => new Oxen_Menu_Walker( 'footer_resources' ) ) ); ?>
</nav></div>
<div class="section__item site-footer__introduction section__text"><p class="site-footer__introduction-text">Oxen is a New Zealand-based accounting service that provides businesses with strategic financial leadership. </p><p class="site-footer__introduction-text-inner">We focus on the middle and lower-middle market and aim to deliver compelling risk-adjusted returns. For additional information, please visit www.oxen.nz.</p></div>
<div class="layout-group site-footer__legal">
<p class="section__item site-footer__copyright section__text">
          Copyright © <?php echo esc_html( wp_date( 'Y' ) ); ?> Oxen
        </p>
<p class="section__item site-footer__credit section__text">
          Designed and Developed by Permalinks
        </p><nav class="site-footer__menu site-footer__menu--legal" aria-label="<?php echo esc_attr( get_registered_nav_menus()['footer_legal'] ); ?>">
<?php wp_nav_menu( array( 'theme_location' => 'footer_legal', 'container' => false, 'fallback_cb' => false, 'walker' => new Oxen_Menu_Walker( 'footer_legal' ) ) ); ?>
</nav></div>
<div class="layout-group site-footer__social">
<nav class="site-footer__menu site-footer__menu--social" aria-label="<?php echo esc_attr( get_registered_nav_menus()['footer_social'] ); ?>">
<?php wp_nav_menu( array( 'theme_location' => 'footer_social', 'container' => false, 'fallback_cb' => false, 'walker' => new Oxen_Menu_Walker( 'footer_social' ) ) ); ?>
</nav></div>
<div class="layout-group site-footer__badge-group"><div class="section__item site-footer__badge-background section__visual" aria-hidden="true"><div class="site-footer__badge-background-frame"><div class="site-footer__badge-background-frame-inner"></div></div></div>
<div class="section__item site-footer__badge section__visual" aria-hidden="true"><div class="site-footer__badge-frame"><img alt="" src="<?php echo oxen_asset( 'image16.png' ); ?>" decoding="async" class="site-footer__badge-image"></div></div></div>
</footer>
<?php get_template_part( 'template-parts/site-dialogs' ); wp_footer(); ?>
</body>
</html>
