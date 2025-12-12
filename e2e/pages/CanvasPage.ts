import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface NodeInfo {
  index: number;
  label: string;
  isSelected: boolean;
}

export interface EdgeInfo {
  index: number;
  label: string;
}

/**
 * Page object for the Canvas/ReactFlow component
 * Handles: node/edge interactions, pan/zoom, selection
 */
export class CanvasPage extends BasePage {
  readonly canvas: Locator;
  readonly viewport: Locator;
  readonly nodes: Locator;
  readonly edges: Locator;
  readonly edgeLabels: Locator;
  readonly minimap: Locator;
  readonly controls: Locator;
  readonly zoomInButton: Locator;
  readonly zoomOutButton: Locator;
  readonly fitViewButton: Locator;
  readonly lockButton: Locator;
  readonly background: Locator;

  constructor(page: Page) {
    super(page);

    this.canvas = page.locator('.react-flow');
    this.viewport = page.locator('.react-flow__viewport');
    this.nodes = page.locator('.react-flow__node');
    this.edges = page.locator('.react-flow__edge');
    this.edgeLabels = page.locator('.react-flow__edge-text');
    this.minimap = page.locator('.react-flow__minimap');
    this.controls = page.locator('.react-flow__controls');
    this.zoomInButton = page.locator('.react-flow__controls-zoomin');
    this.zoomOutButton = page.locator('.react-flow__controls-zoomout');
    this.fitViewButton = page.locator('.react-flow__controls-fitview');
    this.lockButton = page.locator('.react-flow__controls-interactive');
    this.background = page.locator('.react-flow__background');
  }

  // ==================== Node Methods ====================

  /**
   * Get the number of nodes on canvas
   */
  async getNodeCount(): Promise<number> {
    return await this.nodes.count();
  }

  /**
   * Get a specific node by index
   */
  getNode(index: number): Locator {
    return this.nodes.nth(index);
  }

  /**
   * Get a node by its label/name
   */
  getNodeByLabel(label: string): Locator {
    return this.nodes.filter({ hasText: label });
  }

  /**
   * Select a node by clicking on it
   */
  async selectNode(index: number): Promise<void> {
    await this.getNode(index).click();
    await this.wait(100);
  }

  /**
   * Check if a node is selected
   */
  async isNodeSelected(index: number): Promise<boolean> {
    const node = this.getNode(index);
    // Check for selection ring on the inner div
    const innerDiv = node.locator('div').first();
    const classes = await innerDiv.getAttribute('class');
    return classes?.includes('ring-4') || classes?.includes('ring-blue') || false;
  }

  /**
   * Drag a node to a new position
   */
  async dragNode(nodeIndex: number, targetX: number, targetY: number): Promise<void> {
    const node = this.getNode(nodeIndex);
    await node.dragTo(this.canvas, { targetPosition: { x: targetX, y: targetY } });
    await this.wait(200);
  }

  /**
   * Get all node labels
   */
  async getAllNodeLabels(): Promise<string[]> {
    const count = await this.getNodeCount();
    const labels: string[] = [];
    for (let i = 0; i < count; i++) {
      const node = this.getNode(i);
      const label = await node.locator('.font-bold, .font-semibold').first().textContent();
      labels.push(label || '');
    }
    return labels;
  }

  // ==================== Edge Methods ====================

  /**
   * Get the number of edges on canvas
   */
  async getEdgeCount(): Promise<number> {
    return await this.edges.count();
  }

  /**
   * Get a specific edge by index
   */
  getEdge(index: number): Locator {
    return this.edges.nth(index);
  }

  /**
   * Select an edge by clicking on it
   */
  async selectEdge(index: number): Promise<void> {
    // Click on the edge path or label
    const edge = this.getEdge(index);
    await edge.click();
    await this.wait(100);
  }

  /**
   * Create an edge between two nodes by dragging from handle to handle
   */
  async createEdge(sourceNodeIndex: number, targetNodeIndex: number): Promise<void> {
    const sourceNode = this.getNode(sourceNodeIndex);
    const targetNode = this.getNode(targetNodeIndex);

    // Get source handle (bottom or right)
    let sourceHandle = sourceNode.locator('.react-flow__handle[data-handlepos="bottom"]').first();
    let targetHandle = targetNode.locator('.react-flow__handle[data-handlepos="top"]').first();

    let sourceBox = await sourceHandle.boundingBox();
    let targetBox = await targetHandle.boundingBox();

    // If vertical handles don't have bounding boxes, try horizontal
    if (!sourceBox || !targetBox) {
      sourceHandle = sourceNode.locator('.react-flow__handle[data-handlepos="right"]').first();
      targetHandle = targetNode.locator('.react-flow__handle[data-handlepos="left"]').first();
      sourceBox = await sourceHandle.boundingBox();
      targetBox = await targetHandle.boundingBox();
    }

    if (!sourceBox || !targetBox) {
      throw new Error('Could not find handles for edge creation');
    }

    // Use manual mouse events for more reliable drag
    const sourceX = sourceBox.x + sourceBox.width / 2;
    const sourceY = sourceBox.y + sourceBox.height / 2;
    const targetX = targetBox.x + targetBox.width / 2;
    const targetY = targetBox.y + targetBox.height / 2;

    await this.page.mouse.move(sourceX, sourceY);
    await this.page.mouse.down();
    await this.page.mouse.move(targetX, targetY, { steps: 20 });
    await this.page.mouse.up();
    await this.wait(300);
  }

  /**
   * Get edge label by index
   */
  async getEdgeLabel(index: number): Promise<string> {
    const label = this.edgeLabels.nth(index);
    return await label.textContent() || '';
  }

  // ==================== Selection Methods ====================

  /**
   * Deselect all elements by clicking on empty canvas
   */
  async deselectAll(): Promise<void> {
    // Click on background area
    const box = await this.canvas.boundingBox();
    if (box) {
      await this.page.mouse.click(box.x + 50, box.y + 50);
    }
    await this.wait(100);
  }

  // ==================== Pan/Zoom Methods ====================

  /**
   * Zoom in using controls
   */
  async zoomIn(times: number = 1): Promise<void> {
    for (let i = 0; i < times; i++) {
      await this.zoomInButton.click();
      await this.wait(100);
    }
  }

  /**
   * Zoom out using controls
   */
  async zoomOut(times: number = 1): Promise<void> {
    for (let i = 0; i < times; i++) {
      await this.zoomOutButton.click();
      await this.wait(100);
    }
  }

  /**
   * Fit view to show all elements
   */
  async fitView(): Promise<void> {
    await this.fitViewButton.click();
    await this.wait(300);
  }

  /**
   * Zoom with mouse wheel
   */
  async zoomWithWheel(delta: number): Promise<void> {
    await this.canvas.hover();
    await this.page.mouse.wheel(0, delta);
    await this.wait(300);
  }

  /**
   * Pan the canvas by dragging
   */
  async pan(deltaX: number, deltaY: number): Promise<void> {
    const box = await this.canvas.boundingBox();
    if (box) {
      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;

      await this.page.mouse.move(startX, startY);
      await this.page.mouse.down();
      await this.page.mouse.move(startX + deltaX, startY + deltaY, { steps: 10 });
      await this.page.mouse.up();
      await this.wait(200);
    }
  }

  /**
   * Get current viewport transform
   */
  async getViewportTransform(): Promise<string | null> {
    return await this.viewport.getAttribute('style');
  }

  // ==================== Minimap Methods ====================

  /**
   * Check if minimap is visible
   */
  async isMinimapVisible(): Promise<boolean> {
    return await this.minimap.isVisible();
  }

  // ==================== Controls Methods ====================

  /**
   * Check if controls are visible
   */
  async areControlsVisible(): Promise<boolean> {
    return await this.controls.isVisible();
  }

  /**
   * Toggle interactive mode
   */
  async toggleInteractiveMode(): Promise<void> {
    await this.lockButton.click();
  }

  // ==================== Utility Methods ====================

  /**
   * Wait for canvas to stabilize after operations
   */
  async waitForStability(): Promise<void> {
    await this.wait(500);
  }

  /**
   * Check if canvas is empty
   */
  async isEmpty(): Promise<boolean> {
    const nodeCount = await this.getNodeCount();
    const edgeCount = await this.getEdgeCount();
    return nodeCount === 0 && edgeCount === 0;
  }
}
