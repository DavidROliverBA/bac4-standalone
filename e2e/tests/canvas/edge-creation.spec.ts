import { test, expect } from '@playwright/test';
import { AppPage } from '../../pages/AppPage';
import { getEdgeInfo, getAllEdgesInfo } from '../../helpers/canvas-helpers';

test.describe('Edge/Relationship Creation', () => {
  let app: AppPage;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    app.setupDialogDismiss();
    await app.clearLocalStorage();
    await app.navigate();
  });

  test('connecting nodes creates edge', async () => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 500, y: 200 });

    expect(await app.canvas.getEdgeCount()).toBe(0);

    await app.connectNodes(0, 1);

    expect(await app.canvas.getEdgeCount()).toBe(1);
  });

  test('created edge has default description', async ({ page }) => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 500, y: 200 });
    await app.connectNodes(0, 1);

    // Select the edge
    await app.canvas.selectEdge(0);

    // Check default description in properties
    const desc = await app.propertiesPanel.getEdgeDescription();
    expect(desc.toLowerCase()).toContain('relationship');
  });

  test('clicking edge selects it', async () => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 500, y: 200 });
    await app.connectNodes(0, 1);

    await app.canvas.selectEdge(0);

    expect(await app.propertiesPanel.isShowingRelationshipProperties()).toBe(true);
  });

  test('edge appears with arrow marker', async ({ page }) => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 500, y: 200 });
    await app.connectNodes(0, 1);

    const edgeInfo = await getEdgeInfo(page, 0);
    // Default direction is right, so should have target arrow
    expect(edgeInfo.hasTargetArrow).toBe(true);
  });

  test('multiple edges can be created', async () => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 400, y: 200 });
    await app.createSystemElement({ x: 600, y: 200 });

    await app.connectNodes(0, 1);
    await app.connectNodes(1, 2);

    expect(await app.canvas.getEdgeCount()).toBe(2);
  });

  test('edge can connect in reverse direction', async () => {
    await app.createSystemElement({ x: 500, y: 200 });
    await app.createSystemElement({ x: 200, y: 200 });

    // Connect second to first (reverse order)
    await app.connectNodes(1, 0);

    expect(await app.canvas.getEdgeCount()).toBe(1);
  });

  test('edges are exported correctly', async ({ page }) => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 500, y: 200 });
    await app.connectNodes(0, 1);

    const { content } = await app.header.exportJson();
    const model = JSON.parse(content);

    expect(model.relationships).toHaveLength(1);
    expect(model.relationships[0]).toHaveProperty('from');
    expect(model.relationships[0]).toHaveProperty('to');
    expect(model.relationships[0]).toHaveProperty('description');
  });

  test('edge persists after deselection', async () => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 500, y: 200 });
    await app.connectNodes(0, 1);

    await app.canvas.selectEdge(0);
    await app.canvas.deselectAll();

    // Edge should still exist
    expect(await app.canvas.getEdgeCount()).toBe(1);
  });

  test('edge connects correct source and target', async ({ page }) => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createPersonElement({ x: 500, y: 200 });
    await app.connectNodes(0, 1);

    const { content } = await app.header.exportJson();
    const model = JSON.parse(content);

    const rel = model.relationships[0];
    const sourceId = rel.from;
    const targetId = rel.to;

    // Source should be system, target should be person
    const systemId = model.systems[0].id;
    const personId = model.people[0].id;

    expect(sourceId).toBe(systemId);
    expect(targetId).toBe(personId);
  });

  test('edge label is visible', async ({ page }) => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 500, y: 200 });
    await app.connectNodes(0, 1);

    const label = await app.canvas.getEdgeLabel(0);
    expect(label.length).toBeGreaterThan(0);
  });

  test('edges have unique IDs', async ({ page }) => {
    await app.createSystemElement({ x: 100, y: 200 });
    await app.createSystemElement({ x: 300, y: 200 });
    await app.createSystemElement({ x: 500, y: 200 });

    await app.connectNodes(0, 1);
    await app.connectNodes(1, 2);

    const { content } = await app.header.exportJson();
    const model = JSON.parse(content);

    const ids = model.relationships.map((r: any) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
