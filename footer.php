<?php defined( 'ABSPATH' ) || exit; ?>
<footer id="site-footer" class="home-section site-footer-section">
<div data-node-id="1:32" class="design-layer layer-32 art-layer" aria-hidden="true"></div>
<div data-node-id="1:33" class="design-layer layer-33 art-layer" aria-hidden="true"><div class="art-819"><div class="art-820"><div class="art-821"><img alt="" src="<?php echo oxen_asset( 'vector7.svg' ); ?>" decoding="async" class="art-822"></div></div></div></div>
<div data-node-id="1:34" class="design-layer layer-34 art-layer" aria-hidden="true"><div class="art-824"><div class="art-825"><div class="art-826"><img alt="" src="<?php echo oxen_asset( 'vector7.svg' ); ?>" decoding="async" class="art-827"></div></div></div></div>
<div class="responsive-group footer-services"><p data-node-id="1:35" class="design-layer layer-35 copy-layer">
          Sectores
        </p>
<nav class="footer-menu footer-menu-services" aria-label="<?php echo esc_attr( get_registered_nav_menus()['footer_services'] ); ?>">
<?php wp_nav_menu( array( 'theme_location' => 'footer_services', 'container' => false, 'fallback_cb' => false, 'walker' => new Oxen_Menu_Walker( 'footer_services' ) ) ); ?>
</nav></div>
<div class="responsive-group footer-address"><p data-node-id="1:36" class="design-layer layer-36 copy-layer">
          Sectores
        </p>
<div data-node-id="1:42" class="design-layer layer-42 copy-layer"><p class="art-836">156a Penrose Road, </p><p class="art-837">Mt Wellington, </p><p class="art-838">Auckland 1060</p></div></div>
<div class="responsive-group footer-contact"><p data-node-id="1:37" class="design-layer layer-37 copy-layer">
          Contact
        </p>
<a href="tel:0800640001" data-node-id="1:40" class="design-layer layer-40 copy-layer"><p class="art-841">0800 640 001</p></a>
<a data-node-id="1:43" href="mailto:hello@oxen.nz" class="design-layer layer-43 copy-layer text-link">
          hello@oxen.nz
        </a></div>
<div class="responsive-group footer-other"><p data-node-id="1:38" class="design-layer layer-38 copy-layer">
          Other
        </p>
<nav class="footer-menu footer-menu-other" aria-label="<?php echo esc_attr( get_registered_nav_menus()['footer_resources'] ); ?>">
<?php wp_nav_menu( array( 'theme_location' => 'footer_resources', 'container' => false, 'fallback_cb' => false, 'walker' => new Oxen_Menu_Walker( 'footer_resources' ) ) ); ?>
</nav></div>
<div data-node-id="1:41" class="design-layer layer-41 copy-layer"><p class="art-848">Oxen is a New Zealand-based accounting service that provides businesses with strategic financial leadership. </p><p class="art-849">We focus on the middle and lower-middle market and aim to deliver compelling risk-adjusted returns. For additional information, please visit www.oxen.nz.</p></div>
<div class="responsive-group footer-legal">
<p data-node-id="1:53" class="design-layer layer-53 copy-layer">
          Copyright © <?php echo esc_html( wp_date( 'Y' ) ); ?> Oxen
        </p>
<p data-node-id="1:54" class="design-layer layer-54 copy-layer">
          Designed and Developed by Permalinks
        </p><nav class="footer-menu footer-menu-legal" aria-label="<?php echo esc_attr( get_registered_nav_menus()['footer_legal'] ); ?>">
<?php wp_nav_menu( array( 'theme_location' => 'footer_legal', 'container' => false, 'fallback_cb' => false, 'walker' => new Oxen_Menu_Walker( 'footer_legal' ) ) ); ?>
</nav></div>
<div class="responsive-group footer-social">
<nav class="footer-menu footer-menu-social" aria-label="<?php echo esc_attr( get_registered_nav_menus()['footer_social'] ); ?>">
<?php wp_nav_menu( array( 'theme_location' => 'footer_social', 'container' => false, 'fallback_cb' => false, 'walker' => new Oxen_Menu_Walker( 'footer_social' ) ) ); ?>
</nav></div>
<div class="responsive-group footer-badge"><div data-node-id="1:74" class="design-layer layer-74 art-layer" aria-hidden="true"><div class="art-860"><div class="art-861"></div></div></div>
<div data-node-id="1:75" class="design-layer layer-75 art-layer" aria-hidden="true"><div class="art-863"><img alt="" src="<?php echo oxen_asset( 'image16.png' ); ?>" decoding="async" class="art-864"></div></div></div>
</footer>
<?php get_template_part( 'template-parts/site-dialogs' ); wp_footer(); ?>
</body>
</html>
