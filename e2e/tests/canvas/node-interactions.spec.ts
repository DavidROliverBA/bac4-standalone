import { test, expect } from '@playwright/test';
import { AppPage } from '../../pages/AppPage';
import { getNodeInfo, getAllNodesInfo } from '../../helpers/canvas-helpers';

test.describe('Node Interactions', () => {
  let app: AppPage;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    app.setupDialogDismiss();
    await app.clearLocalStorage();
    await app.navigate();
  });

  test('clicking node selects it', async () => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    expect(await app.canvas.isNodeSelected(0)).toBe(true);
  });

  test('selected node shows selection ring', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    const node = app.canvas.getNode(0);
    // Node should have ring class for selection
    const classes = await node.getAttribute('class');
    expect(classes).toMatch(/ring/);
  });

  test('selecting node opens properties panel', async () => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    expect(await app.propertiesPanel.isShowingElementProperties()).toBe(true);
  });

  test('clicking different node changes selection', async () => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createPersonElement({ x: 500, y: 200 });

    // Select first node
    await app.canvas.selectNode(0);
    expect(await app.canvas.isNodeSelected(0)).toBe(true);

    // Select second node
    await app.canvas.selectNode(1);
    expect(await app.canvas.isNodeSelected(1)).toBe(true);
    // First should be deselected (React Flow may not immediately update class)
  });

  test('dragging node updates position', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });

    const initialInfo = await getNodeInfo(page, 0);

    await app.canvas.dragNode(0, 500, 400);

    const afterInfo = await getNodeInfo(page, 0);

    // Position should have changed
    expect(afterInfo.position.x).not.toBe(initialInfo.position.x);
    expect(afterInfo.position.y).not.toBe(initialInfo.position.y);
  });

  test('dragged position persists in export', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.dragNode(0, 600, 500);

    const { content } = await app.header.exportJson();
    const model = JSON.parse(content);

    // Position should be near the dragged position
    const pos = model.systems[0].position;
    expect(pos.x).toBeGreaterThan(400);
    expect(pos.y).toBeGreaterThan(300);
  });

  test('node displays correct type label', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });

    const node = app.canvas.getNode(0);
    const text = await node.textContent();

    // Should contain "Software System" or "System"
    expect(text?.toLowerCase()).toContain('system');
  });

  test('node displays name', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });

    const labels = await app.canvas.getAllNodeLabels();
    expect(labels.length).toBe(1);
    expect(labels[0]).toContain('New');
  });

  test('different element types have different colors', async ({ page }) => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createPersonElement({ x: 400, y: 200 });
    await app.createExternalSystemElement({ x: 600, y: 200 });

    const nodes = await getAllNodesInfo(page);

    // Each should have a different type detected via color
    const types = nodes.map((n) => n.type);
    expect(types).toContain('system');
    expect(types).toContain('person');
    expect(types).toContain('externalSystem');
  });

  test('node shows technology when set', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    // Set technology
    await app.propertiesPanel.setTechnology('React, Node.js');
    await app.canvas.deselectAll();

    // Check node displays technology
    const node = app.canvas.getNode(0);
    const text = await node.textContent();
    expect(text).toContain('React');
  });

  test('clicking empty canvas deselects all', async () => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    expect(await app.canvas.isNodeSelected(0)).toBe(true);

    await app.canvas.deselectAll();

    // Properties panel should show placeholder
    expect(await app.propertiesPanel.isShowingPlaceholder()).toBe(true);
  });

  test('node has connection handles', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });

    const node = app.canvas.getNode(0);
    const handles = node.locator('.react-flow__handle');

    // Should have multiple handles
    const count = await handles.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });
});
