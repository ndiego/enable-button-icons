<?php
/**
 * Plugin Name:         Enable Button Icons
 * Plugin URI:          https://www.nickdiego.com/
 * Description:         Easily add icons to Button blocks.
 * Version:             0.1.0
 * Requires at least:   6.3
 * Requires PHP:        7.4
 * Author:              Nick Diego
 * Author URI:          https://www.nickdiego.com
 * License:             GPLv2
 * License URI:         https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * Text Domain:         enable-button-icons
 * Domain Path:         /languages
 *
 * @package enable-button-icons
 */

defined( 'ABSPATH' ) || exit;

/**
 * Enqueue Editor scripts.
 */
function enable_button_icons_enqueue_block_editor_assets() {
	$asset_file  = include plugin_dir_path( __FILE__ ) . 'build/index.asset.php';

	wp_enqueue_script(
		'enable-button-icons-editor-scripts',
		plugin_dir_url( __FILE__ ) . 'build/index.js',
		$asset_file['dependencies'],
		$asset_file['version']
	);

	wp_set_script_translations(
		'enable-button-icons-editor-scripts',
		'enable-button-icons',
		plugin_dir_path( __FILE__ ) . 'languages'
	);

}
add_action( 'enqueue_block_editor_assets', 'enable_button_icons_enqueue_block_editor_assets' );

/**
 * Enqueue Editor styles.
 */
function enable_button_icons_enqueue_block_assets() {
	if( is_admin() ){
		$asset_file  = include plugin_dir_path( __FILE__ ) . 'build/index.asset.php';

		wp_enqueue_style(
			'enable-button-icons-editor-styles',
			plugin_dir_url( __FILE__ ) . 'build/editor.css'
		);
	}
}
add_action( 'enqueue_block_assets', 'enable_button_icons_enqueue_block_assets' );

/**
 * Enqueue block styles 
 * (Applies to both frontend and Editor)
 */
function enable_button_icons_block_styles() {
	wp_enqueue_block_style(
		'core/button',
		array(
			'handle' => 'enable-button-icons-block-styles',
			'src'    => plugin_dir_url( __FILE__ ) . 'build/style.css',
			'ver'    => wp_get_theme()->get( 'Version' ),
			'path'   => plugin_dir_path( __FILE__ ) . 'build/style.css',
		)
	);
}
add_action( 'init', 'enable_button_icons_block_styles' );

/**
 * Render icons on the frontend.
 */
function enable_button_icons_render_block_button( $block_content, $block ) {
	if ( ! isset( $block['attrs']['icon'] ) ) {
		return $block_content;
	}
	
	$icon         = $block['attrs']['icon'];
	$icon_name	  = $block['attrs']['iconName'] ? $block['attrs']['iconName'] : 'custom';
	$positionLeft = isset( $block['attrs']['iconPositionLeft'] ) ? $block['attrs']['iconPositionLeft'] : false;
	
	// Append the icon class to the block.
	$p = new WP_HTML_Tag_Processor( $block_content );
	if ( $p->next_tag() ) {
		$p->add_class( 'has-icon__' . $icon_name );
	}
	$block_content = $p->get_updated_html();

	// Add the SVG icon either to the left of right of the button text.
	$block_content = $positionLeft 
		? preg_replace( '/(<a[^>]*>)(.*?)(<\/a>)/i', '$1<span class="wp-block-button__link-icon" aria-hidden="true">' . $icon . '</span>$2$3', $block_content )
		: preg_replace( '/(<a[^>]*>)(.*?)(<\/a>)/i', '$1$2<span class="wp-block-button__link-icon" aria-hidden="true">' . $icon . '</span>$3', $block_content );

	return $block_content;
}
add_filter( 'render_block_core/button', 'enable_button_icons_render_block_button', 10, 2 );
