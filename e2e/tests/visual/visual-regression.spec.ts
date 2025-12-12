import { test, expect } from '@playwright/test';
import { AppPage } from '../../pages/AppPage';

test.describe('Visual Regression Tests', () => {
  let app: AppPage;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    app.setupDialogDismiss();
    await app.clearLocalStorage();
    await app.navigate();
  });

  test('empty canvas appearance', async ({ page }) => {
    // Ensure clean state
    await app.canvas.fitView();
    await app.wait(500);

    await expect(page).toHaveScreenshot('empty-canvas.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('context diagram with elements', async ({ page }) => {
    // Create a basic context diagram
    await app.createPersonElement({ x: 200, y: 100 });
    await app.createSystemElement({ x: 400, y: 200 });
    await app.createExternalSystemElement({ x: 600, y: 300 });

    // Create relationships
    await app.connectNodes(0, 1);
    await app.connectNodes(1, 2);

    await app.canvas.fitView();
    await app.wait(500);

    // Deselect all for clean screenshot
    await app.canvas.deselectAll();
    await app.wait(300);

    await expect(page).toHaveScreenshot('context-diagram.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('properties panel with element selected', async ({ page }) => {
    await app.createSystemElement({ x: 400, y: 200 });
    await app.canvas.selectNode(0);

    // Set some properties for visual consistency
    await app.propertiesPanel.setName('E-Commerce System');
    await app.propertiesPanel.setTechnology('React, Node.js');
    await app.propertiesPanel.setDescription('Main e-commerce platform');

    await app.wait(300);

    await expect(app.propertiesPanel.panel).toHaveScreenshot('properties-panel-element.png', {
      animations: 'disabled',
    });
  });

  test('properties panel with relationship selected', async ({ page }) => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 500, y: 200 });
    await app.connectNodes(0, 1);

    await app.canvas.selectEdge(0);

    // Set some properties
    await app.propertiesPanel.setEdgeDescription('Calls API');
    await app.propertiesPanel.setEdgeTechnology('REST/HTTPS');

    await app.wait(300);

    await expect(app.propertiesPanel.panel).toHaveScreenshot('properties-panel-relationship.png', {
      animations: 'disabled',
    });
  });

  test('export menu open', async ({ page }) => {
    await app.header.openExportMenu();
    await app.wait(200);

    await expect(app.header.exportMenu).toHaveScreenshot('export-menu-open.png', {
      animations: 'disabled',
    });
  });

  test('layout menu open', async ({ page }) => {
    await app.header.openLayoutMenu();
    await app.wait(200);

    await expect(app.header.layoutMenu).toHaveScreenshot('layout-menu-open.png', {
      animations: 'disabled',
    });
  });

  test('system node styling', async ({ page }) => {
    await app.createSystemElement({ x: 400, y: 200 });
    await app.canvas.fitView();
    await app.wait(300);

    const node = app.canvas.getNode(0);
    await expect(node).toHaveScreenshot('node-system.png', {
      animations: 'disabled',
    });
  });

  test('person node styling', async ({ page }) => {
    await app.createPersonElement({ x: 400, y: 200 });
    await app.canvas.fitView();
    await app.wait(300);

    const node = app.canvas.getNode(0);
    await expect(node).toHaveScreenshot('node-person.png', {
      animations: 'disabled',
    });
  });

  test('external system node styling', async ({ page }) => {
    await app.createExternalSystemElement({ x: 400, y: 200 });
    await app.canvas.fitView();
    await app.wait(300);

    const node = app.canvas.getNode(0);
    await expect(node).toHaveScreenshot('node-external-system.png', {
      animations: 'disabled',
    });
  });

  test('container node styling', async ({ page }) => {
    await app.header.selectLevel('container');
    await app.createContainerElement({ x: 400, y: 200 });
    await app.canvas.fitView();
    await app.wait(300);

    const node = app.canvas.getNode(0);
    await expect(node).toHaveScreenshot('node-container.png', {
      animations: 'disabled',
    });
  });

  test('component node styling', async ({ page }) => {
    await app.header.selectLevel('component');
    await app.createComponentElement({ x: 400, y: 200 });
    await app.canvas.fitView();
    await app.wait(300);

    const node = app.canvas.getNode(0);
    await expect(node).toHaveScreenshot('node-component.png', {
      animations: 'disabled',
    });
  });

  test('edge solid style', async ({ page }) => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 500, y: 200 });
    await app.connectNodes(0, 1);

    await app.canvas.fitView();
    await app.canvas.deselectAll();
    await app.wait(300);

    await expect(page).toHaveScreenshot('edge-solid.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('edge dashed style', async ({ page }) => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 500, y: 200 });
    await app.connectNodes(0, 1);

    await app.canvas.selectEdge(0);
    await app.propertiesPanel.setLineStyle('dashed');
    await app.canvas.deselectAll();

    await app.canvas.fitView();
    await app.wait(300);

    await expect(page).toHaveScreenshot('edge-dashed.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('edge dotted style', async ({ page }) => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 500, y: 200 });
    await app.connectNodes(0, 1);

    await app.canvas.selectEdge(0);
    await app.propertiesPanel.setLineStyle('dotted');
    await app.canvas.deselectAll();

    await app.canvas.fitView();
    await app.wait(300);

    await expect(page).toHaveScreenshot('edge-dotted.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('selected node appearance', async ({ page }) => {
    await app.createSystemElement({ x: 400, y: 200 });
    await app.canvas.selectNode(0);
    await app.wait(200);

    const node = app.canvas.getNode(0);
    await expect(node).toHaveScreenshot('node-selected.png', {
      animations: 'disabled',
    });
  });

  test('toolbar at context level', async ({ page }) => {
    await expect(app.toolbar.sidebar).toHaveScreenshot('toolbar-context.png', {
      animations: 'disabled',
    });
  });

  test('toolbar at container level', async ({ page }) => {
    await app.header.selectLevel('container');
    await app.wait(200);

    await expect(app.toolbar.sidebar).toHaveScreenshot('toolbar-container.png', {
      animations: 'disabled',
    });
  });

  test('toolbar at component level', async ({ page }) => {
    await app.header.selectLevel('component');
    await app.wait(200);

    await expect(app.toolbar.sidebar).toHaveScreenshot('toolbar-component.png', {
      animations: 'disabled',
    });
  });

  test('toolbar at code level', async ({ page }) => {
    await app.header.selectLevel('code');
    await app.wait(200);

    await expect(app.toolbar.sidebar).toHaveScreenshot('toolbar-code.png', {
      animations: 'disabled',
    });
  });

  test('header appearance', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toHaveScreenshot('header.png', {
      animations: 'disabled',
    });
  });

  test('canvas controls appearance', async ({ page }) => {
    await expect(app.canvas.controls).toHaveScreenshot('canvas-controls.png', {
      animations: 'disabled',
    });
  });
});
