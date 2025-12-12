import { test, expect } from '@playwright/test';
import { AppPage } from '../../pages/AppPage';

test.describe('Export Menu', () => {
  let app: AppPage;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    app.setupDialogDismiss();
    await app.clearLocalStorage();
    await app.navigate();
  });

  test('export button opens menu', async () => {
    await app.header.openExportMenu();
    expect(await app.header.isExportMenuOpen()).toBe(true);
  });

  test('shows all 9 export formats', async ({ page }) => {
    await app.header.openExportMenu();

    const formats = [
      'JSON (BAC4)',
      'Structurizr JSON',
      'PlantUML',
      'Mermaid',
      'Markdown',
      'HTML Document',
      'PNG Image',
      'SVG Image',
      'Draw.io',
    ];

    for (const format of formats) {
      await expect(page.locator(`button:has-text("${format}")`)).toBeVisible();
    }
  });

  test('clicking outside closes export menu', async () => {
    await app.header.openExportMenu();
    expect(await app.header.isExportMenuOpen()).toBe(true);

    await app.header.closeExportMenu();
    expect(await app.header.isExportMenuOpen()).toBe(false);
  });

  test('JSON export downloads correct file', async () => {
    // Create some elements first
    await app.createSystemElement({ x: 300, y: 200 });

    const { filename, content } = await app.header.exportJson();

    // Verify filename
    expect(filename).toMatch(/\.json$/);

    // Verify content is valid JSON
    const model = JSON.parse(content);
    expect(model).toHaveProperty('metadata');
    expect(model).toHaveProperty('systems');
    expect(model.systems.length).toBe(1);
  });

  test('export filename uses model title', async () => {
    // Set a custom title
    await app.header.editTitle('My Custom Model');

    // Create an element
    await app.createSystemElement({ x: 300, y: 200 });

    const { filename } = await app.header.exportJson();

    // Filename should be based on title
    expect(filename.toLowerCase()).toContain('my-custom-model');
  });

  test('Structurizr JSON export has correct structure', async () => {
    // Create some elements
    await app.createSystemElement({ x: 300, y: 200 });
    await app.createPersonElement({ x: 500, y: 200 });
    await app.connectNodes(0, 1);

    const { filename, content } = await app.header.exportStructurizr();

    expect(filename).toMatch(/structurizr.*\.json$/i);

    const workspace = JSON.parse(content);
    expect(workspace).toHaveProperty('model');
    expect(workspace.model).toHaveProperty('softwareSystems');
    expect(workspace.model).toHaveProperty('people');
  });

  test('PlantUML export generates valid syntax', async () => {
    await app.createSystemElement({ x: 300, y: 200 });

    const { filename, content } = await app.header.exportPlantUml();

    expect(filename).toMatch(/\.puml$/);
    expect(content).toContain('@startuml');
    expect(content).toContain('@enduml');
  });

  test('export menu closes after export', async () => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.header.exportJson();

    // Menu should be closed after export
    expect(await app.header.isExportMenuOpen()).toBe(false);
  });

  test('export with empty canvas still works', async () => {
    const { content } = await app.header.exportJson();
    const model = JSON.parse(content);

    expect(model.systems).toHaveLength(0);
    expect(model.containers).toHaveLength(0);
    expect(model.components).toHaveLength(0);
    expect(model.people).toHaveLength(0);
    expect(model.externalSystems).toHaveLength(0);
    expect(model.relationships).toHaveLength(0);
  });

  test('export preserves element positions', async () => {
    const position = { x: 350, y: 250 };
    await app.createSystemElement(position);

    const { content } = await app.header.exportJson();
    const model = JSON.parse(content);

    // Position should be preserved (may have slight offset due to drop)
    const systemPos = model.systems[0].position;
    expect(Math.abs(systemPos.x - position.x)).toBeLessThan(100);
    expect(Math.abs(systemPos.y - position.y)).toBeLessThan(100);
  });

  test('export preserves relationships', async () => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 500, y: 200 });
    await app.connectNodes(0, 1);

    const { content } = await app.header.exportJson();
    const model = JSON.parse(content);

    expect(model.relationships).toHaveLength(1);
    expect(model.relationships[0]).toHaveProperty('from');
    expect(model.relationships[0]).toHaveProperty('to');
  });
});
