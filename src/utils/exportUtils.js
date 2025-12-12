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

/**
 * Escape XML special characters
 */
const escapeXml = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/**
 * Get C4 element styling for draw.io
 */
const getDrawioStyle = (type) => {
  const baseStyle = 'rounded=1;whiteSpace=wrap;html=1;verticalAlign=top;align=center;spacingTop=8;';

  switch (type) {
    case 'person':
      return `${baseStyle}fillColor=#e1d5e7;strokeColor=#9673a6;`;
    case 'system':
      return `${baseStyle}fillColor=#dae8fc;strokeColor=#6c8ebf;`;
    case 'externalSystem':
      return `${baseStyle}fillColor=#f5f5f5;strokeColor=#666666;dashed=1;`;
    case 'container':
      return `${baseStyle}fillColor=#d5e8d4;strokeColor=#82b366;`;
    case 'component':
      return `${baseStyle}fillColor=#fff2cc;strokeColor=#d6b656;`;
    default:
      return `${baseStyle}fillColor=#ffffff;strokeColor=#000000;`;
  }
};

/**
 * Get edge style for draw.io based on relationship properties
 */
const getDrawioEdgeStyle = (rel) => {
  let style = 'edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;';

  // Line style
  if (rel.lineStyle === 'dashed') {
    style += 'dashed=1;dashPattern=8 8;';
  } else if (rel.lineStyle === 'dotted') {
    style += 'dashed=1;dashPattern=2 2;';
  }

  // Arrow direction
  if (rel.arrowDirection === 'left') {
    style += 'startArrow=classic;endArrow=none;';
  } else if (rel.arrowDirection === 'both') {
    style += 'startArrow=classic;endArrow=classic;';
  } else {
    style += 'startArrow=none;endArrow=classic;';
  }

  style += 'strokeColor=#666666;';

  return style;
};

/**
 * Generate draw.io XML format from model
 */
export const generateDrawio = (model) => {
  const timestamp = new Date().toISOString();
  const diagramId = `diagram-${Date.now()}`;

  // Collect all elements
  const allElements = [
    ...(model.people || []),
    ...(model.systems || []),
    ...(model.externalSystems || []),
    ...(model.containers || []),
    ...(model.components || []),
  ];

  // Calculate diagram bounds
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  allElements.forEach(el => {
    const x = el.position?.x || 0;
    const y = el.position?.y || 0;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + 220);
    maxY = Math.max(maxY, y + 120);
  });

  // Add padding
  const offsetX = minX < 50 ? 50 - minX : 0;
  const offsetY = minY < 50 ? 50 - minY : 0;
  const pageWidth = Math.max(1100, maxX + offsetX + 100);
  const pageHeight = Math.max(850, maxY + offsetY + 100);

  // Build XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="BAC4" modified="${timestamp}" agent="BAC4 C4 Modelling Tool" version="1.0" type="device">
  <diagram name="${escapeXml(model.metadata?.name || 'C4 Diagram')}" id="${diagramId}">
    <mxGraphModel dx="0" dy="0" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${pageWidth}" pageHeight="${pageHeight}" background="#ffffff" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
`;

  // Map to track element IDs for edges
  const elementIdMap = new Map();
  let cellId = 2;

  // Generate type label
  const getTypeLabel = (type) => {
    switch (type) {
      case 'person': return '[Person]';
      case 'system': return '[Software System]';
      case 'externalSystem': return '[External System]';
      case 'container': return '[Container]';
      case 'component': return '[Component]';
      default: return '';
    }
  };

  // Add elements as mxCell nodes
  allElements.forEach(el => {
    const id = `cell-${cellId++}`;
    elementIdMap.set(el.id, id);

    const x = (el.position?.x || 0) + offsetX;
    const y = (el.position?.y || 0) + offsetY;
    const width = 220;
    const height = 120;
    const style = getDrawioStyle(el.type);

    // Build cell value with C4 formatting
    const typeLabel = getTypeLabel(el.type);
    const tech = el.technology ? `[${escapeXml(el.technology)}]` : '';
    const desc = el.description ? `&lt;br&gt;&lt;font style=&quot;font-size: 10px&quot;&gt;${escapeXml(el.description)}&lt;/font&gt;` : '';

    const value = `&lt;b&gt;${escapeXml(el.name)}&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size: 10px; color: #666666;&quot;&gt;${typeLabel}${tech ? '&lt;br&gt;' + tech : ''}&lt;/font&gt;${desc}`;

    xml += `        <mxCell id="${id}" value="${value}" style="${style}" vertex="1" parent="1">
          <mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry" />
        </mxCell>
`;
  });

  // Add relationships as edge mxCell nodes
  (model.relationships || []).forEach(rel => {
    const id = `edge-${cellId++}`;
    const sourceId = elementIdMap.get(rel.from);
    const targetId = elementIdMap.get(rel.to);

    if (!sourceId || !targetId) return;

    const style = getDrawioEdgeStyle(rel);
    const label = rel.description || '';
    const tech = rel.technology ? `[${escapeXml(rel.technology)}]` : '';
    const value = tech ? `${escapeXml(label)}&lt;br&gt;&lt;font style=&quot;font-size: 9px&quot;&gt;${tech}&lt;/font&gt;` : escapeXml(label);

    xml += `        <mxCell id="${id}" value="${value}" style="${style}" edge="1" parent="1" source="${sourceId}" target="${targetId}">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
`;
  });

  xml += `      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

  return xml;
};

/**
 * Export diagram as draw.io file
 */
export const exportAsDrawio = (model) => {
  const drawioXml = generateDrawio(model);
  const blob = new Blob([drawioXml], { type: 'application/xml' });
  const filename = `${(model.metadata?.name || 'c4-diagram').replace(/\s+/g, '-').toLowerCase()}.drawio`;
  saveAs(blob, filename);
};
