import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { HeaderPage } from './HeaderPage';
import { ToolbarPage, ElementType } from './ToolbarPage';
import { CanvasPage } from './CanvasPage';
import { PropertiesPanelPage } from './PropertiesPanelPage';

/**
 * Composite page object that combines all component pages
 * Provides high-level methods for common workflows
 */
export class AppPage extends BasePage {
  readonly header: HeaderPage;
  readonly toolbar: ToolbarPage;
  readonly canvas: CanvasPage;
  readonly propertiesPanel: PropertiesPanelPage;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderPage(page);
    this.toolbar = new ToolbarPage(page);
    this.canvas = new CanvasPage(page);
    this.propertiesPanel = new PropertiesPanelPage(page);
  }

  // ==================== High-Level Element Creation ====================

  /**
   * Create a Software System element at the specified position
   */
  async createSystemElement(position: { x: number; y: number }): Promise<void> {
    await this.toolbar.dragElementToCanvas('system', this.canvas.canvas, position);
  }

  /**
   * Create a Container element at the specified position
   */
  async createContainerElement(position: { x: number; y: number }): Promise<void> {
    await this.toolbar.dragElementToCanvas('container', this.canvas.canvas, position);
  }

  /**
   * Create a Component element at the specified position
   */
  async createComponentElement(position: { x: number; y: number }): Promise<void> {
    await this.toolbar.dragElementToCanvas('component', this.canvas.canvas, position);
  }

  /**
   * Create a Person element at the specified position
   */
  async createPersonElement(position: { x: number; y: number }): Promise<void> {
    await this.toolbar.dragElementToCanvas('person', this.canvas.canvas, position);
  }

  /**
   * Create an External System element at the specified position
   */
  async createExternalSystemElement(position: { x: number; y: number }): Promise<void> {
    await this.toolbar.dragElementToCanvas('externalSystem', this.canvas.canvas, position);
  }

  /**
   * Create an element of any type at the specified position
   */
  async createElement(type: ElementType, position: { x: number; y: number }): Promise<void> {
    await this.toolbar.dragElementToCanvas(type, this.canvas.canvas, position);
  }

  // ==================== High-Level Relationship Creation ====================

  /**
   * Connect two nodes with a relationship using JavaScript store injection
   * This is more reliable than drag operations for React Flow
   */
  async connectNodes(sourceIndex: number, targetIndex: number): Promise<void> {
    // Use JavaScript injection for reliability (React Flow drag is unreliable in Playwright)
    await this.connectNodesViaJS(sourceIndex, targetIndex);
  }

  /**
   * Connect nodes by getting IDs from DOM and calling the app's exposed createConnection
   */
  async connectNodesViaJS(sourceIndex: number, targetIndex: number): Promise<void> {
    // Get node IDs from the DOM
    const sourceId = await this.page.evaluate((idx) => {
      const nodes = document.querySelectorAll('.react-flow__node');
      const node = nodes[idx];
      return node?.getAttribute('data-id') || null;
    }, sourceIndex);

    const targetId = await this.page.evaluate((idx) => {
      const nodes = document.querySelectorAll('.react-flow__node');
      const node = nodes[idx];
      return node?.getAttribute('data-id') || null;
    }, targetIndex);

    if (!sourceId || !targetId) {
      console.warn(`Could not get node IDs: source=${sourceId}, target=${targetId}`);
      return;
    }

    // Call the exposed createConnection function
    const result = await this.page.evaluate(({ source, target }) => {
      const createConnection = (window as any).__CREATE_CONNECTION__;
      if (createConnection) {
        createConnection({ source, target });
        return { success: true, method: 'createConnection' };
      }
      return { success: false, error: '__CREATE_CONNECTION__ not found' };
    }, { source: sourceId, target: targetId });

    if (!result.success) {
      console.warn('connectNodesViaJS failed:', result.error);
    }

    await this.wait(500);
  }

  // ==================== High-Level Selection ====================

  /**
   * Select a node and verify properties panel opens
   */
  async selectNodeAndVerify(index: number): Promise<void> {
    await this.canvas.selectNode(index);
    await this.propertiesPanel.isShowingElementProperties();
  }

  /**
   * Select an edge and verify properties panel opens
   */
  async selectEdgeAndVerify(index: number): Promise<void> {
    await this.canvas.selectEdge(index);
    await this.propertiesPanel.isShowingRelationshipProperties();
  }

  // ==================== High-Level Workflows ====================

  /**
   * Create a simple context diagram with two connected systems
   */
  async createSimpleContextDiagram(): Promise<void> {
    await this.createPersonElement({ x: 200, y: 100 });
    await this.createSystemElement({ x: 400, y: 200 });
    await this.createExternalSystemElement({ x: 600, y: 300 });
    await this.connectNodes(0, 1);
    await this.connectNodes(1, 2);
    await this.canvas.fitView();
  }

  /**
   * Create a container diagram with multiple containers
   */
  async createContainerDiagram(): Promise<void> {
    this.setupDialogAccept();
    await this.header.selectLevel('container');
    await this.wait(300);

    await this.createSystemElement({ x: 400, y: 100 });
    await this.createContainerElement({ x: 200, y: 250 });
    await this.createContainerElement({ x: 400, y: 250 });
    await this.createContainerElement({ x: 600, y: 250 });
    await this.connectNodes(0, 1);
    await this.connectNodes(0, 2);
    await this.connectNodes(0, 3);
    await this.connectNodes(1, 2);
    await this.canvas.fitView();
  }

  /**
   * Clear canvas and start fresh
   */
  async clearAndReset(): Promise<void> {
    await this.clearLocalStorage();
    await this.page.reload();
    this.setupDialogDismiss();
    await this.waitForAppReady();
  }

  /**
   * Prepare for visual regression test (clear storage, reset, fit view)
   */
  async prepareForVisualTest(): Promise<void> {
    await this.clearAndReset();
    await this.canvas.fitView();
    await this.wait(500);
  }

  // ==================== Import/Export Workflows ====================

  /**
   * Export model as JSON and return the content
   */
  async exportAndGetJson(): Promise<{ filename: string; model: any }> {
    const result = await this.header.exportJson();
    return {
      filename: result.filename,
      model: JSON.parse(result.content),
    };
  }

  /**
   * Import a model from a file path
   */
  async importFromFile(filePath: string): Promise<void> {
    this.setupDialogAccept();
    await this.header.importFile(filePath);
    await this.wait(500);
  }

  // ==================== Verification Helpers ====================

  /**
   * Verify the canvas has the expected number of elements
   */
  async verifyElementCount(expectedNodes: number, expectedEdges: number = 0): Promise<void> {
    const nodeCount = await this.canvas.getNodeCount();
    const edgeCount = await this.canvas.getEdgeCount();

    if (nodeCount !== expectedNodes) {
      throw new Error(`Expected ${expectedNodes} nodes, but found ${nodeCount}`);
    }
    if (edgeCount !== expectedEdges) {
      throw new Error(`Expected ${expectedEdges} edges, but found ${edgeCount}`);
    }
  }

  /**
   * Verify the current C4 level
   */
  async verifyLevel(expectedLevel: string): Promise<void> {
    const currentLevel = await this.header.getCurrentLevel();
    if (currentLevel !== expectedLevel) {
      throw new Error(`Expected level ${expectedLevel}, but found ${currentLevel}`);
    }
  }

  /**
   * Get the application state for debugging
   */
  async getState(): Promise<{
    level: string;
    nodeCount: number;
    edgeCount: number;
    title: string;
  }> {
    return {
      level: await this.header.getCurrentLevel(),
      nodeCount: await this.canvas.getNodeCount(),
      edgeCount: await this.canvas.getEdgeCount(),
      title: await this.header.getTitle(),
    };
  }
}
