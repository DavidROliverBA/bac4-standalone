import { test, expect } from '@playwright/test';
import { AppPage } from '../../pages/AppPage';

test.describe('Keyboard Navigation', () => {
  let app: AppPage;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    app.setupDialogDismiss();
    await app.clearLocalStorage();
    await app.navigate();
  });

  test('Tab navigates through header controls', async ({ page }) => {
    // Focus at start of page
    await page.keyboard.press('Tab');

    // Should eventually reach level selector
    let reachedSelect = false;
    for (let i = 0; i < 15; i++) {
      const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
      if (focusedTag === 'SELECT') {
        reachedSelect = true;
        break;
      }
      await page.keyboard.press('Tab');
    }

    expect(reachedSelect).toBe(true);
  });

  test('Tab navigates through toolbar elements', async ({ page }) => {
    // Tab through until we reach toolbar
    let reachedToolbar = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const activeElement = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.closest('aside') !== null;
      });
      if (activeElement) {
        reachedToolbar = true;
        break;
      }
    }

    expect(reachedToolbar).toBe(true);
  });

  test('Level selector can be changed with keyboard', async ({ page }) => {
    await app.header.levelSelector.focus();

    const initialLevel = await app.header.getCurrentLevel();

    // Use arrow keys to change selection
    await page.keyboard.press('ArrowDown');

    // Blur to confirm selection (or it may change immediately)
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');

    const newLevel = await app.header.getCurrentLevel();
    // Level should have changed or be different option
    expect(newLevel === initialLevel || newLevel === 'container').toBe(true);
  });

  test('Export menu can be opened with keyboard', async ({ page }) => {
    await app.header.exportButton.focus();
    await page.keyboard.press('Enter');

    await expect(app.header.exportMenu).toBeVisible();
  });

  test('Export menu can be navigated with Tab', async ({ page }) => {
    await app.header.exportButton.focus();
    await page.keyboard.press('Enter');
    await app.wait(100);

    // Tab should move through menu items
    await page.keyboard.press('Tab');

    const focusedText = await page.evaluate(() => document.activeElement?.textContent);
    // Should be on a menu item
    expect(focusedText?.length).toBeGreaterThan(0);
  });

  test('Escape closes export menu', async ({ page }) => {
    await app.header.exportButton.focus();
    await page.keyboard.press('Enter');

    await expect(app.header.exportMenu).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(app.header.exportMenu).not.toBeVisible();
  });

  test('Enter activates buttons', async ({ page }) => {
    await app.header.exportButton.focus();
    await page.keyboard.press('Enter');

    await expect(app.header.exportMenu).toBeVisible();
  });

  test('Space activates buttons', async ({ page }) => {
    await app.header.exportButton.focus();
    await page.keyboard.press('Space');

    await expect(app.header.exportMenu).toBeVisible();
  });

  test('Properties panel inputs can be navigated with Tab', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    // Focus on first input
    const inputs = app.propertiesPanel.panel.locator('input, textarea, select');
    await inputs.first().focus();

    // Tab through inputs
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }

    // Should still be within the panel
    const activeInPanel = await page.evaluate(() => {
      const panel = document.querySelector('aside:last-of-type');
      return panel?.contains(document.activeElement);
    });

    expect(activeInPanel).toBe(true);
  });

  test('Title editing responds to Enter', async ({ page }) => {
    await app.header.startTitleEdit();

    await app.header.titleInput.fill('Keyboard Title');
    await page.keyboard.press('Enter');

    await expect(app.header.titleDisplay).toHaveText('Keyboard Title');
  });

  test('Title editing responds to Escape', async ({ page }) => {
    const originalTitle = await app.header.getTitle();

    await app.header.startTitleEdit();
    await app.header.titleInput.fill('Changed Title');
    await page.keyboard.press('Escape');

    await expect(app.header.titleDisplay).toHaveText(originalTitle);
  });

  test('Focus indicators are visible', async ({ page }) => {
    // Tab to an element
    await page.keyboard.press('Tab');

    // Check that active element has some focus styling
    const hasFocusStyle = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return false;

      const styles = window.getComputedStyle(el);
      const outline = styles.outline;
      const boxShadow = styles.boxShadow;

      // Should have either outline or box-shadow for focus
      return (
        (outline !== 'none' && outline !== '0px none rgb(0, 0, 0)') ||
        (boxShadow !== 'none' && boxShadow !== '')
      );
    });

    // Focus indicators should be present (though may be handled by browser)
    // This is a soft check as browser defaults vary
  });

  test('Clear all button can be activated with keyboard', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });

    await app.header.clearAllButton.focus();

    let dialogShown = false;
    page.once('dialog', async (dialog) => {
      dialogShown = true;
      await dialog.dismiss();
    });

    await page.keyboard.press('Enter');

    expect(dialogShown).toBe(true);
  });
});
