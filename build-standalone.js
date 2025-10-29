import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');
const outputPath = path.join(__dirname, 'c4-modelling-tool.html');

// Read the built index.html
let html = fs.readFileSync(indexPath, 'utf-8');

// Read all CSS files from assets
const assetsPath = path.join(distPath, 'assets');
const files = fs.readdirSync(assetsPath);

files.forEach(file => {
  const filePath = path.join(assetsPath, file);
  const content = fs.readFileSync(filePath, 'utf-8');

  if (file.endsWith('.css')) {
    // Inline CSS
    html = html.replace(
      new RegExp(`<link[^>]*href="[^"]*${file}"[^>]*>`, 'g'),
      `<style>${content}</style>`
    );
  } else if (file.endsWith('.js')) {
    // Inline JS
    html = html.replace(
      new RegExp(`<script[^>]*src="[^"]*${file}"[^>]*></script>`, 'g'),
      `<script type="module">${content}</script>`
    );
  }
});

// Write the standalone HTML file
fs.writeFileSync(outputPath, html);

console.log(`✅ Standalone HTML file created: ${outputPath}`);
console.log(`📦 File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
console.log(`🚀 Open this file directly in your browser!`);
