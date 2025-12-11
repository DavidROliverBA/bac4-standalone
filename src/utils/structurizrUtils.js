/**
 * Utilities for converting between BAC4 format and Structurizr JSON format
 *
 * Structurizr uses a hierarchical model structure:
 * - Workspace (top level)
 *   - Model (architecture elements)
 *     - People
 *     - Software Systems
 *       - Containers
 *         - Components
 *   - Views (visualization configurations)
 */

/**
 * Export BAC4 model to Structurizr JSON format
 * @param {Object} model - BAC4 model object
 * @returns {Object} Structurizr workspace JSON
 */
export const exportToStructurizr = (model) => {
  // Generate IDs for Structurizr (using simple incremental numbers)
  let idCounter = 1;
  const idMap = new Map(); // Map BAC4 IDs to Structurizr IDs

  const getStructurizrId = (bac4Id) => {
    if (!idMap.has(bac4Id)) {
      idMap.set(bac4Id, String(idCounter++));
    }
    return idMap.get(bac4Id);
  };

  // Convert people
  const people = (model.people || []).map(person => {
    const id = getStructurizrId(person.id);
    return {
      id,
      name: person.name || 'Unnamed Person',
      description: person.description || '',
      tags: (person.tags || []).join(',') || 'Person',
      location: 'Unspecified',
      relationships: []
    };
  });

  // Convert software systems (including external systems)
  const softwareSystems = [];

  // Regular systems
  (model.systems || []).forEach(system => {
    const id = getStructurizrId(system.id);
    softwareSystems.push({
      id,
      name: system.name || 'Unnamed System',
      description: system.description || '',
      tags: (system.tags || []).join(',') || 'Software System',
      location: 'Unspecified',
      containers: [],
      relationships: []
    });
  });

  // External systems
  (model.externalSystems || []).forEach(system => {
    const id = getStructurizrId(system.id);
    softwareSystems.push({
      id,
      name: system.name || 'Unnamed External System',
      description: system.description || '',
      tags: (system.tags || []).join(',') || 'Software System,External',
      location: 'External',
      containers: [],
      relationships: []
    });
  });

  // Convert containers and add them to their parent systems
  (model.containers || []).forEach(container => {
    const id = getStructurizrId(container.id);
    const containerObj = {
      id,
      name: container.name || 'Unnamed Container',
      description: container.description || '',
      technology: container.technology || '',
      tags: (container.tags || []).join(',') || 'Container',
      components: [],
      relationships: []
    };

    // Try to find parent system
    const parentSystem = softwareSystems.find(s =>
      getStructurizrId(container.parentSystem) === s.id
    );

    if (parentSystem) {
      parentSystem.containers.push(containerObj);
    } else {
      // If no parent, add to first available system or create a default one
      if (softwareSystems.length === 0) {
        softwareSystems.push({
          id: String(idCounter++),
          name: 'Default System',
          description: 'System created to contain orphaned containers',
          tags: 'Software System',
          location: 'Unspecified',
          containers: [containerObj],
          relationships: []
        });
      } else {
        softwareSystems[0].containers.push(containerObj);
      }
    }
  });

  // Convert components and add them to their parent containers
  (model.components || []).forEach(component => {
    const id = getStructurizrId(component.id);
    const componentObj = {
      id,
      name: component.name || 'Unnamed Component',
      description: component.description || '',
      technology: component.technology || '',
      tags: (component.tags || []).join(',') || 'Component',
      relationships: []
    };

    // Find parent container
    let added = false;
    for (const system of softwareSystems) {
      const parentContainer = system.containers.find(c =>
        getStructurizrId(component.parentContainer) === c.id
      );
      if (parentContainer) {
        parentContainer.components.push(componentObj);
        added = true;
        break;
      }
    }

    // If no parent found, add to first available container
    if (!added) {
      for (const system of softwareSystems) {
        if (system.containers.length > 0) {
          system.containers[0].components.push(componentObj);
          added = true;
          break;
        }
      }
    }

    // If still not added, create default hierarchy
    if (!added) {
      if (softwareSystems.length === 0) {
        softwareSystems.push({
          id: String(idCounter++),
          name: 'Default System',
          description: 'System created to contain orphaned components',
          tags: 'Software System',
          location: 'Unspecified',
          containers: [{
            id: String(idCounter++),
            name: 'Default Container',
            description: 'Container created to contain orphaned components',
            technology: '',
            tags: 'Container',
            components: [componentObj],
            relationships: []
          }],
          relationships: []
        });
      } else if (softwareSystems[0].containers.length === 0) {
        softwareSystems[0].containers.push({
          id: String(idCounter++),
          name: 'Default Container',
          description: 'Container created to contain orphaned components',
          technology: '',
          tags: 'Container',
          components: [componentObj],
          relationships: []
        });
      } else {
        softwareSystems[0].containers[0].components.push(componentObj);
      }
    }
  });

  // Helper function to add relationship to the correct element
  const addRelationshipToElement = (relationship) => {
    const sourceId = getStructurizrId(relationship.from);
    const destinationId = getStructurizrId(relationship.to);

    const rel = {
      sourceId,
      destinationId,
      description: relationship.description || '',
      technology: relationship.technology || '',
      tags: relationship.tags || ''
    };

    // Try to find source element and add relationship
    // Check people
    const person = people.find(p => p.id === sourceId);
    if (person) {
      person.relationships.push(rel);
      return;
    }

    // Check systems and nested elements
    for (const system of softwareSystems) {
      if (system.id === sourceId) {
        system.relationships.push(rel);
        return;
      }

      // Check containers
      for (const container of system.containers) {
        if (container.id === sourceId) {
          container.relationships.push(rel);
          return;
        }

        // Check components
        for (const component of container.components) {
          if (component.id === sourceId) {
            component.relationships.push(rel);
            return;
          }
        }
      }
    }
  };

  // Convert relationships
  (model.relationships || []).forEach(relationship => {
    addRelationshipToElement(relationship);
  });

  // Create views
  const views = {
    systemLandscapeViews: [],
    systemContextViews: [],
    containerViews: [],
    componentViews: [],
    configuration: {
      styles: {
        elements: [
          {
            tag: 'Person',
            shape: 'Person',
            background: '#08427b',
            color: '#ffffff'
          },
          {
            tag: 'Software System',
            background: '#1168bd',
            color: '#ffffff'
          },
          {
            tag: 'External',
            background: '#999999',
            color: '#ffffff'
          },
          {
            tag: 'Container',
            background: '#438dd5',
            color: '#ffffff'
          },
          {
            tag: 'Component',
            background: '#85bbf0',
            color: '#000000'
          }
        ],
        relationships: []
      }
    }
  };

  // Create a system landscape view if there are systems
  if (softwareSystems.length > 0 || people.length > 0) {
    const elements = [];
    let x = 100, y = 100;

    people.forEach(person => {
      elements.push({ id: person.id, x, y });
      x += 300;
      if (x > 1200) {
        x = 100;
        y += 300;
      }
    });

    softwareSystems.forEach(system => {
      elements.push({ id: system.id, x, y });
      x += 300;
      if (x > 1200) {
        x = 100;
        y += 300;
      }
    });

    views.systemLandscapeViews.push({
      key: 'SystemLandscape',
      description: 'System Landscape view',
      elements,
      relationships: [],
      automaticLayout: {
        rankDirection: 'TopBottom',
        rankSeparation: 200,
        nodeSeparation: 200
      }
    });
  }

  // Build the complete Structurizr workspace
  const workspace = {
    id: 1,
    name: model.metadata?.name || 'Architecture Model',
    description: `Exported from BAC4 on ${new Date().toISOString()}`,
    version: model.metadata?.version || '1.0',
    model: {
      people,
      softwareSystems
    },
    views,
    documentation: {},
    properties: {
      exportedFrom: 'BAC4',
      author: model.metadata?.author || ''
    }
  };

  return workspace;
};

/**
 * Import Structurizr JSON format to BAC4 model
 * @param {Object} workspace - Structurizr workspace JSON
 * @returns {Object} BAC4 model object
 */
export const importFromStructurizr = (workspace) => {
  const model = {
    metadata: {
      name: workspace.name || 'Imported Model',
      version: workspace.version || '1.0',
      author: workspace.properties?.author || workspace.lastModifiedUser || 'Unknown'
    },
    systems: [],
    containers: [],
    components: [],
    people: [],
    externalSystems: [],
    relationships: []
  };

  // Map to store position information from views
  const positionMap = new Map();

  // Extract positions from views
  const allViews = [
    ...(workspace.views?.systemLandscapeViews || []),
    ...(workspace.views?.systemContextViews || []),
    ...(workspace.views?.containerViews || []),
    ...(workspace.views?.componentViews || [])
  ];

  allViews.forEach(view => {
    (view.elements || []).forEach(element => {
      if (element.x !== undefined && element.y !== undefined) {
        positionMap.set(element.id, { x: element.x, y: element.y });
      }
    });
  });

  // Helper to get position or default
  const getPosition = (id) => {
    return positionMap.get(id) || { x: 100, y: 100 };
  };

  // Helper to generate BAC4-style ID
  const generateBac4Id = (type, structurizrId) => {
    return `${type}-${Date.now()}-${structurizrId}-${Math.random().toString(36).substr(2, 5)}`;
  };

  // Map to track Structurizr ID to BAC4 ID conversion
  const idMap = new Map();

  // Convert people
  (workspace.model?.people || []).forEach(person => {
    const bac4Id = generateBac4Id('person', person.id);
    idMap.set(person.id, bac4Id);

    const position = getPosition(person.id);
    model.people.push({
      id: bac4Id,
      type: 'person',
      name: person.name,
      description: person.description || '',
      technology: '',
      tags: person.tags ? person.tags.split(',').map(t => t.trim()).filter(t => t !== 'Person') : [],
      position
    });
  });

  // Convert software systems
  (workspace.model?.softwareSystems || []).forEach(system => {
    const isExternal = system.location === 'External' ||
                       (system.tags && system.tags.includes('External'));

    const bac4Id = generateBac4Id(isExternal ? 'externalSystem' : 'system', system.id);
    idMap.set(system.id, bac4Id);

    const position = getPosition(system.id);
    const systemObj = {
      id: bac4Id,
      type: isExternal ? 'externalSystem' : 'system',
      name: system.name,
      description: system.description || '',
      technology: '',
      tags: system.tags ? system.tags.split(',').map(t => t.trim()).filter(t =>
        t !== 'Software System' && t !== 'External'
      ) : [],
      position
    };

    if (isExternal) {
      model.externalSystems.push(systemObj);
    } else {
      model.systems.push(systemObj);
    }

    // Convert containers within this system
    (system.containers || []).forEach(container => {
      const containerBac4Id = generateBac4Id('container', container.id);
      idMap.set(container.id, containerBac4Id);

      const containerPosition = getPosition(container.id);
      model.containers.push({
        id: containerBac4Id,
        type: 'container',
        name: container.name,
        description: container.description || '',
        technology: container.technology || '',
        tags: container.tags ? container.tags.split(',').map(t => t.trim()).filter(t => t !== 'Container') : [],
        position: containerPosition,
        parentSystem: bac4Id
      });

      // Convert components within this container
      (container.components || []).forEach(component => {
        const componentBac4Id = generateBac4Id('component', component.id);
        idMap.set(component.id, componentBac4Id);

        const componentPosition = getPosition(component.id);
        model.components.push({
          id: componentBac4Id,
          type: 'component',
          name: component.name,
          description: component.description || '',
          technology: component.technology || '',
          tags: component.tags ? component.tags.split(',').map(t => t.trim()).filter(t => t !== 'Component') : [],
          position: componentPosition,
          parentContainer: containerBac4Id
        });

        // Convert component relationships
        (component.relationships || []).forEach(rel => {
          const fromBac4Id = idMap.get(rel.sourceId);
          const toBac4Id = idMap.get(rel.destinationId);

          if (fromBac4Id && toBac4Id) {
            model.relationships.push({
              id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              from: fromBac4Id,
              to: toBac4Id,
              description: rel.description || '',
              technology: rel.technology || '',
              arrowDirection: 'right',
              lineStyle: 'solid',
              animated: false
            });
          }
        });
      });

      // Convert container relationships
      (container.relationships || []).forEach(rel => {
        const fromBac4Id = idMap.get(rel.sourceId);
        const toBac4Id = idMap.get(rel.destinationId);

        if (fromBac4Id && toBac4Id) {
          model.relationships.push({
            id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            from: fromBac4Id,
            to: toBac4Id,
            description: rel.description || '',
            technology: rel.technology || '',
            arrowDirection: 'right',
            lineStyle: 'solid',
            animated: false
          });
        }
      });
    });

    // Convert system relationships
    (system.relationships || []).forEach(rel => {
      const fromBac4Id = idMap.get(rel.sourceId);
      const toBac4Id = idMap.get(rel.destinationId);

      if (fromBac4Id && toBac4Id) {
        model.relationships.push({
          id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          from: fromBac4Id,
          to: toBac4Id,
          description: rel.description || '',
          technology: rel.technology || '',
          arrowDirection: 'right',
          lineStyle: 'solid',
          animated: false
        });
      }
    });
  });

  // Convert person relationships
  (workspace.model?.people || []).forEach(person => {
    (person.relationships || []).forEach(rel => {
      const fromBac4Id = idMap.get(rel.sourceId);
      const toBac4Id = idMap.get(rel.destinationId);

      if (fromBac4Id && toBac4Id) {
        model.relationships.push({
          id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          from: fromBac4Id,
          to: toBac4Id,
          description: rel.description || '',
          technology: rel.technology || '',
          arrowDirection: 'right',
          lineStyle: 'solid',
          animated: false
        });
      }
    });
  });

  return model;
};
