import { test, expect } from '@playwright/test';
import { AppPage } from '../../pages/AppPage';
import { getEdgeInfo } from '../../helpers/canvas-helpers';

test.describe('Relationship Property Editing', () => {
  let app: AppPage;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    app.setupDialogDismiss();
    await app.clearLocalStorage();
    await app.navigate();

    // Create two connected nodes for all tests
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 500, y: 200 });
    await app.canvas.createEdge(0, 1);
  });

  test('selecting edge shows all editable fields', async () => {
    await app.canvas.selectEdge(0);

    expect(await app.propertiesPanel.hasAllRelationshipFields()).toBe(true);
  });

  test('editing description updates on blur', async ({ page }) => {
    await app.canvas.selectEdge(0);

    await app.propertiesPanel.setEdgeDescription('Makes API calls to');

    // Check edge label updated
    const label = await app.canvas.getEdgeLabel(0);
    expect(label).toBe('Makes API calls to');
  });

  test('editing technology updates on blur', async ({ page }) => {
    await app.canvas.selectEdge(0);

    await app.propertiesPanel.setEdgeTechnology('REST/HTTPS');

    // Export and verify
    const { content } = await app.header.exportJson();
    const model = JSON.parse(content);
    expect(model.relationships[0].technology).toBe('REST/HTTPS');
  });

  test('arrow direction dropdown has all options', async ({ page }) => {
    await app.canvas.selectEdge(0);

    const select = app.propertiesPanel.arrowDirectionSelect;
    const options = await select.locator('option').allTextContents();

    expect(options.some((o) => o.includes('Right'))).toBe(true);
    expect(options.some((o) => o.includes('Left'))).toBe(true);
    expect(options.some((o) => o.includes('Both'))).toBe(true);
    expect(options.some((o) => o.includes('None'))).toBe(true);
  });

  test('changing arrow direction updates immediately', async ({ page }) => {
    await app.canvas.selectEdge(0);

    // Change to left
    await app.propertiesPanel.setArrowDirection('left');

    // Export and verify
    const { content } = await app.header.exportJson();
    const model = JSON.parse(content);
    expect(model.relationships[0].arrowDirection).toBe('left');
  });

  test('line style dropdown has all options', async ({ page }) => {
    await app.canvas.selectEdge(0);

    const select = app.propertiesPanel.lineStyleSelect;
    const options = await select.locator('option').allTextContents();

    expect(options.some((o) => o.includes('Solid'))).toBe(true);
    expect(options.some((o) => o.includes('Dashed'))).toBe(true);
    expect(options.some((o) => o.includes('Dotted'))).toBe(true);
  });

  test('changing line style updates edge visually', async ({ page }) => {
    await app.canvas.selectEdge(0);

    // Change to dashed
    await app.propertiesPanel.setLineStyle('dashed');

    const edgeInfo = await getEdgeInfo(page, 0);
    expect(edgeInfo.style).toBe('dashed');
  });

  test('changing line style to dotted works', async ({ page }) => {
    await app.canvas.selectEdge(0);

    await app.propertiesPanel.setLineStyle('dotted');

    const edgeInfo = await getEdgeInfo(page, 0);
    expect(edgeInfo.style).toBe('dotted');
  });

  test('arrow direction both shows arrows on both ends', async ({ page }) => {
    await app.canvas.selectEdge(0);

    await app.propertiesPanel.setArrowDirection('both');

    // Export and verify
    const { content } = await app.header.exportJson();
    const model = JSON.parse(content);
    expect(model.relationships[0].arrowDirection).toBe('both');
  });

  test('arrow direction none removes all arrows', async ({ page }) => {
    await app.canvas.selectEdge(0);

    await app.propertiesPanel.setArrowDirection('none');

    const { content } = await app.header.exportJson();
    const model = JSON.parse(content);
    expect(model.relationships[0].arrowDirection).toBe('none');
  });

  test('changes persist after deselection', async ({ page }) => {
    await app.canvas.selectEdge(0);

    await app.propertiesPanel.setEdgeDescription('Persisted Description');
    await app.propertiesPanel.setArrowDirection('both');
    await app.propertiesPanel.setLineStyle('dashed');

    await app.canvas.deselectAll();

    // Select again
    await app.canvas.selectEdge(0);

    expect(await app.propertiesPanel.getEdgeDescription()).toBe('Persisted Description');
    expect(await app.propertiesPanel.getArrowDirection()).toBe('both');
    expect(await app.propertiesPanel.getLineStyle()).toBe('dashed');
  });

  test('changes persist in export', async ({ page }) => {
    await app.canvas.selectEdge(0);

    await app.propertiesPanel.setEdgeDescription('Calls API');
    await app.propertiesPanel.setEdgeTechnology('gRPC');
    await app.propertiesPanel.setArrowDirection('right');
    await app.propertiesPanel.setLineStyle('solid');

    const { content } = await app.header.exportJson();
    const model = JSON.parse(content);
    const rel = model.relationships[0];

    expect(rel.description).toBe('Calls API');
    expect(rel.technology).toBe('gRPC');
    expect(rel.arrowDirection).toBe('right');
    expect(rel.lineStyle).toBe('solid');
  });

  test('close button deselects edge', async () => {
    await app.canvas.selectEdge(0);

    expect(await app.propertiesPanel.isShowingRelationshipProperties()).toBe(true);

    await app.propertiesPanel.close();

    expect(await app.propertiesPanel.isShowingPlaceholder()).toBe(true);
  });
});
