/**
 * Auto-layout algorithms for C4 diagrams
 */

/**
 * Simple hierarchical layout
 * Arranges elements in layers based on their type
 */
export const applyHierarchicalLayout = (elements) => {
  const layers = {
    person: [],
    externalSystem: [],
    system: [],
    container: [],
    component: [],
  };

  // Group elements by type
  elements.forEach((el) => {
    if (layers[el.type]) {
      layers[el.type].push(el);
    }
  });

  // Layout parameters
  const startY = 100;
  const layerSpacing = 200;
  const elementSpacing = 250;

  let currentY = startY;
  const updatedElements = [];

  // Layout each layer
  Object.keys(layers).forEach((type) => {
    const layerElements = layers[type];
    if (layerElements.length === 0) return;

    const totalWidth = layerElements.length * elementSpacing;
    const startX = Math.max(100, (1200 - totalWidth) / 2); // Center elements

    layerElements.forEach((el, index) => {
      updatedElements.push({
        ...el,
        position: {
          x: startX + index * elementSpacing,
          y: currentY,
        },
      });
    });

    currentY += layerSpacing;
  });

  return updatedElements;
};

/**
 * Grid layout
 * Arranges elements in a grid pattern
 */
export const applyGridLayout = (elements) => {
  const cols = Math.ceil(Math.sqrt(elements.length));
  const spacing = 300;
  const startX = 100;
  const startY = 100;

  return elements.map((el, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    return {
      ...el,
      position: {
        x: startX + col * spacing,
        y: startY + row * spacing,
      },
    };
  });
};

/**
 * Circular layout
 * Arranges elements in a circle
 */
export const applyCircularLayout = (elements) => {
  const centerX = 600;
  const centerY = 400;
  const radius = 300;

  return elements.map((el, index) => {
    const angle = (index / elements.length) * 2 * Math.PI;
    return {
      ...el,
      position: {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      },
    };
  });
};

/**
 * Force-directed layout simulation (simple version)
 * Spreads elements out to minimize overlap
 */
export const applyForceLayout = (elements, relationships = []) => {
  const iterations = 50;
  const repulsionStrength = 5000;
  const attractionStrength = 0.01;
  const damping = 0.8;

  // Initialize velocities
  const nodes = elements.map((el) => ({
    ...el,
    vx: 0,
    vy: 0,
    position: el.position || { x: Math.random() * 800 + 100, y: Math.random() * 600 + 100 },
  }));

  // Build adjacency map
  const adjacency = new Map();
  relationships.forEach((rel) => {
    if (!adjacency.has(rel.from)) adjacency.set(rel.from, []);
    if (!adjacency.has(rel.to)) adjacency.set(rel.to, []);
    adjacency.get(rel.from).push(rel.to);
    adjacency.get(rel.to).push(rel.from);
  });

  // Simulation iterations
  for (let iter = 0; iter < iterations; iter++) {
    // Apply repulsion between all nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].position.x - nodes[i].position.x;
        const dy = nodes[j].position.y - nodes[i].position.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq) || 1;

        const force = repulsionStrength / distSq;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        nodes[i].vx -= fx;
        nodes[i].vy -= fy;
        nodes[j].vx += fx;
        nodes[j].vy += fy;
      }
    }

    // Apply attraction between connected nodes
    relationships.forEach((rel) => {
      const source = nodes.find((n) => n.id === rel.from);
      const target = nodes.find((n) => n.id === rel.to);

      if (source && target) {
        const dx = target.position.x - source.position.x;
        const dy = target.position.y - source.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const force = attractionStrength * dist;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        source.vx += fx;
        source.vy += fy;
        target.vx -= fx;
        target.vy -= fy;
      }
    });

    // Update positions
    nodes.forEach((node) => {
      node.vx *= damping;
      node.vy *= damping;
      node.position.x += node.vx;
      node.position.y += node.vy;

      // Keep within bounds
      node.position.x = Math.max(50, Math.min(1400, node.position.x));
      node.position.y = Math.max(50, Math.min(900, node.position.y));
    });
  }

  return nodes.map(({ vx, vy, ...node }) => node);
};

/**
 * Snap element positions to grid
 */
export const snapToGrid = (elements, gridSize = 50) => {
  return elements.map((el) => ({
    ...el,
    position: {
      x: Math.round(el.position.x / gridSize) * gridSize,
      y: Math.round(el.position.y / gridSize) * gridSize,
    },
  }));
};
