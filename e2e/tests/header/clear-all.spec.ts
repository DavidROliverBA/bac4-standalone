import { test, expect } from '@playwright/test';
import { AppPage } from '../../pages/AppPage';

test.describe('Clear All Functionality', () => {
  let app: AppPage;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    app.setupDialogDismiss();
    await app.clearLocalStorage();
    await app.navigate();
  });

  test('clear all button is visible', async () => {
    await expect(app.header.clearAllButton).toBeVisible();
  });

  test('clear all shows confirmation dialog', async ({ page }) => {
    // Create an element
    await app.createSystemElement({ x: 300, y: 200 });

    let dialogShown = false;
    let dialogMessage = '';
    page.once('dialog', async (dialog) => {
      dialogShown = true;
      dialogMessage = dialog.message();
      await dialog.dismiss();
    });

    await app.header.clickClearAll();

    expect(dialogShown).toBe(true);
    expect(dialogMessage.toLowerCase()).toContain('clear');
  });

  test('accepting confirmation clears all elements', async ({ page }) => {
    // Create multiple elements
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createPersonElement({ x: 400, y: 200 });
    await app.createExternalSystemElement({ x: 600, y: 200 });
    await app.connectNodes(0, 1);
    await app.connectNodes(1, 2);

    expect(await app.canvas.getNodeCount()).toBe(3);
    expect(await app.canvas.getEdgeCount()).toBe(2);

    // Accept clear all
    page.once('dialog', (dialog) => dialog.accept());
    await app.header.clickClearAll();
    await app.wait(300);

    // Canvas should be empty
    expect(await app.canvas.getNodeCount()).toBe(0);
    expect(await app.canvas.getEdgeCount()).toBe(0);
  });

  test('cancelling confirmation keeps all elements', async ({ page }) => {
    // Create elements
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createPersonElement({ x: 400, y: 200 });
    await app.connectNodes(0, 1);

    const initialNodes = await app.canvas.getNodeCount();
    const initialEdges = await app.canvas.getEdgeCount();

    // Cancel clear all
    page.once('dialog', (dialog) => dialog.dismiss());
    await app.header.clickClearAll();
    await app.wait(100);

    // Should be unchanged
    expect(await app.canvas.getNodeCount()).toBe(initialNodes);
    expect(await app.canvas.getEdgeCount()).toBe(initialEdges);
  });

  test('clear all with empty canvas works', async ({ page }) => {
    // Ensure canvas is empty
    expect(await app.canvas.isEmpty()).toBe(true);

    // Clear all should still work (dialog may or may not show)
    page.on('dialog', (dialog) => dialog.accept());
    await app.header.clickClearAll();

    // Still empty, no error
    expect(await app.canvas.isEmpty()).toBe(true);
  });

  test('clear all clears properties panel selection', async ({ page }) => {
    // Create and select an element
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    // Properties panel should show element
    expect(await app.propertiesPanel.isShowingPlaceholder()).toBe(false);

    // Clear all
    page.once('dialog', (dialog) => dialog.accept());
    await app.header.clickClearAll();
    await app.wait(300);

    // Properties panel should show placeholder
    expect(await app.propertiesPanel.isShowingPlaceholder()).toBe(true);
  });

  test('clear all preserves title', async ({ page }) => {
    // Set a title
    await app.header.editTitle('My Model');

    // Create elements
    await app.createSystemElement({ x: 300, y: 200 });

    // Clear all
    page.once('dialog', (dialog) => dialog.accept());
    await app.header.clickClearAll();
    await app.wait(300);

    // Title should be preserved
    const title = await app.header.getTitle();
    expect(title).toBe('My Model');
  });

  test('clear all preserves current level', async ({ page }) => {
    // Change to container level
    await app.header.selectLevel('container');

    // Create elements at container level
    await app.createContainerElement({ x: 300, y: 200 });

    // Clear all
    page.once('dialog', (dialog) => dialog.accept());
    await app.header.clickClearAll();
    await app.wait(300);

    // Level should still be container
    const level = await app.header.getCurrentLevel();
    expect(level).toBe('container');
  });
});
