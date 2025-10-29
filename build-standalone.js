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

// Process each file
files.forEach(file => {
  const filePath = path.join(assetsPath, file);
  const content = fs.readFileSync(filePath, 'utf-8');

  if (file.endsWith('.css')) {
    // Replace CSS link tags with inline styles
    html = html.replace(
      new RegExp(`<link[^>]*href="[^"]*${file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`, 'g'),
      `<style>${content}</style>`
    );
  } else if (file.endsWith('.js')) {
    // Replace JS script tags with inline scripts
    html = html.replace(
      new RegExp(`<script[^>]*src="[^"]*${file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*></script>`, 'g'),
      `<script type="module">${content}</script>`
    );
  }
});

// Update the title
html = html.replace(/<title>.*?<\/title>/, '<title>BAC4 Standalone - Interactive C4 Modelling Tool</title>');

// Remove any remaining asset references that might cause issues
html = html.replace(/href="\/vite\.svg"/g, 'href="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%23646cff\' d=\'M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z\'/%3E%3C/svg%3E"');

// Write the standalone HTML file
fs.writeFileSync(outputPath, html);

console.log(`✅ Standalone HTML file created: ${outputPath}`);
console.log(`📦 File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
console.log(`🚀 Open this file directly in your browser!`);

// Verify the file was created correctly
const lines = html.split('\n').length;
const hasInlineCSS = html.includes('<style>');
const hasInlineJS = html.includes('<script type="module">');

console.log(`📝 Verification:`);
console.log(`   - Lines: ${lines}`);
console.log(`   - CSS inlined: ${hasInlineCSS ? '✅' : '❌'}`);
console.log(`   - JS inlined: ${hasInlineJS ? '✅' : '❌'}`);

if (!hasInlineCSS || !hasInlineJS) {
  console.error('⚠️  Warning: Some assets may not have been inlined correctly!');
  process.exit(1);
}
