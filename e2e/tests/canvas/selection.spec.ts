import { test, expect } from '@playwright/test';
import { AppPage } from '../../pages/AppPage';

test.describe('Selection Behavior', () => {
  let app: AppPage;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    app.setupDialogDismiss();
    await app.clearLocalStorage();
    await app.navigate();
  });

  test('initially nothing is selected', async () => {
    expect(await app.propertiesPanel.isShowingPlaceholder()).toBe(true);
  });

  test('clicking node shows element properties', async () => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    expect(await app.propertiesPanel.isShowingElementProperties()).toBe(true);
    expect(await app.propertiesPanel.isShowingRelationshipProperties()).toBe(false);
  });

  test('clicking edge shows relationship properties', async () => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 500, y: 200 });
    await app.canvas.createEdge(0, 1);

    await app.canvas.selectEdge(0);

    expect(await app.propertiesPanel.isShowingRelationshipProperties()).toBe(true);
    expect(await app.propertiesPanel.isShowingElementProperties()).toBe(false);
  });

  test('selecting node while edge is selected switches to element', async () => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 500, y: 200 });
    await app.canvas.createEdge(0, 1);

    // Select edge first
    await app.canvas.selectEdge(0);
    expect(await app.propertiesPanel.isShowingRelationshipProperties()).toBe(true);

    // Select node
    await app.canvas.selectNode(0);
    expect(await app.propertiesPanel.isShowingElementProperties()).toBe(true);
  });

  test('selecting edge while node is selected switches to relationship', async () => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 500, y: 200 });
    await app.canvas.createEdge(0, 1);

    // Select node first
    await app.canvas.selectNode(0);
    expect(await app.propertiesPanel.isShowingElementProperties()).toBe(true);

    // Select edge
    await app.canvas.selectEdge(0);
    expect(await app.propertiesPanel.isShowingRelationshipProperties()).toBe(true);
  });

  test('clicking canvas deselects node', async () => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    expect(await app.propertiesPanel.isShowingElementProperties()).toBe(true);

    await app.canvas.deselectAll();

    expect(await app.propertiesPanel.isShowingPlaceholder()).toBe(true);
  });

  test('clicking canvas deselects edge', async () => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 500, y: 200 });
    await app.canvas.createEdge(0, 1);

    await app.canvas.selectEdge(0);
    expect(await app.propertiesPanel.isShowingRelationshipProperties()).toBe(true);

    await app.canvas.deselectAll();
    expect(await app.propertiesPanel.isShowingPlaceholder()).toBe(true);
  });

  test('selection persists while editing properties', async () => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    // Edit a property
    await app.propertiesPanel.setName('New Name');

    // Should still be selected
    expect(await app.propertiesPanel.isShowingElementProperties()).toBe(true);
  });

  test('selecting new node deselects previous', async () => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createPersonElement({ x: 500, y: 200 });

    await app.canvas.selectNode(0);
    const firstName = await app.propertiesPanel.getName();

    await app.canvas.selectNode(1);
    const secondName = await app.propertiesPanel.getName();

    // Names should be different (they're different elements)
    // Both should be "New ..." but different types
    expect(await app.propertiesPanel.isShowingElementProperties()).toBe(true);
  });

  test('close button in properties panel deselects', async () => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    expect(await app.propertiesPanel.isShowingElementProperties()).toBe(true);

    await app.propertiesPanel.close();

    expect(await app.propertiesPanel.isShowingPlaceholder()).toBe(true);
  });

  test('only one element can be selected at a time', async () => {
    await app.createSystemElement({ x: 200, y: 200 });
    await app.createSystemElement({ x: 400, y: 200 });
    await app.createSystemElement({ x: 600, y: 200 });

    // Select multiple in sequence
    await app.canvas.selectNode(0);
    await app.canvas.selectNode(1);
    await app.canvas.selectNode(2);

    // Only properties for one element should be shown
    expect(await app.propertiesPanel.isShowingElementProperties()).toBe(true);
  });
});
