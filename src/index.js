/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addFilter, applyFilters } from '@wordpress/hooks';
import {
	BlockControls,
	InspectorControls,
	MediaUpload,
	useBlockEditingMode,
	useStyleOverride,
} from '@wordpress/block-editor';
import {
	Dropdown,
	MenuGroup,
	MenuItem,
	NavigableMenu,
	PanelBody,
	PanelRow,
	ToggleControl,
	ToolbarButton,
	__experimentalGrid as Grid, // eslint-disable-line
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { code, media as mediaIcon } from '@wordpress/icons';
import { useInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { CustomInserterModal, InserterModal } from './components';
import { parseUploadedMediaAndSetIcon, getIconStyle } from './utils';
import { bolt as defaultIcon } from './icons/bolt';

/**
 * Add the attributes needed for button icons.
 *
 * @since 0.1.0
 * @param {Object} settings
 */
function addAttributes( settings ) {
	if ( 'core/button' !== settings.name ) {
		return settings;
	}

	// Add the icon attributes.
	const iconAttributes = {
		icon: {
			//string of icon svg (custom, media library)
			type: 'string',
		},
		iconPositionLeft: {
			type: 'boolean',
			default: false,
		},
		iconName: {
			//name prop of icon (WordPress icon library, etc)
			type: 'string',
		},
	};

	const newSettings = {
		...settings,
		attributes: {
			...settings.attributes,
			...iconAttributes,
		},
	};

	return newSettings;
}

addFilter(
	'blocks.registerBlockType',
	'enable-button-icons/add-attributes',
	addAttributes
);

// Allowed types for the current WP_User
function GetAllowedMimeTypes() {
	const { allowedMimeTypes, mediaUpload } = useSelect( ( select ) => {
		const { getSettings } = select( 'core/block-editor' );

		// In WordPress 6.1 and lower, allowedMimeTypes returns
		// null in the post editor, so need to use getEditorSettings.
		// TODO: Remove once minimum version is bumped to 6.2
		const { getEditorSettings } = select( 'core/editor' );

		return {
			allowedMimeTypes: getSettings().allowedMimeTypes
				? getSettings().allowedMimeTypes
				: getEditorSettings().allowedMimeTypes,
			mediaUpload: getSettings().mediaUpload,
		};
	}, [] );
	return { allowedMimeTypes, mediaUpload };
}

/**
 * Filter the BlockEdit object and add icon inspector controls to button blocks.
 *
 * @since 0.1.0
 * @param {Object} BlockEdit
 */
function addBlockControls( BlockEdit ) {
	return ( props ) => {
		if ( props.name !== 'core/button' ) {
			return <BlockEdit { ...props } />;
		}

		const { attributes, setAttributes } = props;
		const { icon, iconName, iconPositionLeft } = attributes;
		const { allowedMimeTypes } = GetAllowedMimeTypes();
		const isSVGUploadAllowed = allowedMimeTypes
			? Object.values( allowedMimeTypes ).includes( 'image/svg+xml' )
			: false;

		const [ isInserterOpen, setInserterOpen ] = useState( false );
		const [ isCustomInserterOpen, setCustomInserterOpen ] =
			useState( false );

		// Allow the iconBlock to disable custom SVG icons.
		const enableCustomIcons = applyFilters(
			'iconBlock.enableCustomIcons',
			true
		);

		const isContentOnlyMode = useBlockEditingMode() === 'contentOnly';

		const openOnArrowDown = ( event ) => {
			if ( event.keyCode === DOWN ) {
				event.preventDefault();
				event.target.click();
			}
		};

		const replaceText =
			icon || iconName
				? __( 'Replace icon', 'icon-block' )
				: __( 'Add icon', 'icon-block' );
		const customIconText =
			icon || iconName
				? __( 'Add/edit custom icon', 'icon-block' )
				: __( 'Add custom icon', 'icon-block' );

		const replaceDropdown = (
			<Dropdown
				renderToggle={ ( { isOpen, onToggle } ) => (
					<ToolbarButton
						aria-expanded={ isOpen }
						aria-haspopup="true"
						onClick={ onToggle }
						onKeyDown={ openOnArrowDown }
					>
						{ replaceText }
					</ToolbarButton>
				) }
				style={ { zIndex: 1 } }
				className="enable-button-icon-dropdown"
				contentClassName="enable-button-icon-dropdown-content"
				renderContent={ ( { onClose } ) => (
					<NavigableMenu className="enable-button-icon-navigableMenu">
						<MenuGroup>
							<MenuItem
								onClick={ () => {
									setInserterOpen( true );
									onClose( true );
								} }
								icon={ defaultIcon }
							>
								{ __( 'Browse Icon Library', 'icon-block' ) }
							</MenuItem>
							{ isSVGUploadAllowed && (
								<MediaUpload
									onSelect={ ( media ) => {
										parseUploadedMediaAndSetIcon(
											media,
											attributes,
											setAttributes
										);
										onClose( true );
									} }
									allowedTypes={ [ 'image/svg+xml' ] }
									render={ ( { open } ) => (
										<MenuItem
											onClick={ open }
											icon={ mediaIcon }
										>
											{ __(
												'Open Media Library',
												'icon-block'
											) }
										</MenuItem>
									) }
									className={
										'enable-button-icon-media-upload'
									}
								/>
							) }
							{ enableCustomIcons && (
								<MenuItem
									onClick={ () => {
										setCustomInserterOpen( true );
										onClose( true );
									} }
									icon={ code }
								>
									{ customIconText }
								</MenuItem>
							) }
						</MenuGroup>
						{ ( icon || iconName ) && (
							<MenuGroup>
								<MenuItem
									onClick={ () => {
										setAttributes( {
											icon: undefined,
											iconName: undefined,
										} );
										onClose( true );
									} }
								>
									{ __( 'Reset', 'icon-block' ) }
								</MenuItem>
							</MenuGroup>
						) }
					</NavigableMenu>
				) }
			/>
		);

		return (
			<>
				<BlockEdit { ...props } />
				<BlockControls group={ isContentOnlyMode ? 'inline' : 'other' }>
					<>
						{ enableCustomIcons || isSVGUploadAllowed ? (
							replaceDropdown
						) : (
							<ToolbarButton
								onClick={ () => {
									setInserterOpen( true );
								} }
							>
								{ replaceText }
							</ToolbarButton>
						) }
					</>
				</BlockControls>
				{ ( icon || iconName ) && (
					<InspectorControls>
						<PanelBody
							title={ __(
								'Icon settings',
								'enable-button-icons'
							) }
							className="button-icon-picker"
							initialOpen={ true }
						>
							<PanelRow>
								<ToggleControl
									label={ __(
										'Show icon on left',
										'enable-button-icons'
									) }
									checked={ iconPositionLeft }
									onChange={ () => {
										setAttributes( {
											iconPositionLeft:
												! iconPositionLeft,
										} );
									} }
								/>
							</PanelRow>
						</PanelBody>
					</InspectorControls>
				) }
				<InserterModal
					isInserterOpen={ isInserterOpen }
					setInserterOpen={ setInserterOpen }
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
				{ enableCustomIcons && (
					<CustomInserterModal
						isCustomInserterOpen={ isCustomInserterOpen }
						setCustomInserterOpen={ setCustomInserterOpen }
						attributes={ attributes }
						setAttributes={ setAttributes }
					/>
				) }
			</>
		);
	};
}

addFilter(
	'editor.BlockEdit',
	'enable-button-icons/add-block-controls',
	addBlockControls
);

/**
 * Add icon and position classes in the Editor.
 *
 * @since 0.1.0
 * @param {Object} BlockListBlock
 */
function addClasses( BlockListBlock ) {
	return ( props ) => {
		const { name, attributes } = props;

		if (
			'core/button' !== name ||
			! ( attributes?.icon || attributes?.iconName )
		) {
			return <BlockListBlock { ...props } />;
		}

		const id = useInstanceId( BlockListBlock );
		const selectorPrefix = `wp-block-button-has-icon-`;
		const selectorClassname = `${ selectorPrefix }${ id }`;
		const selector = `.${ selectorClassname } .wp-block-button__link::before, .${ selectorClassname } .wp-block-button__link::after`;

		// Get CSS string for the current icon.
		// The CSS and `style` element is only output if it is not empty.
		const css = getIconStyle( {
			blockName: name,
			selector,
			icon: attributes?.icon,
			iconName: attributes?.iconName,
			iconPositionLeft: attributes?.iconPositionLeft,
			style: attributes?.style,
			hasBlockGapSupport: false,
		} );

		const classes = classnames( props?.className, {
			[ `has-icon__${ attributes?.iconName }` ]: attributes?.iconName,
			'has-icon__custom': attributes?.icon,
			'has-icon-position__left': attributes?.iconPositionLeft,
			[ `${ selectorClassname }` ]: true,
		} );

		useStyleOverride( { css } );

		return <BlockListBlock { ...props } className={ classes } />;
	};
}

addFilter(
	'editor.BlockListBlock',
	'enable-button-icons/add-classes',
	addClasses
);
