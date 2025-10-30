import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import useStore from '../store';

const PropertiesPanel = () => {
  const {
    selectedElement,
    selectedEdge,
    setSelectedElement,
    setSelectedEdge,
    updateElement,
    deleteElement,
    updateRelationship,
    deleteRelationship
  } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    technology: '',
    tags: '',
  });

  const [edgeFormData, setEdgeFormData] = useState({
    description: '',
    technology: '',
    arrowDirection: 'right',
    lineStyle: 'solid',
  });

  useEffect(() => {
    if (selectedElement && selectedElement.id) {
      try {
        setFormData({
          name: selectedElement.name || '',
          description: selectedElement.description || '',
          technology: selectedElement.technology || '',
          tags: Array.isArray(selectedElement.tags) ? selectedElement.tags.join(', ') : '',
        });
      } catch (error) {
        console.error('[BAC4] Error setting formData for element:', error, selectedElement);
        // Set safe defaults on error
        setFormData({
          name: 'Error loading element',
          description: '',
          technology: '',
          tags: '',
        });
      }
    }
  }, [selectedElement?.id]); // Only reset form when element ID changes, not when element data changes

  useEffect(() => {
    if (selectedEdge && selectedEdge.id) {
      try {
        setEdgeFormData({
          description: selectedEdge.description || '',
          technology: selectedEdge.technology || '',
          arrowDirection: selectedEdge.arrowDirection || 'right',
          lineStyle: selectedEdge.lineStyle || 'solid',
        });
      } catch (error) {
        console.error('[BAC4] Error setting edgeFormData:', error, selectedEdge);
        // Set safe defaults on error
        setEdgeFormData({
          description: 'Error loading relationship',
          technology: '',
          arrowDirection: 'right',
          lineStyle: 'solid',
        });
      }
    }
  }, [selectedEdge?.id]); // Only reset form when edge ID changes, not when edge data changes

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdgeInputChange = (field, value) => {
    setEdgeFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (selectedElement) {
      const updates = {
        name: formData.name,
        description: formData.description,
        technology: formData.technology,
        tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      };
      updateElement(selectedElement.type, selectedElement.id, updates);
    }
  };

  const handleEdgeSave = () => {
    if (selectedEdge) {
      updateRelationship(selectedEdge.id, edgeFormData);
    }
  };

  const handleEdgeSelectChange = (field, value) => {
    // Update state
    const newFormData = { ...edgeFormData, [field]: value };
    setEdgeFormData(newFormData);
    // Save immediately with the new data
    if (selectedEdge) {
      updateRelationship(selectedEdge.id, newFormData);
    }
  };

  const handleDelete = () => {
    if (selectedElement && window.confirm('Are you sure you want to delete this element?')) {
      deleteElement(selectedElement.type, selectedElement.id);
      setSelectedElement(null);
    }
  };

  const handleEdgeDelete = () => {
    if (selectedEdge && window.confirm('Are you sure you want to delete this relationship?')) {
      deleteRelationship(selectedEdge.id);
      setSelectedEdge(null);
    }
  };

  // Show edge properties if edge is selected (and element is not selected)
  // This handles race conditions where both might be set temporarily
  if (selectedEdge && !selectedElement) {
    return (
      <aside className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Relationship Properties
          </h2>
          <button
            onClick={() => setSelectedEdge(null)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Relationship ID */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              ID
            </label>
            <div className="px-3 py-2 bg-gray-100 rounded text-xs text-gray-600 font-mono break-all">
              {selectedEdge.id}
            </div>
          </div>

          {/* Description/Label */}
          <div>
            <label htmlFor="edge-description" className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Description
            </label>
            <input
              id="edge-description"
              type="text"
              value={edgeFormData.description}
              onChange={(e) => handleEdgeInputChange('description', e.target.value)}
              onBlur={handleEdgeSave}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Makes API calls to"
            />
          </div>

          {/* Technology */}
          <div>
            <label htmlFor="edge-technology" className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Technology/Protocol
            </label>
            <input
              id="edge-technology"
              type="text"
              value={edgeFormData.technology}
              onChange={(e) => handleEdgeInputChange('technology', e.target.value)}
              onBlur={handleEdgeSave}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., REST/HTTPS, gRPC"
            />
          </div>

          {/* Arrow Direction */}
          <div>
            <label htmlFor="arrow-direction" className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Arrow Direction
            </label>
            <select
              id="arrow-direction"
              value={edgeFormData.arrowDirection}
              onChange={(e) => handleEdgeSelectChange('arrowDirection', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="right">Right →</option>
              <option value="left">Left ←</option>
              <option value="both">Both ↔</option>
              <option value="none">None —</option>
            </select>
          </div>

          {/* Line Style */}
          <div>
            <label htmlFor="line-style" className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Line Style
            </label>
            <select
              id="line-style"
              value={edgeFormData.lineStyle}
              onChange={(e) => handleEdgeSelectChange('lineStyle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="solid">Solid ————</option>
              <option value="dashed">Dashed — — —</option>
              <option value="dotted">Dotted · · · ·</option>
            </select>
          </div>

          {/* Delete Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleEdgeDelete}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Relationship
            </button>
          </div>
        </div>
      </aside>
    );
  }

  if (!selectedElement) {
    return (
      <aside className="w-80 bg-white border-l border-gray-200 p-4">
        <div className="text-center text-gray-500 mt-8">
          <p className="text-sm">Select an element to view and edit its properties</p>
        </div>
      </aside>
    );
  }

  // Validate selectedElement has minimum required properties
  if (!selectedElement.id || !selectedElement.type) {
    console.error('[BAC4] Invalid selectedElement:', selectedElement);
    return (
      <aside className="w-80 bg-white border-l border-gray-200 p-4">
        <div className="text-center text-red-500 mt-8">
          <p className="text-sm">Error: Invalid element data</p>
          <button
            onClick={() => setSelectedElement(null)}
            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Clear Selection
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Properties
        </h2>
        <button
          onClick={() => setSelectedElement(null)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Element Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            Type
          </label>
          <div className="px-3 py-2 bg-gray-100 rounded text-sm text-gray-700">
            {selectedElement.type || 'Unknown'}
          </div>
        </div>

        {/* Element ID */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            ID
          </label>
          <div className="px-3 py-2 bg-gray-100 rounded text-xs text-gray-600 font-mono break-all">
            {selectedElement.id}
          </div>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            onBlur={handleSave}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter element name"
          />
        </div>

        {/* Technology */}
        <div>
          <label htmlFor="technology" className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            Technology
          </label>
          <input
            id="technology"
            type="text"
            value={formData.technology}
            onChange={(e) => handleInputChange('technology', e.target.value)}
            onBlur={handleSave}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Spring Boot, React, PostgreSQL"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            onBlur={handleSave}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the element's purpose and responsibilities"
          />
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            Tags
          </label>
          <input
            id="tags"
            type="text"
            value={formData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            onBlur={handleSave}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="tag1, tag2, tag3"
          />
          <p className="text-xs text-gray-500 mt-1">Comma-separated values</p>
        </div>

        {/* Position */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            Position
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs text-gray-500">X:</span>
              <div className="px-3 py-2 bg-gray-100 rounded text-sm text-gray-700">
                {Math.round(selectedElement.position?.x || 0)}
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-500">Y:</span>
              <div className="px-3 py-2 bg-gray-100 rounded text-sm text-gray-700">
                {Math.round(selectedElement.position?.y || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Element
          </button>
        </div>
      </div>
    </aside>
  );
};

export default PropertiesPanel;
