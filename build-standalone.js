import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');
const outputPath = path.join(__dirname, 'bac4-standalone.html');

// Read the built index.html
let html = fs.readFileSync(indexPath, 'utf-8');

// Read all CSS and JS files from assets
const assetsPath = path.join(distPath, 'assets');
const files = fs.readdirSync(assetsPath);

console.log(`📂 Found ${files.length} asset files to inline...`);

// Process each asset file
files.forEach(file => {
  const filePath = path.join(assetsPath, file);
  const content = fs.readFileSync(filePath, 'utf-8');

  console.log(`   Processing: ${file}`);

  if (file.endsWith('.css')) {
    // Replace CSS link tag - match the full assets path
    const cssLinkPattern = `<link rel="stylesheet" crossorigin href="/assets/${file}">`;
    if (html.includes(cssLinkPattern)) {
      html = html.replace(cssLinkPattern, `<style>${content}</style>`);
      console.log(`   ✅ CSS inlined`);
    } else {
      console.log(`   ⚠️  CSS link tag not found`);
    }
  } else if (file.endsWith('.js')) {
    // Replace JS script tag - match the full assets path
    const jsScriptPattern = `<script type="module" crossorigin src="/assets/${file}"></script>`;
    if (html.includes(jsScriptPattern)) {
      html = html.replace(jsScriptPattern, `<script type="module">${content}</script>`);
      console.log(`   ✅ JS inlined`);
    } else {
      console.log(`   ⚠️  JS script tag not found`);
    }
  }
});

// Update the title
html = html.replace(/<title>.*?<\/title>/, '<title>BAC4 Standalone - Interactive C4 Modelling Tool</title>');

// Remove or inline the favicon
html = html.replace(/href="\/vite\.svg"/g, 'href="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%23646cff\' d=\'M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z\'/%3E%3C/svg%3E"');

// Write the standalone HTML file
fs.writeFileSync(outputPath, html);

console.log(`\n✅ Standalone HTML file created: ${outputPath}`);
console.log(`📦 File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);

// Verify the file was created correctly
const hasInlineCSS = html.includes('<style>');
const hasInlineJS = html.includes('<script type="module">') && html.match(/<script type="module">/g).length > 0;
const hasExternalRefs = html.includes('src="/assets/') || html.includes('href="/assets/');

console.log(`\n📝 Verification:`);
console.log(`   - CSS inlined: ${hasInlineCSS ? '✅' : '❌'}`);
console.log(`   - JS inlined: ${hasInlineJS ? '✅' : '❌'}`);
console.log(`   - No external refs: ${!hasExternalRefs ? '✅' : '❌'}`);

if (!hasInlineCSS || !hasInlineJS || hasExternalRefs) {
  console.error(`\n⚠️  Warning: Build has issues!`);
  if (hasExternalRefs) {
    console.error(`   - Still has external asset references`);
    // Show what's left
    const matches = html.match(/(src|href)="\/assets\/[^"]+"/g);
    if (matches) {
      console.error(`   - Remaining references: ${matches.join(', ')}`);
    }
  }
  process.exit(1);
}

console.log(`\n✨ Build successful! Open bac4-standalone.html in your browser.`);
