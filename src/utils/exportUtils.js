import { toPng, toSvg } from 'html-to-image';
import { saveAs } from 'file-saver';

/**
 * Export diagram as PNG
 */
export const exportAsPNG = async (elementId = 'react-flow-wrapper') => {
  const element = document.querySelector('.react-flow');
  if (!element) {
    alert('Canvas not found');
    return;
  }

  try {
    const dataUrl = await toPng(element, {
      backgroundColor: '#f9fafb',
      filter: (node) => {
        // Exclude controls and minimap from export
        return !node.classList?.contains('react-flow__controls') &&
               !node.classList?.contains('react-flow__minimap');
      },
    });

    saveAs(dataUrl, 'c4-diagram.png');
  } catch (error) {
    console.error('Error exporting PNG:', error);
    alert('Failed to export PNG: ' + error.message);
  }
};

/**
 * Export diagram as SVG
 */
export const exportAsSVG = async () => {
  const element = document.querySelector('.react-flow');
  if (!element) {
    alert('Canvas not found');
    return;
  }

  try {
    const dataUrl = await toSvg(element, {
      backgroundColor: '#f9fafb',
      filter: (node) => {
        return !node.classList?.contains('react-flow__controls') &&
               !node.classList?.contains('react-flow__minimap');
      },
    });

    saveAs(dataUrl, 'c4-diagram.svg');
  } catch (error) {
    console.error('Error exporting SVG:', error);
    alert('Failed to export SVG: ' + error.message);
  }
};

/**
 * Generate Mermaid C4 diagram syntax from model
 */
export const generateMermaid = (model) => {
  // Determine diagram type based on elements present
  let diagramType = 'C4Context';
  if (model.components?.length > 0) {
    diagramType = 'C4Component';
  } else if (model.containers?.length > 0) {
    diagramType = 'C4Container';
  }

  let mermaid = `${diagramType}\n`;
  mermaid += `  title ${model.metadata.name}\n\n`;

  // Add people
  model.people?.forEach((person) => {
    const desc = person.description || '';
    mermaid += `  Person(${sanitizeId(person.id)}, "${person.name}", "${desc}")\n`;
  });

  if (model.people?.length > 0) mermaid += '\n';

  // Add systems
  model.systems?.forEach((system) => {
    const desc = system.description || '';
    const tech = system.technology || '';
    if (tech) {
      mermaid += `  System(${sanitizeId(system.id)}, "${system.name}", "${desc}", "${tech}")\n`;
    } else {
      mermaid += `  System(${sanitizeId(system.id)}, "${system.name}", "${desc}")\n`;
    }
  });

  if (model.systems?.length > 0) mermaid += '\n';

  // Add external systems
  model.externalSystems?.forEach((system) => {
    const desc = system.description || '';
    mermaid += `  System_Ext(${sanitizeId(system.id)}, "${system.name}", "${desc}")\n`;
  });

  if (model.externalSystems?.length > 0) mermaid += '\n';

  // Add containers
  model.containers?.forEach((container) => {
    const desc = container.description || '';
    const tech = container.technology || '';
    if (tech) {
      mermaid += `  Container(${sanitizeId(container.id)}, "${container.name}", "${tech}", "${desc}")\n`;
    } else {
      mermaid += `  Container(${sanitizeId(container.id)}, "${container.name}", "${desc}")\n`;
    }
  });

  if (model.containers?.length > 0) mermaid += '\n';

  // Add components
  model.components?.forEach((component) => {
    const desc = component.description || '';
    const tech = component.technology || '';
    if (tech) {
      mermaid += `  Component(${sanitizeId(component.id)}, "${component.name}", "${tech}", "${desc}")\n`;
    } else {
      mermaid += `  Component(${sanitizeId(component.id)}, "${component.name}", "${desc}")\n`;
    }
  });

  if (model.components?.length > 0) mermaid += '\n';

  // Add relationships
  model.relationships?.forEach((rel) => {
    const desc = rel.description || 'uses';
    const tech = rel.technology || '';

    // Determine relationship direction based on arrowDirection
    const arrow = rel.arrowDirection === 'left' ? 'Rel_Back' : 'Rel';

    if (tech) {
      mermaid += `  ${arrow}(${sanitizeId(rel.from)}, ${sanitizeId(rel.to)}, "${desc}", "${tech}")\n`;
    } else {
      mermaid += `  ${arrow}(${sanitizeId(rel.from)}, ${sanitizeId(rel.to)}, "${desc}")\n`;
    }
  });

  return mermaid;
};

/**
 * Generate PlantUML C4 syntax from model
 */
export const generatePlantUML = (model) => {
  let plantuml = '@startuml\n';
  plantuml += '!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml\n\n';
  plantuml += `title ${model.metadata.name}\n\n`;

  // Add people
  model.people?.forEach((person) => {
    plantuml += `Person(${sanitizeId(person.id)}, "${person.name}", "${person.description || ''}")\n`;
  });

  // Add systems
  model.systems?.forEach((system) => {
    plantuml += `System(${sanitizeId(system.id)}, "${system.name}", "${system.description || ''}")\n`;
  });

  // Add external systems
  model.externalSystems?.forEach((system) => {
    plantuml += `System_Ext(${sanitizeId(system.id)}, "${system.name}", "${system.description || ''}")\n`;
  });

  // Add containers
  model.containers?.forEach((container) => {
    const tech = container.technology ? `, "${container.technology}"` : '';
    plantuml += `Container(${sanitizeId(container.id)}, "${container.name}", "${container.description || ''}"${tech})\n`;
  });

  // Add components
  model.components?.forEach((component) => {
    const tech = component.technology ? `, "${component.technology}"` : '';
    plantuml += `Component(${sanitizeId(component.id)}, "${component.name}", "${component.description || ''}"${tech})\n`;
  });

  plantuml += '\n';

  // Add relationships
  model.relationships?.forEach((rel) => {
    const desc = rel.description || 'uses';
    const tech = rel.technology ? `, "${rel.technology}"` : '';
    plantuml += `Rel(${sanitizeId(rel.from)}, ${sanitizeId(rel.to)}, "${desc}"${tech})\n`;
  });

  plantuml += '\n@enduml';

  return plantuml;
};

/**
 * Generate Markdown documentation from model
 */
export const generateMarkdown = (model) => {
  let md = `# ${model.metadata.name}\n\n`;
  md += `**Version:** ${model.metadata.version}\n`;
  md += `**Author:** ${model.metadata.author}\n\n`;

  md += `---\n\n`;

  // Systems
  if (model.systems?.length > 0) {
    md += `## Software Systems\n\n`;
    model.systems.forEach((system) => {
      md += `### ${system.name}\n\n`;
      if (system.description) md += `${system.description}\n\n`;
      if (system.technology) md += `**Technology:** ${system.technology}\n\n`;

      // Find containers in this system
      const containers = model.containers?.filter(c => c.parentSystem === system.id) || [];
      if (containers.length > 0) {
        md += `#### Containers\n\n`;
        containers.forEach((container) => {
          md += `- **${container.name}**`;
          if (container.technology) md += ` (${container.technology})`;
          if (container.description) md += `: ${container.description}`;
          md += `\n`;
        });
        md += `\n`;
      }
    });
  }

  // External Systems
  if (model.externalSystems?.length > 0) {
    md += `## External Systems\n\n`;
    model.externalSystems.forEach((system) => {
      md += `### ${system.name}\n\n`;
      if (system.description) md += `${system.description}\n\n`;
    });
  }

  // People
  if (model.people?.length > 0) {
    md += `## People / Actors\n\n`;
    model.people.forEach((person) => {
      md += `### ${person.name}\n\n`;
      if (person.description) md += `${person.description}\n\n`;
    });
  }

  // Relationships
  if (model.relationships?.length > 0) {
    md += `## Relationships\n\n`;
    md += `| From | To | Description | Technology |\n`;
    md += `|------|-----|-------------|------------|\n`;

    model.relationships.forEach((rel) => {
      const fromEl = findElementById(model, rel.from);
      const toEl = findElementById(model, rel.to);
      const fromName = fromEl?.name || rel.from;
      const toName = toEl?.name || rel.to;

      md += `| ${fromName} | ${toName} | ${rel.description || '-'} | ${rel.technology || '-'} |\n`;
    });
    md += `\n`;
  }

  return md;
};

/**
 * Export as standalone HTML file
 */
export const exportAsHTML = (model) => {
  const markdown = generateMarkdown(model);
  const plantuml = generatePlantUML(model);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${model.metadata.name} - C4 Model</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            line-height: 1.6;
        }
        h1, h2, h3, h4 { color: #1e293b; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }
        th, td {
            border: 1px solid #e2e8f0;
            padding: 0.75rem;
            text-align: left;
        }
        th { background-color: #f1f5f9; font-weight: 600; }
        pre {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            padding: 1rem;
            overflow-x: auto;
        }
        code {
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.875rem;
        }
        .metadata {
            background-color: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 1rem;
            margin: 1rem 0;
        }
    </style>
</head>
<body>
    <div class="metadata">
        <h1>${model.metadata.name}</h1>
        <p><strong>Version:</strong> ${model.metadata.version}</p>
        <p><strong>Author:</strong> ${model.metadata.author}</p>
    </div>

    ${markdownToHTML(markdown)}

    <h2>PlantUML Diagram Code</h2>
    <pre><code>${plantuml}</code></pre>

    <h2>JSON Model</h2>
    <pre><code>${JSON.stringify(model, null, 2)}</code></pre>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  saveAs(blob, `${model.metadata.name.replace(/\s+/g, '-').toLowerCase()}-c4-model.html`);
};

// Helper functions
const sanitizeId = (id) => {
  return id.replace(/[^a-zA-Z0-9]/g, '_');
};

const findElementById = (model, id) => {
  const allElements = [
    ...(model.systems || []),
    ...(model.containers || []),
    ...(model.components || []),
    ...(model.people || []),
    ...(model.externalSystems || []),
  ];
  return allElements.find(el => el.id === id);
};

const markdownToHTML = (markdown) => {
  // Simple markdown to HTML converter
  return markdown
    .split('\n')
    .map(line => {
      if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`;
      if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`;
      if (line.startsWith('### ')) return `<h3>${line.substring(4)}</h3>`;
      if (line.startsWith('#### ')) return `<h4>${line.substring(5)}</h4>`;
      if (line.startsWith('- ')) return `<li>${line.substring(2)}</li>`;
      if (line.startsWith('**') && line.endsWith('**')) {
        return `<p><strong>${line.substring(2, line.length - 2)}</strong></p>`;
      }
      if (line.trim() === '---') return '<hr>';
      if (line.trim() === '') return '<br>';
      return `<p>${line}</p>`;
    })
    .join('\n');
};
