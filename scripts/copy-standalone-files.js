#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📦 Copying files for standalone build...');

// Copy .next/static to .next/standalone/.next/static
const staticSrc = path.join('.next', 'static');
const staticDest = path.join('.next', 'standalone', '.next', 'static');

if (fs.existsSync(staticSrc)) {
  fs.cpSync(staticSrc, staticDest, { recursive: true });
  console.log('✅ Copied .next/static');
} else {
  console.warn('⚠️  .next/static not found');
}

// Copy public to .next/standalone/public
const publicSrc = 'public';
const publicDest = path.join('.next', 'standalone', 'public');

if (fs.existsSync(publicSrc)) {
  fs.cpSync(publicSrc, publicDest, { recursive: true });
  console.log('✅ Copied public folder');
} else {
  console.log('ℹ️  No public folder found (optional)');
}

console.log('✅ Standalone build files ready!');
