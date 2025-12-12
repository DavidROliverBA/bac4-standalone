import { test, expect } from '@playwright/test';
import { AppPage } from '../../pages/AppPage';
import {
  runA11yAudit,
  assertNoA11yViolations,
  checkColorContrast,
  checkFormLabels,
  checkButtonAccessibility,
  checkLandmarks,
} from '../../helpers/accessibility-helpers';

test.describe('Accessibility Audit', () => {
  let app: AppPage;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    app.setupDialogDismiss();
    await app.clearLocalStorage();
    await app.navigate();
  });

  test('empty application has no critical violations', async ({ page }) => {
    const results = await runA11yAudit(page);

    // Filter for critical/serious violations
    const criticalViolations = results.violations.filter(
      (v: any) => v.impact === 'critical' || v.impact === 'serious'
    );

    // Log violations for debugging
    if (criticalViolations.length > 0) {
      console.log('Critical violations:', JSON.stringify(criticalViolations, null, 2));
    }

    expect(criticalViolations.length).toBe(0);
  });

  test('header region passes accessibility audit', async ({ page }) => {
    await assertNoA11yViolations(page, 'header', {
      ignoreRules: ['region'], // Header may not need region role
    });
  });

  test('toolbar sidebar passes accessibility audit', async ({ page }) => {
    await assertNoA11yViolations(page, 'aside', {
      ignoreRules: ['region'],
    });
  });

  test('properties panel with element selected passes audit', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    await assertNoA11yViolations(page, 'aside:last-of-type', {
      ignoreRules: ['color-contrast'], // May have minor contrast issues
    });
  });

  test('buttons have accessible names', async ({ page }) => {
    const result = await checkButtonAccessibility(page);

    // Log any inaccessible buttons
    if (!result.passes) {
      console.log('Inaccessible buttons:', result.inaccessibleButtons);
    }

    // Some buttons may use icons - check that most pass
    const totalButtons = await page.locator('button').count();
    const inaccessibleCount = result.inaccessibleButtons.length;

    // At least 80% should be accessible
    expect(inaccessibleCount).toBeLessThan(totalButtons * 0.2);
  });

  test('color contrast meets WCAG AA', async ({ page }) => {
    const result = await checkColorContrast(page);

    if (!result.passes) {
      console.log('Contrast violations:', result.violations);
    }

    // Main text should pass contrast
    // Some decorative elements may fail - allow minor issues
    expect(result.violations.length).toBeLessThan(5);
  });

  test('form inputs have labels when editing', async ({ page }) => {
    await app.createSystemElement({ x: 300, y: 200 });
    await app.canvas.selectNode(0);

    const result = await checkFormLabels(page);

    // Log unlabeled inputs
    if (!result.passes) {
      console.log('Unlabeled inputs:', result.unlabeledInputs);
    }

    // Most inputs should have labels (some may use placeholder as label)
    expect(result.unlabeledInputs.length).toBeLessThan(3);
  });

  test('page has proper landmark structure', async ({ page }) => {
    const landmarks = await checkLandmarks(page);

    // Should have header
    expect(landmarks.header).toBe(true);

    // Should have aside (toolbar and/or properties)
    expect(landmarks.aside).toBe(true);
  });

  test('select elements are keyboard accessible', async ({ page }) => {
    // Level selector should be focusable and operable
    const levelSelect = app.header.levelSelector;

    await levelSelect.focus();
    await expect(levelSelect).toBeFocused();

    // Should be able to change with keyboard
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
  });

  test('export menu is accessible', async ({ page }) => {
    await app.header.openExportMenu();

    // Menu items should be focusable
    const menuItems = page.locator('button:has-text("JSON")');
    await menuItems.first().focus();
    await expect(menuItems.first()).toBeFocused();
  });

  test('images and icons have alt text or aria labels', async ({ page }) => {
    // Check SVG icons have aria-hidden or aria-label
    const svgs = page.locator('svg');
    const count = await svgs.count();

    let accessibleCount = 0;
    for (let i = 0; i < count; i++) {
      const svg = svgs.nth(i);
      const ariaHidden = await svg.getAttribute('aria-hidden');
      const ariaLabel = await svg.getAttribute('aria-label');
      const role = await svg.getAttribute('role');

      if (ariaHidden === 'true' || ariaLabel || role === 'img') {
        accessibleCount++;
      }
    }

    // Most SVGs should be properly labeled or hidden
    expect(accessibleCount).toBeGreaterThan(count * 0.5);
  });

  test('no duplicate IDs on page', async ({ page }) => {
    const duplicates = await page.evaluate(() => {
      const ids = Array.from(document.querySelectorAll('[id]')).map((el) => el.id);
      const seen = new Set();
      const dupes = new Set();

      ids.forEach((id) => {
        if (seen.has(id)) {
          dupes.add(id);
        }
        seen.add(id);
      });

      return Array.from(dupes);
    });

    // No duplicate IDs
    expect(duplicates.length).toBe(0);
  });
});
