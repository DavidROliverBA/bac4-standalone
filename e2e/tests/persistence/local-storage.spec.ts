import { test, expect } from '@playwright/test';
import { AppPage } from '../../pages/AppPage';
import { getModelFromLocalStorage, setModelInLocalStorage } from '../../helpers/test-helpers';
import { createContextModel } from '../../helpers/fixture-helpers';

test.describe('Local Storage Persistence', () => {
  let app: AppPage;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    await app.clearLocalStorage();
  });

  test('model is saved to localStorage', async ({ page }) => {
    app.setupDialogDismiss();
    await app.navigate();

    // Create elements
    await app.createSystemElement({ x: 300, y: 200 });
    await app.createPersonElement({ x: 500, y: 200 });

    // Wait for auto-save (could be up to 30 seconds)
    // For testing, trigger a page unload which also saves
    await page.evaluate(() => {
      window.dispatchEvent(new Event('beforeunload'));
    });
    await app.wait(500);

    // Check localStorage
    const savedModel = await getModelFromLocalStorage(page);
    expect(savedModel).not.toBeNull();
    expect(savedModel.systems.length).toBe(1);
    expect(savedModel.people.length).toBe(1);
  });

  test('saved model is restored on reload', async ({ page }) => {
    // First session: create elements
    app.setupDialogDismiss();
    await app.navigate();
    await app.createSystemElement({ x: 300, y: 200 });
    await app.createPersonElement({ x: 500, y: 200 });

    // Trigger save
    await page.evaluate(() => {
      window.dispatchEvent(new Event('beforeunload'));
    });
    await app.wait(500);

    // Reload and accept restore
    page.once('dialog', (dialog) => dialog.accept());
    await page.reload();
    await app.waitForAppReady();

    // Elements should be restored
    expect(await app.canvas.getNodeCount()).toBe(2);
  });

  test('dismissing restore dialog clears model', async ({ page }) => {
    // Set up a model in localStorage
    const model = createContextModel();
    await setModelInLocalStorage(page, model);

    // Load page and dismiss restore
    page.once('dialog', (dialog) => dialog.dismiss());
    await page.goto('/');
    await app.waitForAppReady();

    // Canvas should be empty
    expect(await app.canvas.getNodeCount()).toBe(0);
  });

  test('accepting restore dialog loads model', async ({ page }) => {
    // Set up a model in localStorage
    const model = createContextModel();
    await setModelInLocalStorage(page, model);

    // Load page and accept restore
    page.once('dialog', (dialog) => dialog.accept());
    await page.goto('/');
    await app.waitForAppReady();

    // Canvas should have elements from model
    expect(await app.canvas.getNodeCount()).toBeGreaterThan(0);
  });

  test('restored model preserves title', async ({ page }) => {
    // Set up a model with custom title
    const model = createContextModel('My Custom Title');
    await setModelInLocalStorage(page, model);

    // Load and accept
    page.once('dialog', (dialog) => dialog.accept());
    await page.goto('/');
    await app.waitForAppReady();

    const title = await app.header.getTitle();
    expect(title).toBe('My Custom Title');
  });

  test('restored model preserves positions', async ({ page }) => {
    app.setupDialogDismiss();
    await app.navigate();

    // Create element and move it
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.dragNode(0, 600, 400);

    // Save
    await page.evaluate(() => {
      window.dispatchEvent(new Event('beforeunload'));
    });
    await app.wait(500);

    // Export to get positions
    const { content } = await app.header.exportJson();
    const beforeReload = JSON.parse(content);
    const posBefore = beforeReload.systems[0].position;

    // Reload and accept
    page.once('dialog', (dialog) => dialog.accept());
    await page.reload();
    await app.waitForAppReady();

    // Export again
    const after = await app.header.exportJson();
    const afterReload = JSON.parse(after.content);
    const posAfter = afterReload.systems[0].position;

    // Positions should be similar
    expect(Math.abs(posAfter.x - posBefore.x)).toBeLessThan(50);
    expect(Math.abs(posAfter.y - posBefore.y)).toBeLessThan(50);
  });

  test('restored model preserves relationships', async ({ page }) => {
    app.setupDialogDismiss();
    await app.navigate();

    // Create elements with relationship
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 500, y: 200 });
    await app.canvas.createEdge(0, 1);

    // Save
    await page.evaluate(() => {
      window.dispatchEvent(new Event('beforeunload'));
    });
    await app.wait(500);

    // Reload and accept
    page.once('dialog', (dialog) => dialog.accept());
    await page.reload();
    await app.waitForAppReady();

    // Should have edge
    expect(await app.canvas.getEdgeCount()).toBe(1);
  });

  test('empty canvas does not prompt on load', async ({ page }) => {
    // Clear localStorage
    await app.clearLocalStorage();

    let dialogShown = false;
    page.on('dialog', () => {
      dialogShown = true;
    });

    await page.goto('/');
    await app.waitForAppReady();
    await app.wait(500);

    // No dialog should have been shown
    expect(dialogShown).toBe(false);
  });

  test('changes update localStorage on save', async ({ page }) => {
    app.setupDialogDismiss();
    await app.navigate();

    // Create initial element
    await app.createSystemElement({ x: 300, y: 200 });

    // Save
    await page.evaluate(() => {
      window.dispatchEvent(new Event('beforeunload'));
    });
    await app.wait(500);

    let model = await getModelFromLocalStorage(page);
    expect(model.systems.length).toBe(1);

    // Add another element
    await app.createPersonElement({ x: 500, y: 200 });

    // Save again
    await page.evaluate(() => {
      window.dispatchEvent(new Event('beforeunload'));
    });
    await app.wait(500);

    model = await getModelFromLocalStorage(page);
    expect(model.people.length).toBe(1);
  });
});
