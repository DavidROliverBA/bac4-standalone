import { test, expect } from '@playwright/test';
import { AppPage } from '../../pages/AppPage';

test.describe('Element Property Editing', () => {
  let app: AppPage;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    app.setupDialogDismiss();
    await app.clearLocalStorage();
    await app.navigate();
  });

  test('selecting element shows all editable fields', async () => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    expect(await app.propertiesPanel.hasAllElementFields()).toBe(true);
  });

  test('editing name updates on blur', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    await app.propertiesPanel.setName('Updated System Name');

    // Check the node label updated
    const labels = await app.canvas.getAllNodeLabels();
    expect(labels[0]).toBe('Updated System Name');
  });

  test('editing technology updates on blur', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    await app.propertiesPanel.setTechnology('Spring Boot, PostgreSQL');

    // Check technology is displayed on node
    const node = app.canvas.getNode(0);
    const text = await node.textContent();
    expect(text).toContain('Spring Boot');
  });

  test('editing description updates on blur', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    await app.propertiesPanel.setDescription('This is the main application');

    // Export and verify
    const { content } = await app.header.exportJson();
    const model = JSON.parse(content);
    expect(model.systems[0].description).toBe('This is the main application');
  });

  test('editing tags saves comma-separated values', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    await app.propertiesPanel.setTags('critical, production, backend');

    // Export and verify
    const { content } = await app.header.exportJson();
    const model = JSON.parse(content);
    expect(model.systems[0].tags).toContain('critical');
  });

  test('changes persist after deselection', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    await app.propertiesPanel.setName('Persistent Name');
    await app.propertiesPanel.setTechnology('Node.js');

    await app.canvas.deselectAll();

    // Select again
    await app.canvas.selectNode(0);

    expect(await app.propertiesPanel.getName()).toBe('Persistent Name');
    expect(await app.propertiesPanel.getTechnology()).toBe('Node.js');
  });

  test('changes persist in export', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    await app.propertiesPanel.setName('Export Test');
    await app.propertiesPanel.setTechnology('React');
    await app.propertiesPanel.setDescription('Test description');
    await app.propertiesPanel.setTags('test, export');

    const { content } = await app.header.exportJson();
    const model = JSON.parse(content);
    const system = model.systems[0];

    expect(system.name).toBe('Export Test');
    expect(system.technology).toBe('React');
    expect(system.description).toBe('Test description');
    expect(system.tags).toContain('test');
  });

  test('shows read-only element type', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    const type = await app.propertiesPanel.getElementType();
    expect(type.toLowerCase()).toContain('system');
  });

  test('different element types show correct type label', async () => {
    // System
    await app.createSystemElement({ x: 200, y: 200 });
    await app.canvas.selectNode(0);
    let type = await app.propertiesPanel.getElementType();
    expect(type.toLowerCase()).toContain('system');

    // Person
    await app.createPersonElement({ x: 400, y: 200 });
    await app.canvas.selectNode(1);
    type = await app.propertiesPanel.getElementType();
    expect(type.toLowerCase()).toContain('person');

    // External System
    await app.createExternalSystemElement({ x: 600, y: 200 });
    await app.canvas.selectNode(2);
    type = await app.propertiesPanel.getElementType();
    expect(type.toLowerCase()).toMatch(/external/i);
  });

  test('empty name is not saved', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    const originalName = await app.propertiesPanel.getName();

    // Try to set empty name
    const nameInput = app.propertiesPanel.panel.locator('input').first();
    await nameInput.fill('');
    await nameInput.blur();
    await app.wait(100);

    // Name should still be the original (or "New System")
    const currentName = await app.propertiesPanel.getName();
    expect(currentName.length).toBeGreaterThan(0);
  });

  test('multiline description works', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    const multilineDesc = 'Line 1\nLine 2\nLine 3';
    await app.propertiesPanel.setDescription(multilineDesc);

    const desc = await app.propertiesPanel.getDescription();
    expect(desc).toContain('Line 1');
    expect(desc).toContain('Line 2');
  });

  test('special characters in fields are handled', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    const specialName = 'System <with> "Special" & Characters';
    await app.propertiesPanel.setName(specialName);

    const { content } = await app.header.exportJson();
    const model = JSON.parse(content);
    expect(model.systems[0].name).toBe(specialName);
  });
});
