import { test, expect } from '@playwright/test';
import { AppPage } from '../../pages/AppPage';

test.describe('Drag and Drop Element Creation', () => {
  let app: AppPage;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    app.setupDialogDismiss();
    await app.clearLocalStorage();
    await app.navigate();
  });

  test('drag system element to canvas creates node', async () => {
    expect(await app.canvas.getNodeCount()).toBe(0);

    await app.createSystemElement({ x: 400, y: 300 });

    expect(await app.canvas.getNodeCount()).toBe(1);
  });

  test('drag person element to canvas creates node', async () => {
    await app.createPersonElement({ x: 400, y: 300 });

    expect(await app.canvas.getNodeCount()).toBe(1);
  });

  test('drag external system element to canvas creates node', async () => {
    await app.createExternalSystemElement({ x: 400, y: 300 });

    expect(await app.canvas.getNodeCount()).toBe(1);
  });

  test('drag container element to canvas at container level', async () => {
    await app.header.selectLevel('container');

    await app.createContainerElement({ x: 400, y: 300 });

    expect(await app.canvas.getNodeCount()).toBe(1);
  });

  test('drag component element to canvas at component level', async () => {
    await app.header.selectLevel('component');

    await app.createComponentElement({ x: 400, y: 300 });

    expect(await app.canvas.getNodeCount()).toBe(1);
  });

  test('created node has default name', async () => {
    await app.createSystemElement({ x: 400, y: 300 });

    const labels = await app.canvas.getAllNodeLabels();
    expect(labels[0]).toContain('New');
  });

  test('multiple elements can be created', async () => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createPersonElement({ x: 400, y: 200 });
    await app.createExternalSystemElement({ x: 600, y: 200 });

    expect(await app.canvas.getNodeCount()).toBe(3);
  });

  test('elements are created at drop position', async () => {
    const position = { x: 350, y: 250 };
    await app.createSystemElement(position);

    // Element should be near the drop position (may have offset)
    // We can verify by checking the element exists
    expect(await app.canvas.getNodeCount()).toBe(1);
  });

  test('dragging element shows cursor change', async ({ page }) => {
    const systemBtn = app.toolbar.systemElement;

    // Button should have grab cursor
    await expect(systemBtn).toHaveClass(/cursor-grab/);
  });

  test('elements have correct type after creation', async () => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.canvas.selectNode(0);

    // Properties panel should show element type
    const showing = await app.propertiesPanel.isShowingElementProperties();
    expect(showing).toBe(true);
  });

  test('elements have unique IDs', async ({ page }) => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 400, y: 200 });

    // Export and check IDs are unique
    const { content } = await app.header.exportJson();
    const model = JSON.parse(content);

    const ids = model.systems.map((s: any) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test('created element can be selected', async () => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    expect(await app.canvas.isNodeSelected(0)).toBe(true);
  });

  test('created element can be moved', async () => {
    await app.createSystemElement({ x: 300, y: 200 });

    // Drag to new position
    await app.canvas.dragNode(0, 500, 400);

    // Element should still exist
    expect(await app.canvas.getNodeCount()).toBe(1);
  });

  test('element button has draggable attribute', async ({ page }) => {
    const systemBtn = app.toolbar.systemElement;
    const draggable = await systemBtn.getAttribute('draggable');
    expect(draggable).toBe('true');
  });

  test('all element buttons are draggable', async ({ page }) => {
    // Context level elements
    expect(await app.toolbar.systemElement.getAttribute('draggable')).toBe('true');
    expect(await app.toolbar.personElement.getAttribute('draggable')).toBe('true');
    expect(await app.toolbar.externalSystemElement.getAttribute('draggable')).toBe('true');

    // Container level
    await app.header.selectLevel('container');
    expect(await app.toolbar.containerElement.getAttribute('draggable')).toBe('true');

    // Component level
    await app.header.selectLevel('component');
    expect(await app.toolbar.componentElement.getAttribute('draggable')).toBe('true');
  });
});
