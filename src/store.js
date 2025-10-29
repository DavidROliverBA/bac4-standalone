import { create } from 'zustand';

// Helper function to get the correct store property name for a type
const getPropertyName = (type) => {
  const mapping = {
    'system': 'systems',
    'container': 'containers',
    'component': 'components',
    'person': 'people',
    'externalSystem': 'externalSystems',
  };
  return mapping[type] || `${type}s`;
};

const useStore = create((set, get) => ({
  // Project metadata
  metadata: {
    name: 'New C4 Model',
    version: '1.0',
    author: 'Solution Architect',
  },

  // Current C4 level (context, container, component, code)
  currentLevel: 'context',

  // Selected element for editing
  selectedElement: null,

  // Elements by type
  systems: [],
  containers: [],
  components: [],
  people: [],
  externalSystems: [],

  // Relationships
  relationships: [],

  // Validation warnings
  warnings: [],

  // Actions
  setMetadata: (metadata) => set({ metadata }),

  setCurrentLevel: (level) => set({ currentLevel: level }),

  setSelectedElement: (element) => set({ selectedElement: element }),

  // Add element
  addElement: (type, element) => {
    const newElement = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      ...element,
    };

    const propertyName = getPropertyName(type);
    set((state) => ({
      [propertyName]: [...state[propertyName], newElement],
    }));

    return newElement;
  },

  // Update element
  updateElement: (type, id, updates) => {
    const propertyName = getPropertyName(type);
    set((state) => ({
      [propertyName]: state[propertyName].map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    }));
  },

  // Delete element
  deleteElement: (type, id) => {
    const propertyName = getPropertyName(type);
    set((state) => ({
      [propertyName]: state[propertyName].filter((el) => el.id !== id),
      relationships: state.relationships.filter(
        (rel) => rel.from !== id && rel.to !== id
      ),
    }));
  },

  // Add relationship
  addRelationship: (relationship) => {
    const newRel = {
      id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...relationship,
    };

    set((state) => ({
      relationships: [...state.relationships, newRel],
    }));

    return newRel;
  },

  // Update relationship
  updateRelationship: (id, updates) => {
    set((state) => ({
      relationships: state.relationships.map((rel) =>
        rel.id === id ? { ...rel, ...updates } : rel
      ),
    }));
  },

  // Delete relationship
  deleteRelationship: (id) => {
    set((state) => ({
      relationships: state.relationships.filter((rel) => rel.id !== id),
    }));
  },

  // Get all elements
  getAllElements: () => {
    const state = get();
    return [
      ...state.systems,
      ...state.containers,
      ...state.components,
      ...state.people,
      ...state.externalSystems,
    ];
  },

  // Get element by id
  getElementById: (id) => {
    const elements = get().getAllElements();
    return elements.find((el) => el.id === id);
  },

  // Clear all data
  clearAll: () => {
    set({
      systems: [],
      containers: [],
      components: [],
      people: [],
      externalSystems: [],
      relationships: [],
      selectedElement: null,
      warnings: [],
    });
  },

  // Import model
  importModel: (model) => {
    set({
      metadata: model.metadata || get().metadata,
      systems: model.systems || [],
      containers: model.containers || [],
      components: model.components || [],
      people: model.people || [],
      externalSystems: model.externalSystems || [],
      relationships: model.relationships || [],
    });
  },

  // Export model
  exportModel: () => {
    const state = get();
    return {
      metadata: state.metadata,
      systems: state.systems,
      containers: state.containers,
      components: state.components,
      people: state.people,
      externalSystems: state.externalSystems,
      relationships: state.relationships,
    };
  },

  // Validate model
  validateModel: () => {
    const state = get();
    const warnings = [];

    // Check for containers without parent system
    state.containers.forEach((container) => {
      if (container.parentSystem && !state.systems.find((s) => s.id === container.parentSystem)) {
        warnings.push({
          type: 'warning',
          message: `Container "${container.name}" references non-existent parent system`,
          elementId: container.id,
        });
      }
    });

    // Check for components without parent container
    state.components.forEach((component) => {
      if (component.parentContainer && !state.containers.find((c) => c.id === component.parentContainer)) {
        warnings.push({
          type: 'warning',
          message: `Component "${component.name}" references non-existent parent container`,
          elementId: component.id,
        });
      }
    });

    // Check for orphaned relationships
    const allElements = state.getAllElements();
    const elementIds = new Set(allElements.map((el) => el.id));

    state.relationships.forEach((rel) => {
      if (!elementIds.has(rel.from)) {
        warnings.push({
          type: 'error',
          message: `Relationship references non-existent source element: ${rel.from}`,
          elementId: rel.id,
        });
      }
      if (!elementIds.has(rel.to)) {
        warnings.push({
          type: 'error',
          message: `Relationship references non-existent target element: ${rel.to}`,
          elementId: rel.id,
        });
      }
    });

    // Check complexity
    const visibleElements = get().getVisibleElements();
    if (visibleElements.length > 15) {
      warnings.push({
        type: 'info',
        message: `Current view has ${visibleElements.length} elements. Consider splitting into multiple diagrams for clarity.`,
      });
    }

    set({ warnings });
    return warnings;
  },

  // Get visible elements based on current level
  getVisibleElements: () => {
    const state = get();
    const level = state.currentLevel;

    switch (level) {
      case 'context':
        return [...state.systems, ...state.people, ...state.externalSystems];
      case 'container':
        return [...state.systems, ...state.containers, ...state.people, ...state.externalSystems];
      case 'component':
        return [...state.containers, ...state.components, ...state.people];
      case 'code':
        return [...state.components];
      default:
        return state.getAllElements();
    }
  },
}));

export default useStore;
