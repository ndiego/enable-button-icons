/**
 * External dependencies
 */
const RemoveEmptyScriptsPlugin = require( 'webpack-remove-empty-scripts' );
const path = require( 'path' );
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

module.exports = {
	...defaultConfig,

	entry: {
		index: path.resolve( process.cwd(), 'src/index.js' ),
		editor: path.resolve( process.cwd(), 'src/editor.scss' ),
		style: path.resolve( process.cwd(), 'src/index.scss' ),
	},

	plugins: [ ...defaultConfig.plugins, new RemoveEmptyScriptsPlugin() ],
};
