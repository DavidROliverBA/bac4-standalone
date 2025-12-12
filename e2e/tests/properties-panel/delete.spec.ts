import { test, expect } from '@playwright/test';
import { AppPage } from '../../pages/AppPage';

test.describe('Delete Functionality', () => {
  let app: AppPage;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    app.setupDialogDismiss();
    await app.clearLocalStorage();
    await app.navigate();
  });

  test('delete button is visible when element selected', async () => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    await expect(app.propertiesPanel.deleteButton).toBeVisible();
  });

  test('delete element shows confirmation dialog', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    let dialogShown = false;
    page.once('dialog', async (dialog) => {
      dialogShown = true;
      await dialog.dismiss();
    });

    await app.propertiesPanel.clickDelete();

    expect(dialogShown).toBe(true);
  });

  test('accepting delete removes element', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });
    expect(await app.canvas.getNodeCount()).toBe(1);

    await app.canvas.selectNode(0);

    page.once('dialog', (dialog) => dialog.accept());
    await app.propertiesPanel.clickDelete();
    await app.wait(300);

    expect(await app.canvas.getNodeCount()).toBe(0);
  });

  test('cancelling delete keeps element', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });
    expect(await app.canvas.getNodeCount()).toBe(1);

    await app.canvas.selectNode(0);

    page.once('dialog', (dialog) => dialog.dismiss());
    await app.propertiesPanel.clickDelete();
    await app.wait(100);

    expect(await app.canvas.getNodeCount()).toBe(1);
  });

  test('delete clears properties panel', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    expect(await app.propertiesPanel.isShowingElementProperties()).toBe(true);

    page.once('dialog', (dialog) => dialog.accept());
    await app.propertiesPanel.clickDelete();
    await app.wait(300);

    expect(await app.propertiesPanel.isShowingPlaceholder()).toBe(true);
  });

  test('delete cascades to connected edges', async ({ page }) => {
    // Create two connected nodes
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 500, y: 200 });
    await app.canvas.createEdge(0, 1);

    expect(await app.canvas.getNodeCount()).toBe(2);
    expect(await app.canvas.getEdgeCount()).toBe(1);

    // Delete the first node
    await app.canvas.selectNode(0);
    page.once('dialog', (dialog) => dialog.accept());
    await app.propertiesPanel.clickDelete();
    await app.wait(300);

    // Node and connected edge should be gone
    expect(await app.canvas.getNodeCount()).toBe(1);
    expect(await app.canvas.getEdgeCount()).toBe(0);
  });

  test('delete middle node removes connected edges', async ({ page }) => {
    // Create three connected nodes: A -> B -> C
    await app.createSystemElement({ x: 100, y: 200 });
    await app.createSystemElement({ x: 350, y: 200 });
    await app.createSystemElement({ x: 600, y: 200 });
    await app.canvas.createEdge(0, 1);
    await app.canvas.createEdge(1, 2);

    expect(await app.canvas.getNodeCount()).toBe(3);
    expect(await app.canvas.getEdgeCount()).toBe(2);

    // Delete middle node
    await app.canvas.selectNode(1);
    page.once('dialog', (dialog) => dialog.accept());
    await app.propertiesPanel.clickDelete();
    await app.wait(300);

    // Middle node and both edges should be gone
    expect(await app.canvas.getNodeCount()).toBe(2);
    expect(await app.canvas.getEdgeCount()).toBe(0);
  });

  test('delete edge shows confirmation dialog', async ({ page }) => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 500, y: 200 });
    await app.canvas.createEdge(0, 1);

    await app.canvas.selectEdge(0);

    let dialogShown = false;
    page.once('dialog', async (dialog) => {
      dialogShown = true;
      await dialog.dismiss();
    });

    await app.propertiesPanel.clickDelete();

    expect(dialogShown).toBe(true);
  });

  test('accepting delete removes edge', async ({ page }) => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 500, y: 200 });
    await app.canvas.createEdge(0, 1);

    expect(await app.canvas.getEdgeCount()).toBe(1);

    await app.canvas.selectEdge(0);
    page.once('dialog', (dialog) => dialog.accept());
    await app.propertiesPanel.clickDelete();
    await app.wait(300);

    // Edge should be gone, nodes remain
    expect(await app.canvas.getEdgeCount()).toBe(0);
    expect(await app.canvas.getNodeCount()).toBe(2);
  });

  test('delete edge clears properties panel', async ({ page }) => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 500, y: 200 });
    await app.canvas.createEdge(0, 1);

    await app.canvas.selectEdge(0);
    expect(await app.propertiesPanel.isShowingRelationshipProperties()).toBe(true);

    page.once('dialog', (dialog) => dialog.accept());
    await app.propertiesPanel.clickDelete();
    await app.wait(300);

    expect(await app.propertiesPanel.isShowingPlaceholder()).toBe(true);
  });

  test('delete button text changes based on selection', async ({ page }) => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 500, y: 200 });
    await app.canvas.createEdge(0, 1);

    // Select node
    await app.canvas.selectNode(0);
    let buttonText = await app.propertiesPanel.deleteButton.textContent();
    expect(buttonText?.toLowerCase()).toContain('element');

    // Select edge
    await app.canvas.selectEdge(0);
    buttonText = await app.propertiesPanel.deleteButton.textContent();
    expect(buttonText?.toLowerCase()).toContain('relationship');
  });
});
