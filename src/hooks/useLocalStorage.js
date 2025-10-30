import { useEffect } from 'react';
import useStore from '../store';

const LOCAL_STORAGE_KEY = 'c4-model-autosave';
const AUTOSAVE_INTERVAL = 30000; // 30 seconds

/**
 * Sanitize an element by extracting only safe, serializable properties
 */
const sanitizeElement = (el) => {
  if (!el || typeof el !== 'object') return null;

  return {
    id: el.id,
    type: el.type,
    name: el.name || '',
    description: el.description || '',
    technology: el.technology || '',
    tags: Array.isArray(el.tags) ? el.tags : [],
    position: el.position && typeof el.position === 'object'
      ? { x: Number(el.position.x) || 0, y: Number(el.position.y) || 0 }
      : { x: 0, y: 0 },
    width: el.width ? Number(el.width) : undefined,
    height: el.height ? Number(el.height) : undefined,
  };
};

/**
 * Sanitize a relationship by extracting only safe, serializable properties
 */
const sanitizeRelationship = (rel) => {
  if (!rel || typeof rel !== 'object') return null;

  return {
    id: rel.id,
    from: rel.from,
    to: rel.to,
    description: rel.description || '',
    technology: rel.technology || '',
    arrowDirection: rel.arrowDirection || 'right',
    lineStyle: rel.lineStyle || 'solid',
    animated: Boolean(rel.animated),
  };
};

/**
 * Sanitize the entire model to remove any circular references or non-serializable data
 */
const sanitizeModel = (model) => {
  if (!model || typeof model !== 'object') return null;

  const sanitizeArray = (arr, sanitizer) => {
    if (!Array.isArray(arr)) return [];
    return arr.map(sanitizer).filter(item => item !== null);
  };

  return {
    metadata: model.metadata || { name: 'New C4 Model', version: '1.0', author: 'Solution Architect' },
    systems: sanitizeArray(model.systems, sanitizeElement),
    containers: sanitizeArray(model.containers, sanitizeElement),
    components: sanitizeArray(model.components, sanitizeElement),
    people: sanitizeArray(model.people, sanitizeElement),
    externalSystems: sanitizeArray(model.externalSystems, sanitizeElement),
    relationships: sanitizeArray(model.relationships, sanitizeRelationship),
  };
};

/**
 * Hook to auto-save and restore model from local storage
 */
export const useLocalStorage = () => {
  const { exportModel, importModel } = useStore();

  // Load from local storage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const rawModel = JSON.parse(savedData);
        // Sanitize the model to remove any circular references or corrupted data
        const model = sanitizeModel(rawModel);

        if (model) {
          const shouldRestore = window.confirm(
            'Found a previously saved model. Would you like to restore it?'
          );
          if (shouldRestore) {
            importModel(model);
            console.log('Model restored from local storage (sanitized)');
          }
        }
      } catch (error) {
        console.error('Error loading saved model:', error);
        console.warn('Clearing corrupted localStorage data');
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, [importModel]);

  // Auto-save to local storage periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const rawModel = exportModel();
      const model = sanitizeModel(rawModel);
      // Only save if there's actually data
      if (
        model.systems?.length > 0 ||
        model.containers?.length > 0 ||
        model.components?.length > 0 ||
        model.people?.length > 0 ||
        model.externalSystems?.length > 0
      ) {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(model));
          console.log('Model auto-saved to local storage');
        } catch (error) {
          console.error('Error saving model to localStorage:', error);
        }
      }
    }, AUTOSAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [exportModel]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const rawModel = exportModel();
      const model = sanitizeModel(rawModel);
      if (
        model.systems?.length > 0 ||
        model.containers?.length > 0 ||
        model.components?.length > 0 ||
        model.people?.length > 0 ||
        model.externalSystems?.length > 0
      ) {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(model));
        } catch (error) {
          console.error('Error saving model on unload:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [exportModel]);
};

export const clearLocalStorage = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
};
