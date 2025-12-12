import { test, expect } from '@playwright/test';
import { AppPage } from '../../pages/AppPage';

test.describe('Context Diagram Workflow', () => {
  let app: AppPage;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    app.setupDialogDismiss();
    await app.clearLocalStorage();
    await app.navigate();
  });

  test('complete context diagram creation workflow', async ({ page }) => {
    // Step 1: Set a custom title
    await app.header.editTitle('Online Banking System');
    await expect(app.header.titleDisplay).toHaveText('Online Banking System');

    // Step 2: Create Person (Customer)
    await app.createPersonElement({ x: 200, y: 100 });
    await app.canvas.selectNode(0);
    await app.propertiesPanel.setName('Customer');
    await app.propertiesPanel.setDescription('A customer who uses online banking services');

    // Step 3: Create Main System
    await app.createSystemElement({ x: 400, y: 250 });
    await app.canvas.selectNode(1);
    await app.propertiesPanel.setName('Internet Banking System');
    await app.propertiesPanel.setTechnology('Java, Spring Boot');
    await app.propertiesPanel.setDescription('Provides online banking functionality');
    await app.propertiesPanel.setTags('critical, production');

    // Step 4: Create External Systems
    await app.createExternalSystemElement({ x: 650, y: 150 });
    await app.canvas.selectNode(2);
    await app.propertiesPanel.setName('Email Service');
    await app.propertiesPanel.setTechnology('SendGrid');
    await app.propertiesPanel.setDescription('External email notification service');

    await app.createExternalSystemElement({ x: 650, y: 350 });
    await app.canvas.selectNode(3);
    await app.propertiesPanel.setName('Core Banking System');
    await app.propertiesPanel.setTechnology('IBM Mainframe');
    await app.propertiesPanel.setDescription('Legacy banking system');

    // Step 5: Create Relationships
    // Customer -> Internet Banking
    await app.connectNodes(0, 1);
    await app.canvas.selectEdge(0);
    await app.propertiesPanel.setEdgeDescription('Views account balances and makes payments');
    await app.propertiesPanel.setEdgeTechnology('HTTPS');

    // Internet Banking -> Email Service
    await app.connectNodes(1, 2);
    await app.canvas.selectEdge(1);
    await app.propertiesPanel.setEdgeDescription('Sends notifications via');
    await app.propertiesPanel.setEdgeTechnology('REST API');
    await app.propertiesPanel.setLineStyle('dashed');

    // Internet Banking -> Core Banking
    await app.connectNodes(1, 3);
    await app.canvas.selectEdge(2);
    await app.propertiesPanel.setEdgeDescription('Gets account data from');
    await app.propertiesPanel.setEdgeTechnology('XML/HTTPS');

    // Step 6: Apply Layout
    await app.header.applyHierarchicalLayout();
    await app.wait(500);

    // Step 7: Verify final state
    expect(await app.canvas.getNodeCount()).toBe(4);
    expect(await app.canvas.getEdgeCount()).toBe(3);

    // Step 8: Export and verify
    const { content, filename } = await app.header.exportJson();
    const model = JSON.parse(content);

    expect(filename.toLowerCase()).toContain('online-banking');
    expect(model.metadata.name).toBe('Online Banking System');
    expect(model.systems.length).toBe(1);
    expect(model.people.length).toBe(1);
    expect(model.externalSystems.length).toBe(2);
    expect(model.relationships.length).toBe(3);

    // Verify system properties
    const system = model.systems[0];
    expect(system.name).toBe('Internet Banking System');
    expect(system.technology).toBe('Java, Spring Boot');

    // Verify relationships
    const rel = model.relationships.find((r: any) => r.description.includes('notifications'));
    expect(rel.lineStyle).toBe('dashed');
  });

  test('edit and update existing diagram', async ({ page }) => {
    // Create initial diagram
    await app.createSimpleContextDiagram();

    // Verify initial state
    expect(await app.canvas.getNodeCount()).toBe(3);
    expect(await app.canvas.getEdgeCount()).toBe(2);

    // Edit an element
    await app.canvas.selectNode(1); // System
    await app.propertiesPanel.setName('Updated System');
    await app.propertiesPanel.setTechnology('Python, FastAPI');

    // Edit a relationship
    await app.canvas.selectEdge(0);
    await app.propertiesPanel.setEdgeDescription('Updated relationship');
    await app.propertiesPanel.setArrowDirection('both');

    // Add another element
    await app.createExternalSystemElement({ x: 200, y: 400 });
    await app.canvas.selectNode(3);
    await app.propertiesPanel.setName('New External Service');

    // Connect it
    await app.connectNodes(1, 3);

    // Verify updates
    expect(await app.canvas.getNodeCount()).toBe(4);
    expect(await app.canvas.getEdgeCount()).toBe(3);

    // Export and verify
    const { content } = await app.header.exportJson();
    const model = JSON.parse(content);

    const system = model.systems[0];
    expect(system.name).toBe('Updated System');
    expect(system.technology).toBe('Python, FastAPI');

    const updatedRel = model.relationships.find((r: any) =>
      r.description === 'Updated relationship'
    );
    expect(updatedRel).toBeDefined();
    expect(updatedRel.arrowDirection).toBe('both');
  });

  test('delete and recreate elements', async ({ page }) => {
    // Create diagram
    await app.createSystemElement({ x: 300, y: 200 });
    await app.createPersonElement({ x: 500, y: 200 });
    await app.connectNodes(0, 1);

    expect(await app.canvas.getNodeCount()).toBe(2);
    expect(await app.canvas.getEdgeCount()).toBe(1);

    // Delete element (should cascade to edge)
    await app.canvas.selectNode(0);
    page.once('dialog', (dialog) => dialog.accept());
    await app.propertiesPanel.clickDelete();
    await app.wait(300);

    expect(await app.canvas.getNodeCount()).toBe(1);
    expect(await app.canvas.getEdgeCount()).toBe(0);

    // Recreate
    await app.createSystemElement({ x: 300, y: 200 });
    await app.connectNodes(0, 1);

    expect(await app.canvas.getNodeCount()).toBe(2);
    expect(await app.canvas.getEdgeCount()).toBe(1);
  });

  test('workflow with all element types at context level', async ({ page }) => {
    // Add one of each context-level type
    await app.createSystemElement({ x: 200, y: 100 });
    await app.canvas.selectNode(0);
    await app.propertiesPanel.setName('Main System');

    await app.createPersonElement({ x: 400, y: 100 });
    await app.canvas.selectNode(1);
    await app.propertiesPanel.setName('User');

    await app.createExternalSystemElement({ x: 600, y: 100 });
    await app.canvas.selectNode(2);
    await app.propertiesPanel.setName('External API');

    // Connect all to main system
    await app.connectNodes(1, 0); // User -> System
    await app.connectNodes(0, 2); // System -> External

    // Verify
    expect(await app.canvas.getNodeCount()).toBe(3);
    expect(await app.canvas.getEdgeCount()).toBe(2);

    const labels = await app.canvas.getAllNodeLabels();
    expect(labels).toContain('Main System');
    expect(labels).toContain('User');
    expect(labels).toContain('External API');
  });
});
