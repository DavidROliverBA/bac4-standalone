# C4 Modelling Tool

An interactive web-based C4 modelling tool built with React that allows architects to create, edit, and visualize C4 diagrams with full interactivity.

## Features

### Core Functionality

- **Interactive Canvas**: Drag-and-drop interface for adding and positioning elements
- **Pan and Zoom**: Navigate large diagrams easily with mouse controls
- **Visual Distinction**: Different colors and icons for each element type (Systems, Containers, Components, People, External Systems)
- **Connection Lines**: Auto-routing relationship lines between elements
- **Click-to-Edit**: Click any element to edit its properties inline

### C4 Level Support

- Toggle between Context, Container, Component, and Code views
- Level selector in the header for easy navigation
- Maintains element positions across different views

### Element Management

- **Add Elements**: Via toolbar buttons for:
  - Software System
  - Container
  - Component
  - Person
  - External System
- **Edit Properties**: Name, description, technology, tags
- **Create Relationships**: Click and drag between elements to create connections
- **Delete Elements**: With confirmation dialog

### Model Persistence

- **Export Formats**:
  - JSON (model data)
  - PlantUML C4 syntax
  - Markdown documentation
  - HTML standalone document
  - PNG image
  - SVG image
- **Import**: Load JSON models
- **Local Storage Auto-save**: Automatically saves your work every 30 seconds

### Auto-Layout

Four layout algorithms to arrange your diagrams:
- **Hierarchical**: Arranges elements in layers by type
- **Grid**: Organizes elements in a grid pattern
- **Circular**: Arranges elements in a circle
- **Force-Directed**: Uses physics simulation to minimize overlap

### Templates

Pre-built templates for common patterns:
- **Flight Operations System**: Aviation domain example
- **E-Commerce Microservices**: Microservices architecture example
- **Layered Architecture**: Traditional layered web application

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Build standalone single-file version
npm run build:standalone
```

### Deployment Options

#### Option 1: Standalone Single HTML File (Recommended for Simple Use)

**Yes! This app can run completely standalone in any browser!**

After building, you'll find `bac4-standalone.html` (451KB) in the root directory. This file:
- ✅ Contains everything needed (no dependencies, no server required)
- ✅ Can be opened directly in any modern browser (Chrome, Firefox, Safari, Edge)
- ✅ Can be shared via email, USB drive, or cloud storage
- ✅ Works offline completely
- ✅ All features work including export, import, and auto-save

**To use:**
```bash
npm run build:standalone
# Double-click bac4-standalone.html or open it in your browser
```

#### Option 2: Static Hosting (For Production Deployment)

Deploy the `dist/` folder to any static hosting service:
- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect your Git repo and deploy
- **GitHub Pages**: Push `dist` to gh-pages branch
- **AWS S3**: Upload `dist` contents to an S3 bucket
- **Cloudflare Pages**: Connect repo or upload folder

```bash
npm run build
# Upload dist/ folder to your hosting service
```

#### Option 3: Docker Container

Create a `Dockerfile`:
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
docker build -t c4-modelling-tool .
docker run -p 8080:80 c4-modelling-tool
```

### Usage

1. **Start the application**: Navigate to `http://localhost:5173` after running `npm run dev`

2. **Add Elements**:
   - Click buttons in the left toolbar to add elements
   - Elements appear on the canvas with random positions

3. **Create Relationships**:
   - Click and drag from one element to another
   - The relationship appears as an arrow between them

4. **Edit Properties**:
   - Click any element to select it
   - Edit properties in the right panel
   - Changes save automatically on blur

5. **Arrange Elements**:
   - Drag elements to position them manually
   - Use the "Layout" button for automatic arrangements

6. **Export Your Work**:
   - Click "Export" in the header
   - Choose your desired format
   - File downloads automatically

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Mouse Wheel | Zoom in/out |
| Click + Drag Canvas | Pan view |
| Click Element | Select element |
| Click Canvas | Deselect all |
| Drag Element | Move element |
| Drag from Handle | Create relationship |

## Project Structure

```
bac4-standalone/
├── src/
│   ├── components/
│   │   ├── C4Node.jsx          # Custom node component
│   │   ├── Header.jsx           # Top navigation bar
│   │   ├── Toolbar.jsx          # Left sidebar with tools
│   │   └── PropertiesPanel.jsx  # Right sidebar for editing
│   ├── data/
│   │   └── templates.js         # Pre-built model templates
│   ├── hooks/
│   │   └── useLocalStorage.js   # Local storage auto-save hook
│   ├── utils/
│   │   ├── exportUtils.js       # Export functionality
│   │   └── layoutUtils.js       # Auto-layout algorithms
│   ├── store.js                 # Zustand state management
│   ├── App.jsx                  # Main application component
│   └── main.jsx                 # Application entry point
├── public/
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Technology Stack

- **React 19**: UI framework
- **React Flow**: Diagram rendering and interaction
- **Zustand**: State management
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **html-to-image**: Image export
- **file-saver**: File download
- **Vite**: Build tool

## Data Model

### Model Structure

```json
{
  "metadata": {
    "name": "Project Name",
    "version": "1.0",
    "author": "Author Name"
  },
  "systems": [...],
  "containers": [...],
  "components": [...],
  "people": [...],
  "externalSystems": [...],
  "relationships": [...]
}
```

### Element Structure

```json
{
  "id": "unique-id",
  "type": "system|container|component|person|externalSystem",
  "name": "Element Name",
  "description": "Description text",
  "technology": "Technology stack",
  "tags": ["tag1", "tag2"],
  "position": { "x": 100, "y": 200 }
}
```

### Relationship Structure

```json
{
  "id": "rel-id",
  "from": "source-element-id",
  "to": "target-element-id",
  "description": "Relationship description",
  "technology": "Protocol/Technology",
  "animated": false
}
```

## Export Formats

### JSON
Raw model data that can be imported back into the tool.

### PlantUML
C4-PlantUML syntax compatible with PlantUML tools:
```
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

Person(user, "User", "End user")
System(system, "System", "Core system")
Rel(user, system, "Uses")
@enduml
```

### Markdown
Documentation format with tables and descriptions, suitable for wikis or README files.

### HTML
Standalone HTML document with embedded model, documentation, and PlantUML code.

### PNG/SVG
Image exports of the current canvas view.

## Features Comparison with C4-PlantUML

| Feature | C4 Modelling Tool | C4-PlantUML |
|---------|------------------|-------------|
| Interactive Editing | ✅ Yes | ❌ No |
| Visual Drag & Drop | ✅ Yes | ❌ No |
| Real-time Preview | ✅ Yes | ⚠️ Requires external tool |
| Export to PlantUML | ✅ Yes | N/A |
| Import from JSON | ✅ Yes | ❌ No |
| Auto-layout | ✅ 4 algorithms | ✅ Built-in |
| Templates | ✅ Yes | ⚠️ Manual |
| Local Storage | ✅ Auto-save | ❌ No |
| Learning Curve | 🟢 Low | 🟡 Medium |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Best Practices

### Diagram Organization

1. **Context Diagrams**: Keep to 5-9 systems maximum
2. **Container Diagrams**: Focus on one system at a time
3. **Component Diagrams**: Show major structural components only
4. **Code Diagrams**: Use sparingly, focus on complex areas

### Element Naming

- Use clear, descriptive names
- Include technology stack in brackets for containers/components
- Keep descriptions concise but informative
- Use consistent naming conventions

### Relationship Documentation

- Always add descriptions to relationships
- Specify protocols/technologies where relevant
- Use animated lines for asynchronous communication

### Version Control

- Export models as JSON regularly
- Commit JSON files to your repository
- Include generated documentation in commits
- Tag major versions

## Troubleshooting

### Canvas Not Responding
- Try refreshing the page
- Check browser console for errors
- Clear local storage if data seems corrupted

### Export Not Working
- Ensure pop-up blocker is disabled
- Check browser permissions for downloads
- Try a different export format

### Elements Overlapping
- Use auto-layout to reorganize
- Manually drag elements apart
- Increase zoom level for more space

### Performance Issues
- Keep diagrams under 50 elements
- Split large models into multiple diagrams
- Use level filtering to show relevant elements only

## License

MIT License - feel free to use this tool for any purpose.

## Acknowledgments

- Built with [React Flow](https://reactflow.dev/)
- Inspired by [C4 Model](https://c4model.com/) by Simon Brown
- Icons from [Lucide](https://lucide.dev/)

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Submit a pull request
- Check existing documentation

---

**Built with ❤️ for Software Architects**
