import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import useStore from '../store';

const PropertiesPanel = () => {
  const { selectedElement, setSelectedElement, updateElement, deleteElement } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    technology: '',
    tags: '',
  });

  useEffect(() => {
    if (selectedElement) {
      setFormData({
        name: selectedElement.name || '',
        description: selectedElement.description || '',
        technology: selectedElement.technology || '',
        tags: selectedElement.tags?.join(', ') || '',
      });
    }
  }, [selectedElement]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  const handleDelete = () => {
    if (selectedElement && window.confirm('Are you sure you want to delete this element?')) {
      deleteElement(selectedElement.type, selectedElement.id);
      setSelectedElement(null);
    }
  };

  if (!selectedElement) {
    return (
      <aside className="w-80 bg-white border-l border-gray-200 p-4">
        <div className="text-center text-gray-500 mt-8">
          <p className="text-sm">Select an element to view and edit its properties</p>
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
            {selectedElement.type}
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
