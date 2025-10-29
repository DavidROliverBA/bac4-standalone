import { Server, Box, Component, User, ExternalLink, FileText } from 'lucide-react';
import useStore from '../store';
import { getTemplateNames, getTemplate } from '../data/templates';

const Toolbar = () => {
  const { addElement, importModel } = useStore();

  const handleLoadTemplate = (templateKey) => {
    if (window.confirm('Load this template? This will replace your current model.')) {
      const template = getTemplate(templateKey);
      importModel(template);
    }
  };

  const tools = [
    {
      type: 'system',
      icon: Server,
      label: 'Software System',
      color: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
    },
    {
      type: 'container',
      icon: Box,
      label: 'Container',
      color: 'bg-green-100 hover:bg-green-200 text-green-700',
    },
    {
      type: 'component',
      icon: Component,
      label: 'Component',
      color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700',
    },
    {
      type: 'person',
      icon: User,
      label: 'Person',
      color: 'bg-purple-100 hover:bg-purple-200 text-purple-700',
    },
    {
      type: 'externalSystem',
      icon: ExternalLink,
      label: 'External System',
      color: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    },
  ];

  const handleAddElement = (type) => {
    const element = {
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      description: '',
      technology: '',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
    };

    addElement(type, element);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
        Add Elements
      </h2>

      <div className="space-y-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.type}
              onClick={() => handleAddElement(tool.type)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-colors ${tool.color}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{tool.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Templates
        </h2>
        <div className="space-y-2">
          {getTemplateNames().map((template) => (
            <button
              key={template.key}
              onClick={() => handleLoadTemplate(template.key)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span className="truncate">{template.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-xs font-semibold text-blue-900 uppercase mb-2">
          Quick Tips
        </h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Click elements to edit properties</li>
          <li>• Drag between elements to create relationships</li>
          <li>• Use mouse wheel to zoom</li>
          <li>• Drag canvas to pan</li>
        </ul>
      </div>
    </aside>
  );
};

export default Toolbar;
