import { test, expect } from '@playwright/test';
import { AppPage } from '../../pages/AppPage';

test.describe('Smoke Tests', () => {
  let app: AppPage;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    app.setupDialogDismiss();
    await app.clearLocalStorage();
    await app.navigate();
  });

  test('application loads successfully', async ({ page }) => {
    await expect(page.locator('text=C4 Modelling Tool')).toBeVisible();
  });

  test('header is visible with all main elements', async ({ page }) => {
    // Title
    await expect(page.locator('text=New C4 Model')).toBeVisible();

    // Level selector
    await expect(app.header.levelSelector).toBeVisible();

    // Export button
    await expect(app.header.exportButton).toBeVisible();

    // Import button
    await expect(app.header.importButton).toBeVisible();

    // Layout button
    await expect(app.header.layoutButton).toBeVisible();

    // Clear all button
    await expect(app.header.clearAllButton).toBeVisible();
  });

  test('toolbar is visible with correct initial elements', async () => {
    // Toolbar title
    await expect(app.toolbar.title).toBeVisible();

    // Level label shows Context
    const levelText = await app.toolbar.getCurrentLevelDisplay();
    expect(levelText).toContain('Context');

    // Quick tips section
    await expect(app.toolbar.quickTips).toBeVisible();

    // Context level elements should be visible
    await expect(app.toolbar.systemElement).toBeVisible();
    await expect(app.toolbar.personElement).toBeVisible();
    await expect(app.toolbar.externalSystemElement).toBeVisible();
  });

  test('canvas renders without errors', async () => {
    await expect(app.canvas.canvas).toBeVisible();
    await expect(app.canvas.controls).toBeVisible();
    await expect(app.canvas.minimap).toBeVisible();
    await expect(app.canvas.background).toBeVisible();
  });

  test('canvas is initially empty', async () => {
    const nodeCount = await app.canvas.getNodeCount();
    const edgeCount = await app.canvas.getEdgeCount();

    expect(nodeCount).toBe(0);
    expect(edgeCount).toBe(0);
  });

  test('properties panel shows placeholder when nothing selected', async () => {
    await expect(app.propertiesPanel.placeholderText).toBeVisible();
  });

  test('canvas controls are functional', async () => {
    // Zoom buttons should be visible
    await expect(app.canvas.zoomInButton).toBeVisible();
    await expect(app.canvas.zoomOutButton).toBeVisible();
    await expect(app.canvas.fitViewButton).toBeVisible();

    // Should be clickable
    await app.canvas.zoomInButton.click();
    await app.canvas.zoomOutButton.click();
    await app.canvas.fitViewButton.click();
  });

  test('level selector has all four options', async () => {
    const levels = await app.header.getAvailableLevels();
    expect(levels).toContain('Context');
    expect(levels).toContain('Container');
    expect(levels).toContain('Component');
    expect(levels).toContain('Code');
  });

  test('default level is context', async () => {
    const currentLevel = await app.header.getCurrentLevel();
    expect(currentLevel).toBe('context');
  });

  test('page has no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await app.waitForAppReady();

    // Filter out expected warnings (React development warnings, etc.)
    const criticalErrors = errors.filter(
      (e) => !e.includes('DevTools') && !e.includes('React')
    );

    expect(criticalErrors.length).toBe(0);
  });
});
