import { Page, expect } from '@playwright/test';
import { AppPage } from '../pages/AppPage';

/**
 * Common test helper utilities
 */

/**
 * Wait for the canvas to be ready
 */
export async function waitForCanvasReady(page: Page): Promise<void> {
  await expect(page.locator('.react-flow')).toBeVisible();
  await page.waitForTimeout(500);
}

/**
 * Create a system element at the specified position
 */
export async function createSystemElement(
  page: Page,
  position: { x: number; y: number }
): Promise<void> {
  const app = new AppPage(page);
  await app.createSystemElement(position);
}

/**
 * Create a person element at the specified position
 */
export async function createPersonElement(
  page: Page,
  position: { x: number; y: number }
): Promise<void> {
  const app = new AppPage(page);
  await app.createPersonElement(position);
}

/**
 * Create two connected nodes for edge testing
 */
export async function createTwoConnectedNodes(page: Page): Promise<void> {
  const app = new AppPage(page);
  await app.createSystemElement({ x: 200, y: 200 });
  await app.createSystemElement({ x: 500, y: 200 });
  await app.connectNodes(0, 1);
}

/**
 * Setup to dismiss restore dialogs
 */
export function dismissRestoreDialog(page: Page): void {
  page.on('dialog', dialog => dialog.dismiss());
}

/**
 * Setup to accept restore dialogs
 */
export function acceptRestoreDialog(page: Page): void {
  page.on('dialog', dialog => dialog.accept());
}

/**
 * Get the number of nodes on canvas
 */
export async function getNodeCount(page: Page): Promise<number> {
  return await page.locator('.react-flow__node').count();
}

/**
 * Get the number of edges on canvas
 */
export async function getEdgeCount(page: Page): Promise<number> {
  return await page.locator('.react-flow__edge').count();
}

/**
 * Capture a file download and return its content
 */
export async function captureDownload(
  page: Page,
  triggerAction: () => Promise<void>
): Promise<{ filename: string; content: string }> {
  const downloadPromise = page.waitForEvent('download');
  await triggerAction();
  const download = await downloadPromise;

  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  if (stream) {
    for await (const chunk of stream) {
      chunks.push(chunk as Buffer);
    }
  }

  return {
    filename: download.suggestedFilename(),
    content: Buffer.concat(chunks).toString('utf-8'),
  };
}

/**
 * Clear local storage and reload
 */
export async function clearAndReload(page: Page): Promise<void> {
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  dismissRestoreDialog(page);
  await waitForCanvasReady(page);
}

/**
 * Verify canvas has expected element counts
 */
export async function verifyElementCounts(
  page: Page,
  expectedNodes: number,
  expectedEdges: number
): Promise<void> {
  const nodeCount = await getNodeCount(page);
  const edgeCount = await getEdgeCount(page);
  expect(nodeCount).toBe(expectedNodes);
  expect(edgeCount).toBe(expectedEdges);
}

/**
 * Wait for any animations to complete
 */
export async function waitForAnimations(page: Page): Promise<void> {
  await page.waitForTimeout(300);
}

/**
 * Get current model from local storage
 */
export async function getModelFromLocalStorage(page: Page): Promise<any | null> {
  const data = await page.evaluate(() => localStorage.getItem('c4-model-autosave'));
  return data ? JSON.parse(data) : null;
}

/**
 * Set model in local storage
 */
export async function setModelInLocalStorage(page: Page, model: any): Promise<void> {
  await page.evaluate((m) => {
    localStorage.setItem('c4-model-autosave', JSON.stringify(m));
  }, model);
}
