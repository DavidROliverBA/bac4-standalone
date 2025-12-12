import { chromium } from '@playwright/test';
import path from 'path';

/**
 * Generate a component diagram screenshot showing BAC4's internal architecture
 * Uses container level to have access to both Container and Component elements
 */
async function generateArchitectureDiagram() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  const page = await context.newPage();

  // Handle dialogs
  page.on('dialog', dialog => dialog.accept());

  // Navigate
  await page.goto('http://localhost:5173/bac4-standalone.html');
  await page.waitForSelector('.react-flow');
  await page.waitForTimeout(1000);

  // Clear and reload
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  page.on('dialog', dialog => dialog.accept());
  await page.waitForSelector('.react-flow');
  await page.waitForTimeout(500);

  // Use container level - has Container visible
  await page.locator('select').first().selectOption('container');
  await page.waitForTimeout(500);

  // Find available draggable elements
  const toolbar = page.locator('aside.w-64');
  const draggables = toolbar.locator('div[draggable="true"]');
  const count = await draggables.count();
  console.log(`Found ${count} draggable elements`);

  // Log available elements
  for (let i = 0; i < count; i++) {
    const text = await draggables.nth(i).textContent();
    console.log(`  - ${text}`);
  }

  // Drag helper using index
  const dragByIndex = async (index: number, targetX: number, targetY: number) => {
    const item = draggables.nth(index);
    await item.dragTo(page.locator('.react-flow'), {
      targetPosition: { x: targetX, y: targetY }
    });
    await page.waitForTimeout(400);
  };

  // At container level: Software System (0), Container (1), Person (2), External System (3)
  // Create architecture diagram
  // Row 1: Main system container
  await dragByIndex(0, 500, 50);  // Software System - React App

  // Row 2: UI containers (3)
  await dragByIndex(1, 150, 180);  // Container - Toolbar
  await dragByIndex(1, 450, 180);  // Container - Canvas
  await dragByIndex(1, 750, 180);  // Container - Properties Panel

  // Row 3: Central state
  await dragByIndex(1, 450, 350);  // Container - Zustand Store

  // Row 4: Utilities (3)
  await dragByIndex(1, 150, 500);  // Container - Auto-Layout
  await dragByIndex(1, 450, 500);  // Container - Export Utils
  await dragByIndex(1, 750, 500);  // Container - localStorage

  await page.waitForTimeout(500);

  // Update names
  const nodes = page.locator('.react-flow__node');
  const names = [
    ['React 19 App', 'Application Container'],
    ['Toolbar', 'Element Palette'],
    ['React Flow Canvas', 'Diagram Editor'],
    ['Properties Panel', 'Element Editor'],
    ['Zustand Store', 'State Management'],
    ['Auto-Layout', 'dagre / elkjs'],
    ['Export Utils', 'JSON / PlantUML / Mermaid'],
    ['localStorage Hook', 'Browser Persistence']
  ];

  for (let i = 0; i < names.length; i++) {
    await nodes.nth(i).click();
    await page.waitForTimeout(200);

    const panel = page.locator('aside.w-80');
    const nameInput = panel.locator('input').first();
    await nameInput.clear();
    await nameInput.fill(names[i][0]);

    // Technology field
    const techInput = panel.locator('input').nth(1);
    if (await techInput.isVisible().catch(() => false)) {
      await techInput.clear();
      await techInput.fill(names[i][1]);
    }
    await page.waitForTimeout(100);
  }

  // Deselect
  await page.locator('.react-flow__pane').click();
  await page.waitForTimeout(200);

  // Create connections via store
  const connect = async (from: number, to: number) => {
    const sourceId = await page.evaluate((idx) => {
      const n = document.querySelectorAll('.react-flow__node');
      return n[idx]?.getAttribute('data-id');
    }, from);
    const targetId = await page.evaluate((idx) => {
      const n = document.querySelectorAll('.react-flow__node');
      return n[idx]?.getAttribute('data-id');
    }, to);

    if (sourceId && targetId) {
      await page.evaluate(({ s, t }) => {
        const fn = (window as any).__CREATE_CONNECTION__;
        if (fn) fn({ source: s, target: t });
      }, { s: sourceId, t: targetId });
      await page.waitForTimeout(100);
    }
  };

  // UI horizontal connections
  await connect(1, 2);  // Toolbar -> Canvas
  await connect(2, 3);  // Canvas -> Properties

  // UI to Store
  await connect(1, 4);  // Toolbar -> Store
  await connect(2, 4);  // Canvas -> Store
  await connect(3, 4);  // Properties -> Store

  // Store to utilities
  await connect(4, 5);  // Store -> Layout
  await connect(4, 6);  // Store -> Export
  await connect(4, 7);  // Store -> localStorage

  await page.waitForTimeout(400);

  // Layout
  await page.locator('button:has-text("Layout")').click();
  await page.waitForTimeout(200);
  await page.locator('button:has-text("Hierarchical")').click();
  await page.waitForTimeout(600);

  // Fit view
  await page.keyboard.press('f');  // Shortcut if available
  await page.waitForTimeout(200);

  // Update title via double-click
  const titleArea = page.locator('header').locator('span.cursor-pointer, [class*="cursor-pointer"]').first();
  if (await titleArea.isVisible().catch(() => false)) {
    await titleArea.dblclick();
    await page.waitForTimeout(100);
    const input = page.locator('header input[type="text"]');
    if (await input.isVisible()) {
      await input.fill('BAC4 Component Architecture');
      await input.press('Enter');
    }
  }
  await page.waitForTimeout(200);

  // Clear selection
  await page.locator('.react-flow__pane').click();
  await page.waitForTimeout(300);

  // Screenshot
  await page.screenshot({
    path: path.resolve(__dirname, '../docs/screenshots/bac4-component-architecture.png'),
  });

  console.log('Screenshot saved!');
  await browser.close();
}

generateArchitectureDiagram().catch(console.error);
