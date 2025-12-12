import { Page, Locator } from '@playwright/test';

/**
 * Canvas-specific helper utilities
 */

export interface NodeInfo {
  index: number;
  id: string | null;
  type: string;
  label: string;
  position: { x: number; y: number };
  isSelected: boolean;
}

export interface EdgeInfo {
  index: number;
  id: string | null;
  label: string;
  style: 'solid' | 'dashed' | 'dotted';
  hasSourceArrow: boolean;
  hasTargetArrow: boolean;
}

/**
 * Get detailed information about a node
 */
export async function getNodeInfo(page: Page, nodeIndex: number): Promise<NodeInfo> {
  const node = page.locator('.react-flow__node').nth(nodeIndex);
  const box = await node.boundingBox();
  const classes = await node.getAttribute('class') || '';
  const dataId = await node.getAttribute('data-id');

  // Extract label
  const labelElement = node.locator('.font-bold, .font-semibold').first();
  const label = await labelElement.textContent() || '';

  // Determine type from CSS classes
  let type = 'unknown';
  if (classes.includes('bg-blue')) type = 'system';
  else if (classes.includes('bg-green')) type = 'container';
  else if (classes.includes('bg-yellow')) type = 'component';
  else if (classes.includes('bg-purple')) type = 'person';
  else if (classes.includes('bg-gray')) type = 'externalSystem';

  // Check if selected
  const isSelected = classes.includes('ring-4') || classes.includes('ring-blue');

  return {
    index: nodeIndex,
    id: dataId,
    type,
    label: label.trim(),
    position: {
      x: box?.x || 0,
      y: box?.y || 0,
    },
    isSelected,
  };
}

/**
 * Get information about all nodes
 */
export async function getAllNodesInfo(page: Page): Promise<NodeInfo[]> {
  const nodes = page.locator('.react-flow__node');
  const count = await nodes.count();
  const result: NodeInfo[] = [];

  for (let i = 0; i < count; i++) {
    result.push(await getNodeInfo(page, i));
  }

  return result;
}

/**
 * Get detailed information about an edge
 */
export async function getEdgeInfo(page: Page, edgeIndex: number): Promise<EdgeInfo> {
  const edge = page.locator('.react-flow__edge').nth(edgeIndex);
  const dataId = await edge.getAttribute('data-id');

  // Get label
  const labelElement = edge.locator('.react-flow__edge-text, .react-flow__edge-textbg');
  const label = await labelElement.first().textContent() || '';

  // Get style from path
  const path = edge.locator('path').first();
  const pathStyle = await path.getAttribute('style') || '';

  let style: 'solid' | 'dashed' | 'dotted' = 'solid';
  if (pathStyle.includes('stroke-dasharray: 5') || pathStyle.includes('stroke-dasharray:5')) {
    style = 'dashed';
  } else if (pathStyle.includes('stroke-dasharray: 2') || pathStyle.includes('stroke-dasharray:2')) {
    style = 'dotted';
  }

  // Check for arrows (markers)
  const markerStart = await edge.locator('path[marker-start]').count();
  const markerEnd = await edge.locator('path[marker-end]').count();

  return {
    index: edgeIndex,
    id: dataId,
    label: label.trim(),
    style,
    hasSourceArrow: markerStart > 0,
    hasTargetArrow: markerEnd > 0,
  };
}

/**
 * Get information about all edges
 */
export async function getAllEdgesInfo(page: Page): Promise<EdgeInfo[]> {
  const edges = page.locator('.react-flow__edge');
  const count = await edges.count();
  const result: EdgeInfo[] = [];

  for (let i = 0; i < count; i++) {
    result.push(await getEdgeInfo(page, i));
  }

  return result;
}

/**
 * Zoom the canvas using mouse wheel
 */
export async function zoomCanvas(page: Page, delta: number): Promise<void> {
  const canvas = page.locator('.react-flow');
  await canvas.hover();
  await page.mouse.wheel(0, delta);
  await page.waitForTimeout(300);
}

/**
 * Pan the canvas by dragging
 */
export async function panCanvas(
  page: Page,
  deltaX: number,
  deltaY: number
): Promise<void> {
  const canvas = page.locator('.react-flow');
  const box = await canvas.boundingBox();

  if (box) {
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + deltaX, startY + deltaY, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(200);
  }
}

/**
 * Get the current viewport transform
 */
export async function getViewportTransform(page: Page): Promise<{
  x: number;
  y: number;
  zoom: number;
} | null> {
  const viewport = page.locator('.react-flow__viewport');
  const style = await viewport.getAttribute('style');

  if (!style) return null;

  // Parse transform: translate(Xpx, Ypx) scale(Z)
  const translateMatch = style.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
  const scaleMatch = style.match(/scale\(([-\d.]+)\)/);

  if (translateMatch && scaleMatch) {
    return {
      x: parseFloat(translateMatch[1]),
      y: parseFloat(translateMatch[2]),
      zoom: parseFloat(scaleMatch[1]),
    };
  }

  return null;
}

/**
 * Find a node by its label text
 */
export async function findNodeByLabel(page: Page, label: string): Promise<Locator | null> {
  const nodes = page.locator('.react-flow__node');
  const count = await nodes.count();

  for (let i = 0; i < count; i++) {
    const node = nodes.nth(i);
    const text = await node.textContent();
    if (text?.includes(label)) {
      return node;
    }
  }

  return null;
}

/**
 * Get node handles for creating connections
 */
export function getNodeHandles(node: Locator): {
  top: Locator;
  bottom: Locator;
  left: Locator;
  right: Locator;
} {
  return {
    top: node.locator('.react-flow__handle-top, .react-flow__handle[data-handlepos="top"]').first(),
    bottom: node.locator('.react-flow__handle-bottom, .react-flow__handle[data-handlepos="bottom"]').first(),
    left: node.locator('.react-flow__handle-left, .react-flow__handle[data-handlepos="left"]').first(),
    right: node.locator('.react-flow__handle-right, .react-flow__handle[data-handlepos="right"]').first(),
  };
}

/**
 * Create an edge between specific handles
 */
export async function createEdgeBetweenHandles(
  page: Page,
  sourceNode: Locator,
  sourceHandle: 'top' | 'bottom' | 'left' | 'right',
  targetNode: Locator,
  targetHandle: 'top' | 'bottom' | 'left' | 'right'
): Promise<void> {
  const sourceHandles = getNodeHandles(sourceNode);
  const targetHandles = getNodeHandles(targetNode);

  await sourceHandles[sourceHandle].dragTo(targetHandles[targetHandle]);
  await page.waitForTimeout(200);
}

/**
 * Check if canvas is empty
 */
export async function isCanvasEmpty(page: Page): Promise<boolean> {
  const nodeCount = await page.locator('.react-flow__node').count();
  const edgeCount = await page.locator('.react-flow__edge').count();
  return nodeCount === 0 && edgeCount === 0;
}

/**
 * Get canvas bounding box
 */
export async function getCanvasBounds(page: Page): Promise<{
  x: number;
  y: number;
  width: number;
  height: number;
} | null> {
  const canvas = page.locator('.react-flow');
  return await canvas.boundingBox();
}
