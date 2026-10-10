<?php
/** Core menu markup with accessible submenu controls and the existing CTA. */
defined( 'ABSPATH' ) || exit;

class Oxen_Menu_Walker extends Walker_Nav_Menu {
	private $prefix;
	private $parent_ids = array();
	public function __construct( $prefix ) { $this->prefix = sanitize_html_class( $prefix ); }
	public function start_lvl( &$output, $depth = 0, $args = null ) {
		$output .= '<ul id="' . esc_attr( $this->prefix . '-submenu-' . $this->parent_ids[ $depth ] ) . '" class="sub-menu" hidden>';
	}
	public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
		$this->parent_ids[ $depth ] = $item->ID;
		$has_children = in_array( 'menu-item-has-children', (array) $item->classes, true );
		$start = strlen( $output );
		parent::start_el( $output, $item, $depth, $args, $id );
		$markup = substr( $output, $start );
		// Retain core menu filters, URLs, titles and current-item classes.
		$markup = preg_replace( '/id="menu-item-\d+"/', 'id="' . esc_attr( $this->prefix . '-item-' . $item->ID ) . '"', $markup, 1 );
		if ( in_array( 'menu-contact', (array) $item->classes, true ) ) {
			$markup = preg_replace( '/<a /', '<a data-open-contact aria-haspopup="dialog" ', $markup, 1 );
			$markup = str_replace( '</a>', '<img src="' . oxen_asset( 'add-line5.svg' ) . '" width="16" height="16" alt=""></a>', $markup );
		} elseif ( in_array( 'menu-plus', (array) $item->classes, true ) && ! $has_children ) {
			$markup = str_replace( '</a>', '<img class="menu-plus-icon" src="' . oxen_asset( 'add-line6.svg' ) . '" width="14" height="14" alt=""></a>', $markup );
		}
		foreach ( array( 'menu-cookie' => 'policy', 'menu-social-alternatives' => 'social' ) as $class => $dialog ) {
			if ( in_array( $class, (array) $item->classes, true ) ) {
				$markup = preg_replace( '/<a /', '<a data-open-' . $dialog . ' aria-haspopup="dialog" ', $markup, 1 );
			}
		}
		if ( $has_children ) {
			$markup .= '<button class="submenu-toggle" type="button" aria-expanded="false" aria-controls="' . esc_attr( $this->prefix . '-submenu-' . $item->ID ) . '" aria-label="' . esc_attr( sprintf( __( 'Toggle submenu for %s', 'oxen' ), wp_strip_all_tags( $item->title ) ) ) . '"><span aria-hidden="true">+</span></button>';
		}
		$output = substr( $output, 0, $start ) . $markup;
	}
}
