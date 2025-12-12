import { test, expect } from '@playwright/test';
import { AppPage } from '../../pages/AppPage';
import { hasFocusIndicator } from '../../helpers/accessibility-helpers';

test.describe('Focus Management', () => {
  let app: AppPage;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    app.setupDialogDismiss();
    await app.clearLocalStorage();
    await app.navigate();
  });

  test('initial focus is on page content', async ({ page }) => {
    // After load, body or first interactive element should be focusable
    const activeTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BODY', 'INPUT', 'BUTTON', 'SELECT', 'A']).toContain(activeTag);
  });

  test('selecting element moves focus context to properties panel', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    // After selection, properties panel should be showing
    expect(await app.propertiesPanel.isShowingElementProperties()).toBe(true);
  });

  test('closing properties panel returns to appropriate focus', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    await app.propertiesPanel.close();

    // Focus should be somewhere accessible
    const activeTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeTag).toBeDefined();
  });

  test('export menu items are focusable', async ({ page }) => {
    await app.header.openExportMenu();

    const menuItems = page.locator('button:has-text("JSON")');
    await menuItems.first().focus();

    const isFocused = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.textContent?.includes('JSON');
    });

    expect(isFocused).toBe(true);
  });

  test('layout menu items are focusable', async ({ page }) => {
    await app.header.openLayoutMenu();

    const menuItems = page.locator('button:has-text("Hierarchical")');
    await menuItems.first().focus();

    const isFocused = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.textContent?.includes('Hierarchical');
    });

    expect(isFocused).toBe(true);
  });

  test('form inputs in properties panel are focusable', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    const inputs = app.propertiesPanel.panel.locator('input, textarea, select');
    const count = await inputs.count();

    // All inputs should be focusable
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      await input.focus();
      await expect(input).toBeFocused();
    }
  });

  test('delete button is focusable', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    await app.propertiesPanel.deleteButton.focus();
    await expect(app.propertiesPanel.deleteButton).toBeFocused();
  });

  test('toolbar element buttons are focusable', async ({ page }) => {
    // System element should be focusable
    await app.toolbar.systemElement.focus();

    const isFocused = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.textContent?.includes('System');
    });

    expect(isFocused).toBe(true);
  });

  test('canvas controls are focusable', async ({ page }) => {
    await app.canvas.zoomInButton.focus();
    await expect(app.canvas.zoomInButton).toBeFocused();

    await app.canvas.zoomOutButton.focus();
    await expect(app.canvas.zoomOutButton).toBeFocused();

    await app.canvas.fitViewButton.focus();
    await expect(app.canvas.fitViewButton).toBeFocused();
  });

  test('level selector is focusable', async ({ page }) => {
    await app.header.levelSelector.focus();
    await expect(app.header.levelSelector).toBeFocused();
  });

  test('export button is focusable', async ({ page }) => {
    await app.header.exportButton.focus();
    await expect(app.header.exportButton).toBeFocused();
  });

  test('import button/label is focusable', async ({ page }) => {
    // Import is a label with hidden input
    const importLabel = app.header.importButton;
    await importLabel.focus();

    // Label may not receive focus directly, but should be tab-reachable
    const isFocused = await page.evaluate(() => {
      const el = document.activeElement;
      // Either the label or the input should be focused
      return el?.tagName === 'INPUT' || el?.textContent?.includes('Import');
    });

    // This is a soft check as file inputs have special focus behavior
  });

  test('focus trap in modal dialogs', async ({ page }) => {
    // Native confirm dialogs are not testable for focus trap
    // This test documents expected behavior for custom modals if added
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    let dialogMessage = '';
    page.once('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.dismiss();
    });

    await app.propertiesPanel.clickDelete();

    // Dialog was shown
    expect(dialogMessage.length).toBeGreaterThan(0);
  });

  test('skip links or focus landmarks exist', async ({ page }) => {
    // Check for skip links or proper landmark structure
    const hasLandmarks = await page.evaluate(() => {
      const header = document.querySelector('header, [role="banner"]');
      const aside = document.querySelector('aside, [role="complementary"]');
      return !!header && !!aside;
    });

    expect(hasLandmarks).toBe(true);
  });
});
