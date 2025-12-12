import { test, expect } from '@playwright/test';
import { AppPage } from '../../pages/AppPage';
import {
  createTempImportFile,
  cleanupTempFiles,
  createContextModel,
  createStructurizrModel,
} from '../../helpers/fixture-helpers';
import * as path from 'path';

test.describe('Import Functionality', () => {
  let app: AppPage;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    app.setupDialogDismiss();
    await app.clearLocalStorage();
    await app.navigate();
  });

  test.afterAll(() => {
    cleanupTempFiles();
  });

  test('import button is visible', async () => {
    await expect(app.header.importButton).toBeVisible();
  });

  test('import accepts JSON files', async ({ page }) => {
    const input = app.header.importInput;
    const acceptAttr = await input.getAttribute('accept');
    expect(acceptAttr).toBe('.json');
  });

  test('import BAC4 JSON model', async ({ page }) => {
    const model = createContextModel('Test Import');
    const tempFile = createTempImportFile(model);

    // Set up dialog handler for success message
    page.once('dialog', (dialog) => dialog.accept());

    await app.header.importFile(tempFile);
    await app.wait(500);

    // Verify elements were imported
    const nodeCount = await app.canvas.getNodeCount();
    expect(nodeCount).toBeGreaterThan(0);
  });

  test('import updates title from model metadata', async ({ page }) => {
    const model = createContextModel('Imported Model Name');
    const tempFile = createTempImportFile(model);

    page.once('dialog', (dialog) => dialog.accept());
    await app.header.importFile(tempFile);
    await app.wait(500);

    const title = await app.header.getTitle();
    expect(title).toBe('Imported Model Name');
  });

  test('import Structurizr workspace format', async ({ page }) => {
    const workspace = createStructurizrModel();
    const tempFile = createTempImportFile(workspace);

    page.once('dialog', (dialog) => dialog.accept());
    await app.header.importFile(tempFile);
    await app.wait(500);

    // Should have imported elements
    const nodeCount = await app.canvas.getNodeCount();
    expect(nodeCount).toBeGreaterThan(0);
  });

  test('import replaces existing model', async ({ page }) => {
    // Create some elements first
    await app.createSystemElement({ x: 300, y: 200 });
    await app.createPersonElement({ x: 500, y: 200 });
    expect(await app.canvas.getNodeCount()).toBe(2);

    // Import a different model
    const model = createContextModel('New Model');
    const tempFile = createTempImportFile(model);

    page.once('dialog', (dialog) => dialog.accept());
    await app.header.importFile(tempFile);
    await app.wait(500);

    // Count should match imported model, not be additive
    // The context model has 1 system + 1 person + 1 external = 3 elements
    const nodeCount = await app.canvas.getNodeCount();
    expect(nodeCount).toBe(3);
  });

  test('import preserves relationships', async ({ page }) => {
    const model = createContextModel();
    const tempFile = createTempImportFile(model);

    page.once('dialog', (dialog) => dialog.accept());
    await app.header.importFile(tempFile);
    await app.wait(500);

    // The context model has 2 relationships
    const edgeCount = await app.canvas.getEdgeCount();
    expect(edgeCount).toBe(2);
  });

  test('import shows error for invalid JSON', async ({ page }) => {
    const tempFile = createTempImportFile('not valid json {{{');

    let errorShown = false;
    page.once('dialog', async (dialog) => {
      if (dialog.message().toLowerCase().includes('error')) {
        errorShown = true;
      }
      await dialog.accept();
    });

    await app.header.importFile(tempFile);
    await app.wait(500);

    expect(errorShown).toBe(true);
  });

  test('import from fixture file', async ({ page }) => {
    const fixturePath = path.join(
      __dirname,
      '..',
      '..',
      'fixtures',
      'models',
      'context-level-model.json'
    );

    page.once('dialog', (dialog) => dialog.accept());
    await app.header.importFile(fixturePath);
    await app.wait(500);

    // Verify import worked
    const title = await app.header.getTitle();
    expect(title).toBe('E-Commerce System');
  });
});
