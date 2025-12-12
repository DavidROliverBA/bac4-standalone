import { Server, Box, Component, User, ExternalLink } from 'lucide-react';
import useStore from '../store';

const Toolbar = () => {
  const { addElement, currentLevel } = useStore();

  const tools = [
    {
      type: 'system',
      icon: Server,
      label: 'Software System',
      color: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
      visibleAtLevels: ['context', 'container'],
    },
    {
      type: 'container',
      icon: Box,
      label: 'Container',
      color: 'bg-green-100 hover:bg-green-200 text-green-700',
      visibleAtLevels: ['container', 'component'],
    },
    {
      type: 'component',
      icon: Component,
      label: 'Component',
      color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700',
      visibleAtLevels: ['component', 'code'],
    },
    {
      type: 'person',
      icon: User,
      label: 'Person',
      color: 'bg-purple-100 hover:bg-purple-200 text-purple-700',
      visibleAtLevels: ['context', 'container', 'component'],
    },
    {
      type: 'externalSystem',
      icon: ExternalLink,
      label: 'External System',
      color: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
      visibleAtLevels: ['context', 'container'],
    },
  ];

  // Filter tools based on current C4 level
  const visibleTools = tools.filter((tool) =>
    tool.visibleAtLevels.includes(currentLevel)
  );

  const onDragStart = (event, type) => {
    event.dataTransfer.setData('application/c4-element-type', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Get level display name
  const getLevelLabel = () => {
    const labels = {
      context: 'Context',
      container: 'Container',
      component: 'Component',
      code: 'Code',
    };
    return labels[currentLevel] || currentLevel;
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
        Add Elements
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        {getLevelLabel()} Level
      </p>

      <div className="space-y-2">
        {visibleTools.length > 0 ? (
          visibleTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.type}
                draggable
                onDragStart={(e) => onDragStart(e, tool.type)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-colors cursor-grab active:cursor-grabbing ${tool.color}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{tool.label}</span>
              </div>
            );
          })
        ) : (
          <div className="text-sm text-gray-500 text-center py-4">
            No elements can be added at this level
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-xs font-semibold text-blue-900 uppercase mb-2">
          Quick Tips
        </h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Drag elements to canvas to add</li>
          <li>• Click elements to edit properties</li>
          <li>• Drag between elements to create relationships</li>
          <li>• Use mouse wheel to zoom</li>
        </ul>
      </div>
    </aside>
  );
};

export default Toolbar;
