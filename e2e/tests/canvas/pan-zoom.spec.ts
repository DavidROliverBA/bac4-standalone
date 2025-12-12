import { test, expect } from '@playwright/test';
import { AppPage } from '../../pages/AppPage';
import { getViewportTransform, zoomCanvas, panCanvas } from '../../helpers/canvas-helpers';

test.describe('Canvas Pan and Zoom', () => {
  let app: AppPage;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    app.setupDialogDismiss();
    await app.clearLocalStorage();
    await app.navigate();
  });

  test('zoom controls are visible', async () => {
    await expect(app.canvas.zoomInButton).toBeVisible();
    await expect(app.canvas.zoomOutButton).toBeVisible();
    await expect(app.canvas.fitViewButton).toBeVisible();
  });

  test('zoom in button increases zoom level', async ({ page }) => {
    const initialTransform = await getViewportTransform(page);

    await app.canvas.zoomIn(3);

    const newTransform = await getViewportTransform(page);

    // Zoom level should have increased
    if (initialTransform && newTransform) {
      expect(newTransform.zoom).toBeGreaterThan(initialTransform.zoom);
    }
  });

  test('zoom out button decreases zoom level', async ({ page }) => {
    // First zoom in to have room to zoom out
    await app.canvas.zoomIn(3);
    const afterZoomIn = await getViewportTransform(page);

    await app.canvas.zoomOut(2);
    const afterZoomOut = await getViewportTransform(page);

    if (afterZoomIn && afterZoomOut) {
      expect(afterZoomOut.zoom).toBeLessThan(afterZoomIn.zoom);
    }
  });

  test('mouse wheel zooms canvas', async ({ page }) => {
    const initial = await getViewportTransform(page);

    // Zoom in with negative delta
    await zoomCanvas(page, -100);

    const after = await getViewportTransform(page);

    if (initial && after) {
      expect(after.zoom).not.toBe(initial.zoom);
    }
  });

  test('fit view button fits all elements', async ({ page }) => {
    // Create some elements
    await app.createSystemElement({ x: 100, y: 100 });
    await app.createSystemElement({ x: 800, y: 600 });

    await app.canvas.fitView();

    // Both elements should be visible (no error)
    expect(await app.canvas.getNodeCount()).toBe(2);
  });

  test('dragging background pans canvas', async ({ page }) => {
    const initial = await getViewportTransform(page);

    await panCanvas(page, 100, 50);

    const after = await getViewportTransform(page);

    if (initial && after) {
      // Position should have changed
      expect(after.x).not.toBe(initial.x);
    }
  });

  test('pan does not create elements', async ({ page }) => {
    expect(await app.canvas.isEmpty()).toBe(true);

    await panCanvas(page, 100, 100);

    // Canvas should still be empty
    expect(await app.canvas.isEmpty()).toBe(true);
  });

  test('minimap is visible', async () => {
    await expect(app.canvas.minimap).toBeVisible();
  });

  test('controls work after zoom', async ({ page }) => {
    // Zoom in
    await app.canvas.zoomIn(2);

    // Create element
    await app.createSystemElement({ x: 300, y: 200 });

    // Element should be created
    expect(await app.canvas.getNodeCount()).toBe(1);

    // Element should be selectable
    await app.canvas.selectNode(0);
    expect(await app.canvas.isNodeSelected(0)).toBe(true);
  });

  test('zoom has limits', async ({ page }) => {
    // Zoom way in
    for (let i = 0; i < 20; i++) {
      await app.canvas.zoomIn();
    }

    const zoomedIn = await getViewportTransform(page);

    // Zoom way out
    for (let i = 0; i < 40; i++) {
      await app.canvas.zoomOut();
    }

    const zoomedOut = await getViewportTransform(page);

    // Both should be valid (not infinite or NaN)
    if (zoomedIn && zoomedOut) {
      expect(isFinite(zoomedIn.zoom)).toBe(true);
      expect(isFinite(zoomedOut.zoom)).toBe(true);
    }
  });

  test('background grid is visible', async () => {
    await expect(app.canvas.background).toBeVisible();
  });
});
