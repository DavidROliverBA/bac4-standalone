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
    selectedElement,
    currentLevel,
  } = useStore();

  // Subscribe to store changes for triggering updates
  const storeElements = useStore((state) => ({
    systems: state.systems,
    containers: state.containers,
    components: state.components,
    people: state.people,
    externalSystems: state.externalSystems,
  }));

  const getVisibleElements = useStore((state) => state.getVisibleElements);

  // Enable local storage auto-save
  useLocalStorage();

  // Update nodes and edges when store changes
  useEffect(() => {
    const elements = getVisibleElements();
    const newNodes = elements.map((el) => ({
      id: el.id,
      type: 'c4Node',
      position: el.position || { x: Math.random() * 400, y: Math.random() * 300 },
      data: {
        ...el,
        label: el.name,
      },
    }));
    setNodes(newNodes);
  }, [storeElements, currentLevel, getVisibleElements, setNodes]);

  useEffect(() => {
    const newEdges = relationships.map((rel) => ({
      id: rel.id,
      source: rel.from,
      target: rel.to,
      label: rel.description || '',
      type: 'smoothstep',
      animated: rel.animated || false,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: {
        stroke: '#64748b',
        strokeWidth: 2,
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
    }));
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

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedElement(null);
  }, [setSelectedElement]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Toolbar />

        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            onNodeClick={onNodeClick}
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
