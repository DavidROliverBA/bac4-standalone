import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import useStore from './store';
import C4Node from './components/C4Node';
import Toolbar from './components/Toolbar';
import PropertiesPanel from './components/PropertiesPanel';
import Header from './components/Header';
import { useLocalStorage } from './hooks/useLocalStorage';

const nodeTypes = {
  c4Node: C4Node,
};

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const {
    getAllElements,
    relationships,
    updateElement,
    setSelectedElement,
    setSelectedEdge,
    selectedElement,
    currentLevel,
  } = useStore();

  // Custom handler to intercept dimension changes
  const handleNodesChange = useCallback((changes) => {
    // Apply changes to React Flow
    onNodesChange(changes);

    // Check for dimension changes and save to store
    changes.forEach((change) => {
      if (change.type === 'dimensions' && change.dimensions) {
        const element = getAllElements().find((el) => el.id === change.id);
        if (element && element.type === 'annotation') {
          updateElement(element.type, element.id, {
            width: change.dimensions.width,
            height: change.dimensions.height,
          });
        }
      }
    });
  }, [onNodesChange, getAllElements, updateElement]);

  // Subscribe to individual store arrays to trigger re-renders
  const systems = useStore((state) => state.systems);
  const containers = useStore((state) => state.containers);
  const components = useStore((state) => state.components);
  const people = useStore((state) => state.people);
  const externalSystems = useStore((state) => state.externalSystems);
  const annotations = useStore((state) => state.annotations);
  const getVisibleElements = useStore((state) => state.getVisibleElements);

  // Enable local storage auto-save
  useLocalStorage();

  // Update nodes and edges when store changes
  useEffect(() => {
    const elements = getVisibleElements();
    const newNodes = elements.map((el) => {
      const node = {
        id: el.id,
        type: 'c4Node',
        position: el.position || { x: Math.random() * 400, y: Math.random() * 300 },
        data: {
          ...el,
          label: el.name,
        },
      };

      // For annotations, include stored dimensions if they exist
      if (el.type === 'annotation' && (el.width || el.height)) {
        node.style = {
          width: el.width,
          height: el.height,
        };
      }

      return node;
    });
    setNodes(newNodes);
  }, [systems, containers, components, people, externalSystems, annotations, currentLevel, getVisibleElements, setNodes]);

  useEffect(() => {
    const newEdges = relationships.map((rel) => {
      // Determine arrow markers based on arrowDirection
      const arrowDirection = rel.arrowDirection || 'right';
      let markerStart = undefined;
      let markerEnd = undefined;

      if (arrowDirection === 'left' || arrowDirection === 'both') {
        markerStart = { type: MarkerType.ArrowClosed };
      }
      if (arrowDirection === 'right' || arrowDirection === 'both') {
        markerEnd = { type: MarkerType.ArrowClosed };
      }

      // Determine line style based on lineStyle
      const lineStyle = rel.lineStyle || 'solid';
      let strokeDasharray = undefined;
      if (lineStyle === 'dashed') {
        strokeDasharray = '5,5';
      } else if (lineStyle === 'dotted') {
        strokeDasharray = '2,2';
      }

      return {
        id: rel.id,
        source: rel.from,
        target: rel.to,
        label: rel.description || '',
        type: 'smoothstep',
        animated: rel.animated || false,
        markerStart,
        markerEnd,
        style: {
          stroke: '#64748b',
          strokeWidth: 2,
          strokeDasharray,
        },
        labelStyle: {
          fill: '#334155',
          fontSize: 12,
          fontWeight: 500,
        },
        labelBgStyle: {
          fill: '#f8fafc',
          fillOpacity: 0.9,
        },
      };
    });
    setEdges(newEdges);
  }, [relationships, setEdges]);

  // Handle node drag
  const onNodeDragStop = useCallback(
    (event, node) => {
      const element = getAllElements().find((el) => el.id === node.id);
      if (element) {
        updateElement(element.type, element.id, { position: node.position });
      }
    },
    [getAllElements, updateElement]
  );

  // Handle edge connection
  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));

      // Add to store
      const { source, target } = params;
      useStore.getState().addRelationship({
        from: source,
        to: target,
        description: 'New relationship',
        technology: '',
      });
    },
    [setEdges]
  );

  // Handle node click
  const onNodeClick = useCallback(
    (event, node) => {
      const element = getAllElements().find((el) => el.id === node.id);
      setSelectedElement(element);
    },
    [getAllElements, setSelectedElement]
  );

  // Handle edge click
  const onEdgeClick = useCallback(
    (event, edge) => {
      const relationship = relationships.find((rel) => rel.id === edge.id);
      setSelectedEdge(relationship);
    },
    [relationships, setSelectedEdge]
  );

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedElement(null);
    setSelectedEdge(null);
  }, [setSelectedElement, setSelectedEdge]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Toolbar />

        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-50"
          >
            <Background color="#cbd5e1" gap={16} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                switch (node.data.type) {
                  case 'system':
                    return '#3b82f6';
                  case 'container':
                    return '#22c55e';
                  case 'component':
                    return '#eab308';
                  case 'person':
                    return '#a855f7';
                  case 'externalSystem':
                    return '#6b7280';
                  default:
                    return '#94a3b8';
                }
              }}
            />
          </ReactFlow>
        </div>

        <PropertiesPanel />
      </div>
    </div>
  );
}

export default App;
