# Standalone HTML File Guide

## Quick Start

**The `bac4-standalone.html` file is a complete, self-contained application that runs entirely in your browser!**

### What You Get

- ✅ **Single file**: 451KB HTML file with everything built-in
- ✅ **No installation**: Just open in a browser
- ✅ **No internet required**: Works completely offline
- ✅ **No dependencies**: No Node.js, no npm, no server needed
- ✅ **Cross-platform**: Works on Windows, Mac, Linux, ChromeOS
- ✅ **Portable**: Share via email, USB, cloud storage, or intranet

### How to Use

#### Method 1: Double-Click
1. Locate `bac4-standalone.html` in your file system
2. Double-click the file
3. It opens in your default browser
4. Start creating diagrams!

#### Method 2: Open in Browser
1. Open your browser (Chrome, Firefox, Safari, Edge)
2. Press `Ctrl+O` (Windows/Linux) or `Cmd+O` (Mac)
3. Select `bac4-standalone.html`
4. Click "Open"

#### Method 3: Drag and Drop
1. Open your browser
2. Drag `bac4-standalone.html` into the browser window
3. Drop to open

### Features That Work Offline

All features work without internet:
- ✅ Create and edit C4 diagrams
- ✅ Add all element types (System, Container, Component, Person, External)
- ✅ Create relationships between elements
- ✅ Edit properties (name, description, technology, tags)
- ✅ Auto-layout (4 algorithms)
- ✅ Export to all formats (JSON, PlantUML, Markdown, HTML, PNG, SVG)
- ✅ Import JSON models
- ✅ Load templates (Flight Ops, E-Commerce, Layered Architecture)
- ✅ Local storage auto-save
- ✅ Interactive canvas with zoom and pan

### Distribution Options

#### 1. Email
Attach `bac4-standalone.html` to an email and send to colleagues. They can open it immediately with no setup.

#### 2. Shared Drive
Place the file on:
- Network drive
- OneDrive / Google Drive / Dropbox
- SharePoint
- Internal file server

Everyone with access can use it without installation.

#### 3. USB Drive
Copy the file to a USB drive for:
- Offline presentations
- Field work
- Air-gapped environments
- Quick demos

#### 4. Intranet
Host on your company intranet:
```bash
# Just copy the file to your web server
cp bac4-standalone.html /var/www/html/
# Access at: http://intranet.company.com/bac4-standalone.html
```

#### 5. Company Wiki
Upload to:
- Confluence: As an attachment
- SharePoint: As a file
- Internal wiki: As a static page

### Data Storage

The app uses browser local storage to auto-save your work:
- Saves every 30 seconds automatically
- Saves when you close the browser
- Data persists between sessions
- **Important**: Data is stored per-browser, per-device

To backup your work:
1. Click "Export" → "JSON"
2. Save the JSON file
3. Import it later or on another device

### Browser Compatibility

Works on all modern browsers:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

### Security Considerations

#### Safe for Corporate Use
- ✅ No external API calls
- ✅ No data sent to servers
- ✅ No tracking or analytics
- ✅ No third-party scripts loaded
- ✅ All code is bundled and self-contained
- ✅ Works in air-gapped environments

#### Data Privacy
- All data stays in your browser
- Nothing is uploaded or transmitted
- Local storage only (can be cleared)
- Export files stay on your device

### Troubleshooting

#### File Won't Open
- **Solution**: Right-click → "Open with" → Select your browser

#### Features Not Working
- **Solution**: Make sure JavaScript is enabled in your browser
- **Check**: Browser settings → Privacy & Security → Allow JavaScript

#### Local Storage Full
- **Solution**: Export your models as JSON files
- **Then**: Clear browser data and import models back

#### Can't Export Images
- **Solution**: Check browser permissions for file downloads
- **Disable**: Any pop-up blockers temporarily

### Limitations

The standalone version has a few minor limitations compared to the hosted version:
- Some export features may prompt for file downloads (browser security)
- Local storage is limited to ~5-10MB (stores many diagrams)
- Font loading may differ slightly across systems

All core functionality works perfectly!

### Building Your Own

To rebuild the standalone file:

```bash
# Clone the repository
git clone <repo-url>
cd bac4-standalone

# Install dependencies (one-time only)
npm install

# Build standalone file
npm run build:standalone

# Find the file
# bac4-standalone.html is now in the root directory
```

### Customization

The standalone file is just HTML, CSS, and JavaScript. You can:
- Rename it to anything.html
- Edit the `<title>` tag in a text editor
- Change the default metadata in the source before building
- Customize colors by editing the CSS (advanced)

### Version Control

Treat the standalone HTML file like any other artifact:
- ✅ Commit to Git if you want version history
- ✅ Add to your docs repository
- ✅ Tag releases (v1.0, v1.1, etc.)
- ✅ Include in software releases

### Use Cases

Perfect for:
- **Architecture Reviews**: Email file to reviewers
- **Customer Demos**: No installation needed
- **Training**: Everyone can run it instantly
- **Documentation**: Include in doc packages
- **Offline Work**: Planes, trains, remote sites
- **Quick Prototyping**: Spin up in seconds
- **Compliance**: Air-gapped environments
- **Internal Tools**: No server maintenance

### Pro Tips

1. **Bookmark it**: Add to browser favorites for quick access
2. **Name it**: Rename to `company-c4-tool.html` for context
3. **Version it**: Keep multiple versions (v1.0.html, v2.0.html)
4. **Share templates**: Export JSON templates to share with team
5. **Regular backups**: Export models to JSON weekly
6. **Print diagrams**: Use browser print to PDF
7. **Screenshots**: Browser dev tools for pixel-perfect exports

### Support

If you encounter issues:
1. Check browser console for errors (F12 → Console tab)
2. Try a different browser
3. Clear browser cache and retry
4. Make sure file isn't corrupted (re-download/rebuild)

### License

MIT License - free to use, modify, and distribute!

---

**Happy Diagramming! 🎨**

This standalone version means you can diagram anywhere, anytime, on any device with a browser. No barriers, no dependencies, just pure productivity.
