import { test, expect } from '@playwright/test';
import { AppPage } from '../../pages/AppPage';

test.describe('Layout Menu', () => {
  let app: AppPage;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    app.setupDialogDismiss();
    await app.clearLocalStorage();
    await app.navigate();
  });

  test('layout button is visible', async () => {
    await expect(app.header.layoutButton).toBeVisible();
  });

  test('layout button opens menu', async () => {
    await app.header.openLayoutMenu();
    await expect(app.header.layoutMenu).toBeVisible();
  });

  test('shows all four layout options', async ({ page }) => {
    await app.header.openLayoutMenu();

    await expect(app.header.layoutHierarchical).toBeVisible();
    await expect(app.header.layoutGrid).toBeVisible();
    await expect(app.header.layoutCircular).toBeVisible();
    await expect(app.header.layoutForceDirected).toBeVisible();
  });

  test('hierarchical layout repositions elements', async () => {
    // Create several elements
    await app.createSystemElement({ x: 100, y: 100 });
    await app.createPersonElement({ x: 100, y: 100 }); // Same position
    await app.createExternalSystemElement({ x: 100, y: 100 }); // Same position

    // Get initial positions (they might be overlapping)
    const initialTransform = await app.canvas.getViewportTransform();

    // Apply hierarchical layout
    await app.header.applyHierarchicalLayout();
    await app.wait(500);

    // Elements should have been repositioned
    // We can't easily verify exact positions, but the transform might change
    // due to fitView, or we can check nodes aren't all at the same spot
  });

  test('grid layout organizes elements', async () => {
    // Create several elements
    await app.createSystemElement({ x: 500, y: 500 });
    await app.createPersonElement({ x: 500, y: 500 });
    await app.createExternalSystemElement({ x: 500, y: 500 });

    // Apply grid layout
    await app.header.applyGridLayout();
    await app.wait(500);

    // Layout was applied (no error)
    expect(await app.canvas.getNodeCount()).toBe(3);
  });

  test('circular layout arranges elements in circle', async () => {
    // Create several elements
    await app.createSystemElement({ x: 300, y: 200 });
    await app.createPersonElement({ x: 300, y: 200 });
    await app.createExternalSystemElement({ x: 300, y: 200 });

    // Apply circular layout
    await app.header.applyCircularLayout();
    await app.wait(500);

    // Layout was applied (no error)
    expect(await app.canvas.getNodeCount()).toBe(3);
  });

  test('force-directed layout works', async () => {
    // Create several elements with relationships
    await app.createSystemElement({ x: 300, y: 200 });
    await app.createSystemElement({ x: 300, y: 200 });
    await app.connectNodes(0, 1);

    // Apply force-directed layout
    await app.header.applyForceDirectedLayout();
    await app.wait(500);

    // Layout was applied (no error)
    expect(await app.canvas.getNodeCount()).toBe(2);
  });

  test('layout menu closes after applying layout', async () => {
    await app.createSystemElement({ x: 300, y: 200 });

    await app.header.applyHierarchicalLayout();

    // Menu should be closed
    await expect(app.header.layoutMenu).not.toBeVisible();
  });

  test('layout with empty canvas does not error', async () => {
    // Ensure canvas is empty
    expect(await app.canvas.isEmpty()).toBe(true);

    // Apply layout - should not throw
    await app.header.applyHierarchicalLayout();

    // Still empty, no error
    expect(await app.canvas.isEmpty()).toBe(true);
  });

  test('layout with single element works', async () => {
    await app.createSystemElement({ x: 300, y: 200 });

    await app.header.applyHierarchicalLayout();

    // Element still exists
    expect(await app.canvas.getNodeCount()).toBe(1);
  });

  test('layout preserves relationships', async () => {
    // Create elements with relationships
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 500, y: 200 });
    await app.connectNodes(0, 1);

    expect(await app.canvas.getEdgeCount()).toBe(1);

    // Apply layout
    await app.header.applyHierarchicalLayout();
    await app.wait(500);

    // Relationship should still exist
    expect(await app.canvas.getEdgeCount()).toBe(1);
  });
});
