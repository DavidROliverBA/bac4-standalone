import { test, expect } from '@playwright/test';
import { AppPage } from '../../pages/AppPage';

test.describe('Title Editing', () => {
  let app: AppPage;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    app.setupDialogDismiss();
    await app.clearLocalStorage();
    await app.navigate();
  });

  test('displays default title', async () => {
    const title = await app.header.getTitle();
    expect(title).toBe('New C4 Model');
  });

  test('double-click enables edit mode', async () => {
    await app.header.startTitleEdit();

    // Input should be visible and focused
    await expect(app.header.titleInput).toBeVisible();
    await expect(app.header.titleInput).toBeFocused();
  });

  test('Enter key saves the title', async () => {
    await app.header.editTitle('My Architecture');

    // Verify title was updated
    await expect(app.header.titleDisplay).toHaveText('My Architecture');
  });

  test('Escape key cancels editing and reverts', async ({ page }) => {
    // Start editing
    await app.header.startTitleEdit();
    await app.header.titleInput.fill('Changed Title');

    // Cancel with Escape
    await app.header.cancelTitleEdit();

    // Should revert to original
    await expect(app.header.titleDisplay).toHaveText('New C4 Model');
  });

  test('blur saves the title', async () => {
    await app.header.editTitleWithBlur('Blurred Title');

    // Verify title was saved
    await expect(app.header.titleDisplay).toHaveText('Blurred Title');
  });

  test('empty title reverts to previous value', async () => {
    // First set a title
    await app.header.editTitle('Test Title');

    // Now try to set empty
    await app.header.startTitleEdit();
    await app.header.titleInput.fill('');
    await app.header.titleInput.press('Enter');

    // Should revert to previous
    await expect(app.header.titleDisplay).toHaveText('Test Title');
  });

  test('whitespace-only title reverts to previous value', async () => {
    // First set a title
    await app.header.editTitle('Test Title');

    // Now try to set whitespace only
    await app.header.startTitleEdit();
    await app.header.titleInput.fill('   ');
    await app.header.titleInput.press('Enter');

    // Should revert to previous
    await expect(app.header.titleDisplay).toHaveText('Test Title');
  });

  test('title persists after editing multiple times', async () => {
    await app.header.editTitle('First Title');
    await expect(app.header.titleDisplay).toHaveText('First Title');

    await app.header.editTitle('Second Title');
    await expect(app.header.titleDisplay).toHaveText('Second Title');

    await app.header.editTitle('Third Title');
    await expect(app.header.titleDisplay).toHaveText('Third Title');
  });

  test('input has appropriate styling when editing', async ({ page }) => {
    await app.header.startTitleEdit();

    // Should have focus ring
    const input = app.header.titleInput;
    await expect(input).toHaveClass(/focus:ring/);
  });

  test('title displays tooltip hint', async ({ page }) => {
    const title = app.header.titleDisplay;
    const titleAttr = await title.getAttribute('title');
    expect(titleAttr).toBe('Double-click to edit title');
  });

  test('special characters in title are handled correctly', async () => {
    const specialTitle = 'Test & "Title" <with> \'Special\' Characters';
    await app.header.editTitle(specialTitle);
    await expect(app.header.titleDisplay).toHaveText(specialTitle);
  });

  test('very long title is accepted', async () => {
    const longTitle = 'A'.repeat(100);
    await app.header.editTitle(longTitle);
    await expect(app.header.titleDisplay).toHaveText(longTitle);
  });
});
