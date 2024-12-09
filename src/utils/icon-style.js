import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { flattenIconsArray } from './icon-functions';
import getIcons from '../icons';

/**
 * Utility to generate the proper CSS selector for layout styles.
 *
 * @param {string} selectors CSS selector, also supports multiple comma-separated selectors.
 * @param {string} append    The string to append.
 *
 * @return {string} - CSS selector.
 */
export function appendSelectors( selectors, append = '' ) {
	return selectors
		.split( ',' )
		.map(
			( subselector ) =>
				`${ subselector }${ append ? ` ${ append }` : '' }`
		)
		.join( ',' );
}

function svgToDataUri( svg ) {
	const encodedSvg = encodeURIComponent( svg )
		.replace( /'/g, '%27' )
		.replace( /"/g, '%22' )
		.replace( /</g, '%3C' )
		.replace( />/g, '%3E' )
		.replace( /#/g, '%23' )
		.replace( /\s+/g, ' ' ); // Minify by removing line breaks and excessive spaces

	return `data:image/svg+xml,${ encodedSvg }`;
}

export function getIconStyle( {
	selector,
	icon,
	iconName,
	customIconColor
} ) {
	let output = '';
	const rules = [];
	let svg = icon;
	if ( iconName ) {
		const iconsAll = flattenIconsArray( getIcons() );
		const namedIcon = iconsAll.filter( ( i ) => i.name === iconName );
		if ( React.isValidElement( namedIcon[ 0 ].icon ) ) {
			svg = ReactDOMServer.renderToString( namedIcon[ 0 ].icon );
		} else {
			svg = namedIcon[ 0 ].icon;
		}
	}
	if ( ! svg ) {
		return output;
	}
	const dataUri = svgToDataUri( svg );
	rules.push( `mask-image: url( ${ dataUri } );` );
	rules.push( `-webkit-mask-image: url( ${ dataUri } );` );
	if ( customIconColor ){
		rules.push( `color: ${ customIconColor };` );
	}
	if ( rules.length ) {
		output = `${ appendSelectors( selector ) } {
            ${ rules.join( '; ' ) };
        }`;
	}
	return output;
}
