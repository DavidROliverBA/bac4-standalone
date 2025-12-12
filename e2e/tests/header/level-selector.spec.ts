import { test, expect } from '@playwright/test';
import { AppPage } from '../../pages/AppPage';

test.describe('Level Selector', () => {
  let app: AppPage;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    app.setupDialogDismiss();
    await app.clearLocalStorage();
    await app.navigate();
  });

  test('shows all four C4 levels', async () => {
    const levels = await app.header.getAvailableLevels();
    expect(levels).toEqual(['Context', 'Container', 'Component', 'Code']);
  });

  test('default level is context', async () => {
    const level = await app.header.getCurrentLevel();
    expect(level).toBe('context');
  });

  test('changing level without elements works immediately', async () => {
    // Canvas should be empty
    expect(await app.canvas.isEmpty()).toBe(true);

    // Change to container level
    await app.header.selectLevel('container');

    // Should change immediately without confirmation
    const level = await app.header.getCurrentLevel();
    expect(level).toBe('container');
  });

  test('changing level updates toolbar elements - context to container', async () => {
    // Initially at context - should NOT have container
    expect(await app.toolbar.isElementVisible('container')).toBe(false);

    // Change to container level
    await app.header.selectLevel('container');

    // Should now have container element
    expect(await app.toolbar.isElementVisible('container')).toBe(true);
  });

  test('changing level updates toolbar elements - container to component', async () => {
    await app.header.selectLevel('container');

    // Should have system but not component
    expect(await app.toolbar.isElementVisible('system')).toBe(true);
    expect(await app.toolbar.isElementVisible('component')).toBe(false);

    // Change to component level
    await app.header.selectLevel('component');

    // Should have component but not system
    expect(await app.toolbar.isElementVisible('component')).toBe(true);
    expect(await app.toolbar.isElementVisible('system')).toBe(false);
  });

  test('code level shows only component', async () => {
    await app.header.selectLevel('code');

    const visibleTypes = await app.toolbar.getVisibleElementTypes();
    expect(visibleTypes).toEqual(['component']);
  });

  test('changing level with elements shows confirmation dialog', async ({ page }) => {
    // Create an element first
    await app.createSystemElement({ x: 300, y: 200 });

    // Set up dialog handler to capture the message
    let dialogMessage = '';
    page.once('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    // Try to change level
    await app.header.selectLevel('container');

    // Verify confirmation was shown
    expect(dialogMessage).toContain('clear all elements');
  });

  test('accepting level change confirmation clears canvas', async ({ page }) => {
    // Create elements
    await app.createSystemElement({ x: 300, y: 200 });
    await app.createPersonElement({ x: 500, y: 200 });
    expect(await app.canvas.getNodeCount()).toBe(2);

    // Accept the dialog
    page.once('dialog', (dialog) => dialog.accept());

    // Change level
    await app.header.selectLevel('container');

    // Canvas should be cleared
    await app.wait(300);
    expect(await app.canvas.getNodeCount()).toBe(0);
  });

  test('cancelling level change keeps current level', async ({ page }) => {
    // Create an element
    await app.createSystemElement({ x: 300, y: 200 });

    // Dismiss the dialog
    page.once('dialog', (dialog) => dialog.dismiss());

    // Try to change level
    await app.header.selectLevel('container');

    // Should still be at context level
    const level = await app.header.getCurrentLevel();
    expect(level).toBe('context');

    // Element should still exist
    expect(await app.canvas.getNodeCount()).toBe(1);
  });

  test('level change updates toolbar label', async () => {
    // Check initial label
    let label = await app.toolbar.getCurrentLevelDisplay();
    expect(label).toContain('Context');

    // Change to container
    await app.header.selectLevel('container');
    label = await app.toolbar.getCurrentLevelDisplay();
    expect(label).toContain('Container');

    // Change to component
    await app.header.selectLevel('component');
    label = await app.toolbar.getCurrentLevelDisplay();
    expect(label).toContain('Component');

    // Change to code
    await app.header.selectLevel('code');
    label = await app.toolbar.getCurrentLevelDisplay();
    expect(label).toContain('Code');
  });

  test('elements correct for each level', async () => {
    // Context level
    await app.toolbar.verifyElementsForLevel('context');

    // Container level
    await app.header.selectLevel('container');
    await app.toolbar.verifyElementsForLevel('container');

    // Component level
    await app.header.selectLevel('component');
    await app.toolbar.verifyElementsForLevel('component');

    // Code level
    await app.header.selectLevel('code');
    await app.toolbar.verifyElementsForLevel('code');
  });
});
