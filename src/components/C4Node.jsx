import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { User, Box, Component, Server, ExternalLink } from 'lucide-react';

const C4Node = ({ data, selected }) => {
  const getNodeStyle = () => {
    const baseStyle = 'px-4 py-3 rounded-lg border-2 min-w-[200px] shadow-lg transition-all';

    switch (data.type) {
      case 'system':
        return `${baseStyle} bg-blue-100 border-blue-500 hover:bg-blue-200`;
      case 'container':
        return `${baseStyle} bg-green-100 border-green-500 hover:bg-green-200`;
      case 'component':
        return `${baseStyle} bg-yellow-100 border-yellow-500 hover:bg-yellow-200`;
      case 'person':
        return `${baseStyle} bg-purple-100 border-purple-500 hover:bg-purple-200`;
      case 'externalSystem':
        return `${baseStyle} bg-gray-100 border-gray-500 hover:bg-gray-200`;
      default:
        return `${baseStyle} bg-white border-gray-300`;
    }
  };

  const getIcon = () => {
    const iconClass = 'w-5 h-5';
    switch (data.type) {
      case 'system':
        return <Server className={iconClass} />;
      case 'container':
        return <Box className={iconClass} />;
      case 'component':
        return <Component className={iconClass} />;
      case 'person':
        return <User className={iconClass} />;
      case 'externalSystem':
        return <ExternalLink className={iconClass} />;
      default:
        return <Box className={iconClass} />;
    }
  };

  const getTypeLabel = () => {
    switch (data.type) {
      case 'system':
        return 'Software System';
      case 'container':
        return 'Container';
      case 'component':
        return 'Component';
      case 'person':
        return 'Person';
      case 'externalSystem':
        return 'External System';
      default:
        return data.type;
    }
  };

  return (
    <div className={`${getNodeStyle()} ${selected ? 'ring-4 ring-blue-400' : ''}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex items-start gap-2">
        <div className="mt-1">{getIcon()}</div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
            {getTypeLabel()}
          </div>
          <div className="font-bold text-gray-900 mb-1">
            {data.label || data.name || 'Unnamed'}
          </div>
          {data.technology && (
            <div className="text-xs text-gray-600 italic mb-1">
              [{data.technology}]
            </div>
          )}
          {data.description && (
            <div className="text-xs text-gray-700 mt-2">
              {data.description}
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
    </div>
  );
};

export default memo(C4Node);
