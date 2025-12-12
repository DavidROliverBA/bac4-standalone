import { test, expect } from '@playwright/test';
import { AppPage } from '../../pages/AppPage';
import {
  createTempImportFile,
  cleanupTempFiles,
  createContextModel,
  createContainerModel,
  createStructurizrModel,
} from '../../helpers/fixture-helpers';
import * as path from 'path';
import * as fs from 'fs';

test.describe('Import/Export Roundtrip', () => {
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

  test('export then reimport preserves all data', async ({ page }) => {
    // Create a model with various elements
    await app.header.editTitle('Roundtrip Test');

    await app.createSystemElement({ x: 200, y: 150 });
    await app.canvas.selectNode(0);
    await app.propertiesPanel.setName('System A');
    await app.propertiesPanel.setTechnology('Java');
    await app.propertiesPanel.setDescription('First system');
    await app.propertiesPanel.setTags('test, roundtrip');

    await app.createPersonElement({ x: 400, y: 150 });
    await app.canvas.selectNode(1);
    await app.propertiesPanel.setName('User');

    await app.createExternalSystemElement({ x: 600, y: 150 });
    await app.canvas.selectNode(2);
    await app.propertiesPanel.setName('External');

    await app.connectNodes(0, 1);
    await app.canvas.selectEdge(0);
    await app.propertiesPanel.setEdgeDescription('Interacts with');
    await app.propertiesPanel.setLineStyle('dashed');
    await app.propertiesPanel.setArrowDirection('both');

    await app.connectNodes(0, 2);

    // Export
    const { content, filename } = await app.header.exportJson();
    const originalModel = JSON.parse(content);

    // Clear and reimport
    page.once('dialog', (dialog) => dialog.accept());
    await app.header.clearAllAndConfirm();
    await app.wait(300);

    expect(await app.canvas.isEmpty()).toBe(true);

    // Create temp file and import
    const tempFile = createTempImportFile(originalModel);
    page.once('dialog', (dialog) => dialog.accept());
    await app.header.importFile(tempFile);
    await app.wait(500);

    // Verify all data was restored
    expect(await app.canvas.getNodeCount()).toBe(3);
    expect(await app.canvas.getEdgeCount()).toBe(2);

    // Verify title
    expect(await app.header.getTitle()).toBe('Roundtrip Test');

    // Export again and compare
    const { content: reimportedContent } = await app.header.exportJson();
    const reimportedModel = JSON.parse(reimportedContent);

    // Compare key properties
    expect(reimportedModel.metadata.name).toBe(originalModel.metadata.name);
    expect(reimportedModel.systems.length).toBe(originalModel.systems.length);
    expect(reimportedModel.people.length).toBe(originalModel.people.length);
    expect(reimportedModel.externalSystems.length).toBe(originalModel.externalSystems.length);
    expect(reimportedModel.relationships.length).toBe(originalModel.relationships.length);

    // Verify system properties
    const originalSystem = originalModel.systems[0];
    const reimportedSystem = reimportedModel.systems[0];
    expect(reimportedSystem.name).toBe(originalSystem.name);
    expect(reimportedSystem.technology).toBe(originalSystem.technology);
    expect(reimportedSystem.description).toBe(originalSystem.description);

    // Verify relationship properties
    const originalRel = originalModel.relationships[0];
    const reimportedRel = reimportedModel.relationships[0];
    expect(reimportedRel.description).toBe(originalRel.description);
    expect(reimportedRel.lineStyle).toBe(originalRel.lineStyle);
    expect(reimportedRel.arrowDirection).toBe(originalRel.arrowDirection);
  });

  test('import Structurizr format and export as BAC4', async ({ page }) => {
    // Create Structurizr model
    const structurizrModel = createStructurizrModel();
    const tempFile = createTempImportFile(structurizrModel);

    // Import
    page.once('dialog', (dialog) => dialog.accept());
    await app.header.importFile(tempFile);
    await app.wait(500);

    // Should have imported elements
    expect(await app.canvas.getNodeCount()).toBeGreaterThan(0);

    // Export as BAC4
    const { content } = await app.header.exportJson();
    const bac4Model = JSON.parse(content);

    // Should be valid BAC4 format
    expect(bac4Model).toHaveProperty('metadata');
    expect(bac4Model).toHaveProperty('systems');
    expect(bac4Model).toHaveProperty('people');
    expect(bac4Model).toHaveProperty('relationships');

    // Elements should be preserved
    expect(bac4Model.systems.length).toBeGreaterThan(0);
  });

  test('import BAC4 context model', async ({ page }) => {
    const model = createContextModel('Context Import Test');
    const tempFile = createTempImportFile(model);

    page.once('dialog', (dialog) => dialog.accept());
    await app.header.importFile(tempFile);
    await app.wait(500);

    // Verify counts match fixture
    expect(await app.canvas.getNodeCount()).toBe(3); // 1 system + 1 person + 1 external
    expect(await app.canvas.getEdgeCount()).toBe(2);

    expect(await app.header.getTitle()).toBe('Context Import Test');
  });

  test('import BAC4 container model', async ({ page }) => {
    const model = createContainerModel('Container Import Test');
    const tempFile = createTempImportFile(model);

    page.once('dialog', (dialog) => dialog.accept());
    await app.header.importFile(tempFile);
    await app.wait(500);

    // Container model has more elements
    expect(await app.canvas.getNodeCount()).toBeGreaterThan(3);

    expect(await app.header.getTitle()).toBe('Container Import Test');
  });

  test('export Structurizr format', async ({ page }) => {
    // Create a model
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);
    await app.propertiesPanel.setName('Test System');

    await app.createPersonElement({ x: 500, y: 200 });
    await app.canvas.selectNode(1);
    await app.propertiesPanel.setName('Test User');

    await app.connectNodes(0, 1);

    // Export as Structurizr
    const { content, filename } = await app.header.exportStructurizr();

    expect(filename).toMatch(/structurizr/i);

    const workspace = JSON.parse(content);

    // Verify Structurizr structure
    expect(workspace).toHaveProperty('model');
    expect(workspace.model).toHaveProperty('softwareSystems');
    expect(workspace.model).toHaveProperty('people');

    expect(workspace.model.softwareSystems.length).toBeGreaterThan(0);
    expect(workspace.model.people.length).toBeGreaterThan(0);
  });

  test('export PlantUML and verify syntax', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);
    await app.propertiesPanel.setName('System');

    await app.createPersonElement({ x: 500, y: 200 });
    await app.canvas.selectNode(1);
    await app.propertiesPanel.setName('User');

    await app.connectNodes(0, 1);

    const { content, filename } = await app.header.exportPlantUml();

    expect(filename).toMatch(/\.puml$/);
    expect(content).toContain('@startuml');
    expect(content).toContain('@enduml');
    expect(content).toContain('System');
    expect(content).toContain('User');
  });

  test('import replaces existing model completely', async ({ page }) => {
    // Create initial model
    await app.createSystemElement({ x: 300, y: 200 });
    await app.createSystemElement({ x: 500, y: 200 });
    await app.createSystemElement({ x: 700, y: 200 });

    expect(await app.canvas.getNodeCount()).toBe(3);

    // Import different model (should replace, not merge)
    const model = createContextModel('Replacement Model');
    const tempFile = createTempImportFile(model);

    page.once('dialog', (dialog) => dialog.accept());
    await app.header.importFile(tempFile);
    await app.wait(500);

    // Should have the count from imported model, not original + imported
    expect(await app.canvas.getNodeCount()).toBe(3); // From context model
    expect(await app.header.getTitle()).toBe('Replacement Model');
  });

  test('import preserves element IDs for relationship integrity', async ({ page }) => {
    const model = createContextModel();
    const tempFile = createTempImportFile(model);

    page.once('dialog', (dialog) => dialog.accept());
    await app.header.importFile(tempFile);
    await app.wait(500);

    // Export and check IDs
    const { content } = await app.header.exportJson();
    const exported = JSON.parse(content);

    // Relationships should reference valid element IDs
    const allElementIds = [
      ...exported.systems.map((s: any) => s.id),
      ...exported.people.map((p: any) => p.id),
      ...exported.externalSystems.map((e: any) => e.id),
    ];

    for (const rel of exported.relationships) {
      expect(allElementIds).toContain(rel.from);
      expect(allElementIds).toContain(rel.to);
    }
  });

  test('import fixture file from disk', async ({ page }) => {
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

    expect(await app.canvas.getNodeCount()).toBeGreaterThan(0);
    expect(await app.header.getTitle()).toBe('E-Commerce System');
  });
});
