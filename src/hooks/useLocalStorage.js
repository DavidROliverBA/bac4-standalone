import { useEffect } from 'react';
import useStore from '../store';

const LOCAL_STORAGE_KEY = 'c4-model-autosave';
const AUTOSAVE_INTERVAL = 30000; // 30 seconds

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
        const model = JSON.parse(savedData);
        const shouldRestore = window.confirm(
          'Found a previously saved model. Would you like to restore it?'
        );
        if (shouldRestore) {
          importModel(model);
          console.log('Model restored from local storage');
        }
      } catch (error) {
        console.error('Error loading saved model:', error);
      }
    }
  }, [importModel]);

  // Auto-save to local storage periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const model = exportModel();
      // Only save if there's actually data
      if (
        model.systems?.length > 0 ||
        model.containers?.length > 0 ||
        model.components?.length > 0 ||
        model.people?.length > 0 ||
        model.externalSystems?.length > 0
      ) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(model));
        console.log('Model auto-saved to local storage');
      }
    }, AUTOSAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [exportModel]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const model = exportModel();
      if (
        model.systems?.length > 0 ||
        model.containers?.length > 0 ||
        model.components?.length > 0 ||
        model.people?.length > 0 ||
        model.externalSystems?.length > 0
      ) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(model));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [exportModel]);
};

export const clearLocalStorage = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
};
