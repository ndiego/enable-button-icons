import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import * as IconsAll from '@wordpress/icons';
import getIcons from './icons/index.js';

console.log( getIcons );

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const outputPath = path.resolve(__dirname, 'icons.css');

let cssContent = ':root {\n';

const { Icon, __esModule, ...Icons } = IconsAll;

const iconNames = Object.keys(Icons);

// Function to convert SVG to a data URI
const svgToDataUri = (svg) => {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
};

// Iterate over each icon and create a CSS variable
iconNames.forEach((iconName) => {
  const icon = Icons[iconName];
  //console.log( 'here is an ICON: ', icon );
  if (icon && icon.type && icon.type.render) {
      // Render the icon to static markup to get SVG string
      const svgString = React.createElement( icon ); //ReactDOMServer.renderToStaticMarkup( React.createElement( icon ) );
      const dataUri = svgToDataUri(svgString);
      cssContent += `  --icon-${iconName}: url("${dataUri}");\n`;
  }
});

cssContent += '}';

fs.writeFileSync(outputPath, cssContent);

console.log(`Icons CSS file generated at ${outputPath}`);