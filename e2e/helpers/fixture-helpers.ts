import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Test fixture and data management utilities
 */

const FIXTURES_PATH = path.join(__dirname, '..', 'fixtures', 'models');

/**
 * Load a fixture file by name
 */
export function loadFixture(fixtureName: string): any {
  const fixturePath = path.join(FIXTURES_PATH, fixtureName);
  const content = fs.readFileSync(fixturePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Check if a fixture file exists
 */
export function fixtureExists(fixtureName: string): boolean {
  const fixturePath = path.join(FIXTURES_PATH, fixtureName);
  return fs.existsSync(fixturePath);
}

/**
 * Save a fixture file
 */
export function saveFixture(fixtureName: string, data: any): void {
  const fixturePath = path.join(FIXTURES_PATH, fixtureName);
  fs.writeFileSync(fixturePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Import a model via local storage
 */
export async function importModelViaLocalStorage(page: Page, model: any): Promise<void> {
  await page.evaluate((modelData) => {
    localStorage.setItem('c4-model-autosave', JSON.stringify(modelData));
  }, model);
}

/**
 * Clear model from local storage
 */
export async function clearModelFromLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.removeItem('c4-model-autosave');
  });
}

/**
 * Get the current model from local storage
 */
export async function getModelFromLocalStorage(page: Page): Promise<any | null> {
  const data = await page.evaluate(() => {
    return localStorage.getItem('c4-model-autosave');
  });
  return data ? JSON.parse(data) : null;
}

/**
 * Setup a test model by loading from fixture and importing via local storage
 */
export async function setupTestModel(page: Page, modelName: string): Promise<void> {
  const model = loadFixture(`${modelName}.json`);
  await importModelViaLocalStorage(page, model);
  await page.reload();
  // Accept restore dialog if shown
  page.on('dialog', dialog => dialog.accept());
}

/**
 * Create a temp file for import testing
 */
export function createTempImportFile(data: any): string {
  const tempDir = path.join(__dirname, '..', 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const tempFile = path.join(tempDir, `import-${Date.now()}.json`);
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  return tempFile;
}

/**
 * Clean up temp files
 */
export function cleanupTempFiles(): void {
  const tempDir = path.join(__dirname, '..', 'temp');
  if (fs.existsSync(tempDir)) {
    const files = fs.readdirSync(tempDir);
    for (const file of files) {
      fs.unlinkSync(path.join(tempDir, file));
    }
  }
}

/**
 * Generate a basic empty model
 */
export function createEmptyModel(name: string = 'Test Model'): any {
  return {
    metadata: {
      name,
      version: '1.0',
      author: 'Test',
    },
    systems: [],
    containers: [],
    components: [],
    people: [],
    externalSystems: [],
    relationships: [],
  };
}

/**
 * Generate a context level model with basic elements
 */
export function createContextModel(name: string = 'Context Test'): any {
  return {
    metadata: {
      name,
      version: '1.0',
      author: 'Test',
    },
    systems: [
      {
        id: 'system-1',
        type: 'system',
        name: 'Main System',
        description: 'The main system',
        technology: 'Node.js',
        tags: ['critical'],
        position: { x: 400, y: 200 },
      },
    ],
    containers: [],
    components: [],
    people: [
      {
        id: 'person-1',
        type: 'person',
        name: 'User',
        description: 'A user',
        technology: '',
        tags: [],
        position: { x: 200, y: 100 },
      },
    ],
    externalSystems: [
      {
        id: 'external-1',
        type: 'externalSystem',
        name: 'External API',
        description: 'External service',
        technology: 'REST',
        tags: ['external'],
        position: { x: 600, y: 300 },
      },
    ],
    relationships: [
      {
        id: 'rel-1',
        from: 'person-1',
        to: 'system-1',
        description: 'Uses',
        technology: 'HTTPS',
        arrowDirection: 'right',
        lineStyle: 'solid',
      },
      {
        id: 'rel-2',
        from: 'system-1',
        to: 'external-1',
        description: 'Calls',
        technology: 'REST/HTTPS',
        arrowDirection: 'right',
        lineStyle: 'solid',
      },
    ],
  };
}

/**
 * Generate a container level model
 */
export function createContainerModel(name: string = 'Container Test'): any {
  return {
    metadata: {
      name,
      version: '1.0',
      author: 'Test',
    },
    systems: [
      {
        id: 'system-1',
        type: 'system',
        name: 'Application',
        description: 'Main application',
        technology: '',
        tags: [],
        position: { x: 400, y: 50 },
      },
    ],
    containers: [
      {
        id: 'container-1',
        type: 'container',
        name: 'Web App',
        description: 'Frontend application',
        technology: 'React',
        tags: ['frontend'],
        position: { x: 200, y: 200 },
      },
      {
        id: 'container-2',
        type: 'container',
        name: 'API',
        description: 'Backend API',
        technology: 'Node.js',
        tags: ['backend'],
        position: { x: 400, y: 200 },
      },
      {
        id: 'container-3',
        type: 'container',
        name: 'Database',
        description: 'Data storage',
        technology: 'PostgreSQL',
        tags: ['database'],
        position: { x: 600, y: 200 },
      },
    ],
    components: [],
    people: [
      {
        id: 'person-1',
        type: 'person',
        name: 'User',
        description: 'Application user',
        technology: '',
        tags: [],
        position: { x: 100, y: 100 },
      },
    ],
    externalSystems: [],
    relationships: [
      {
        id: 'rel-1',
        from: 'person-1',
        to: 'container-1',
        description: 'Uses',
        technology: 'HTTPS',
        arrowDirection: 'right',
        lineStyle: 'solid',
      },
      {
        id: 'rel-2',
        from: 'container-1',
        to: 'container-2',
        description: 'Calls',
        technology: 'REST',
        arrowDirection: 'right',
        lineStyle: 'solid',
      },
      {
        id: 'rel-3',
        from: 'container-2',
        to: 'container-3',
        description: 'Reads/Writes',
        technology: 'SQL',
        arrowDirection: 'right',
        lineStyle: 'solid',
      },
    ],
  };
}

/**
 * Generate a Structurizr workspace format model for import testing
 */
export function createStructurizrModel(): any {
  return {
    id: 1,
    name: 'Test Workspace',
    description: 'Test workspace for import',
    model: {
      people: [
        {
          id: '1',
          name: 'User',
          description: 'A user of the system',
          tags: 'Person',
          relationships: [
            {
              sourceId: '1',
              destinationId: '2',
              description: 'Uses',
            },
          ],
        },
      ],
      softwareSystems: [
        {
          id: '2',
          name: 'System',
          description: 'The main system',
          tags: 'Software System',
          containers: [],
          relationships: [],
        },
      ],
    },
    views: {
      systemLandscapeViews: [],
      systemContextViews: [],
      containerViews: [],
      componentViews: [],
    },
  };
}

/**
 * Verify model structure is valid
 */
export function isValidModel(model: any): boolean {
  if (!model || typeof model !== 'object') return false;
  if (!model.metadata || !model.metadata.name) return false;
  if (!Array.isArray(model.systems)) return false;
  if (!Array.isArray(model.containers)) return false;
  if (!Array.isArray(model.components)) return false;
  if (!Array.isArray(model.people)) return false;
  if (!Array.isArray(model.externalSystems)) return false;
  if (!Array.isArray(model.relationships)) return false;
  return true;
}

/**
 * Count total elements in a model
 */
export function countModelElements(model: any): number {
  return (
    (model.systems?.length || 0) +
    (model.containers?.length || 0) +
    (model.components?.length || 0) +
    (model.people?.length || 0) +
    (model.externalSystems?.length || 0)
  );
}
