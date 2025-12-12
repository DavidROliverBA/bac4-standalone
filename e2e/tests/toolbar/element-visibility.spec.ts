import { test, expect } from '@playwright/test';
import { AppPage } from '../../pages/AppPage';

test.describe('Toolbar Element Visibility', () => {
  let app: AppPage;

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page);
    app.setupDialogDismiss();
    await app.clearLocalStorage();
    await app.navigate();
  });

  test('context level shows system, person, external system', async () => {
    // Verify at context level
    expect(await app.header.getCurrentLevel()).toBe('context');

    // Check visible elements
    expect(await app.toolbar.isElementVisible('system')).toBe(true);
    expect(await app.toolbar.isElementVisible('person')).toBe(true);
    expect(await app.toolbar.isElementVisible('externalSystem')).toBe(true);

    // Check not visible
    expect(await app.toolbar.isElementVisible('container')).toBe(false);
    expect(await app.toolbar.isElementVisible('component')).toBe(false);
  });

  test('container level shows system, container, person, external system', async () => {
    await app.header.selectLevel('container');

    expect(await app.toolbar.isElementVisible('system')).toBe(true);
    expect(await app.toolbar.isElementVisible('container')).toBe(true);
    expect(await app.toolbar.isElementVisible('person')).toBe(true);
    expect(await app.toolbar.isElementVisible('externalSystem')).toBe(true);

    expect(await app.toolbar.isElementVisible('component')).toBe(false);
  });

  test('component level shows container, component, person', async () => {
    await app.header.selectLevel('component');

    expect(await app.toolbar.isElementVisible('container')).toBe(true);
    expect(await app.toolbar.isElementVisible('component')).toBe(true);
    expect(await app.toolbar.isElementVisible('person')).toBe(true);

    expect(await app.toolbar.isElementVisible('system')).toBe(false);
    expect(await app.toolbar.isElementVisible('externalSystem')).toBe(false);
  });

  test('code level shows only component', async () => {
    await app.header.selectLevel('code');

    expect(await app.toolbar.isElementVisible('component')).toBe(true);

    expect(await app.toolbar.isElementVisible('system')).toBe(false);
    expect(await app.toolbar.isElementVisible('container')).toBe(false);
    expect(await app.toolbar.isElementVisible('person')).toBe(false);
    expect(await app.toolbar.isElementVisible('externalSystem')).toBe(false);
  });

  test('toolbar shows correct level label', async () => {
    let label = await app.toolbar.getCurrentLevelDisplay();
    expect(label).toContain('Context');

    await app.header.selectLevel('container');
    label = await app.toolbar.getCurrentLevelDisplay();
    expect(label).toContain('Container');

    await app.header.selectLevel('component');
    label = await app.toolbar.getCurrentLevelDisplay();
    expect(label).toContain('Component');

    await app.header.selectLevel('code');
    label = await app.toolbar.getCurrentLevelDisplay();
    expect(label).toContain('Code');
  });

  test('elements update immediately on level change', async () => {
    // Initially at context
    expect(await app.toolbar.isElementVisible('container')).toBe(false);

    // Change to container
    await app.header.selectLevel('container');

    // Container should now be visible
    expect(await app.toolbar.isElementVisible('container')).toBe(true);
  });

  test('quick tips section is always visible', async () => {
    // At context
    expect(await app.toolbar.isQuickTipsVisible()).toBe(true);

    // At container
    await app.header.selectLevel('container');
    expect(await app.toolbar.isQuickTipsVisible()).toBe(true);

    // At component
    await app.header.selectLevel('component');
    expect(await app.toolbar.isQuickTipsVisible()).toBe(true);

    // At code
    await app.header.selectLevel('code');
    expect(await app.toolbar.isQuickTipsVisible()).toBe(true);
  });

  test('each element type has correct styling', async ({ page }) => {
    // Check system button has blue styling
    const systemBtn = app.toolbar.systemElement;
    await expect(systemBtn).toHaveClass(/bg-blue/);

    // Check person button has purple styling
    const personBtn = app.toolbar.personElement;
    await expect(personBtn).toHaveClass(/bg-purple/);

    // Check external system has gray styling
    const externalBtn = app.toolbar.externalSystemElement;
    await expect(externalBtn).toHaveClass(/bg-gray/);

    // Switch to container level for container button
    await app.header.selectLevel('container');

    // Check container button has green styling
    const containerBtn = app.toolbar.containerElement;
    await expect(containerBtn).toHaveClass(/bg-green/);

    // Switch to component level for component button
    await app.header.selectLevel('component');

    // Check component button has yellow styling
    const componentBtn = app.toolbar.componentElement;
    await expect(componentBtn).toHaveClass(/bg-yellow/);
  });

  test('getVisibleElementTypes returns correct types for each level', async () => {
    // Context level
    let visibleTypes = await app.toolbar.getVisibleElementTypes();
    expect(visibleTypes).toContain('system');
    expect(visibleTypes).toContain('person');
    expect(visibleTypes).toContain('externalSystem');
    expect(visibleTypes).not.toContain('container');
    expect(visibleTypes).not.toContain('component');

    // Container level
    await app.header.selectLevel('container');
    visibleTypes = await app.toolbar.getVisibleElementTypes();
    expect(visibleTypes).toContain('system');
    expect(visibleTypes).toContain('container');
    expect(visibleTypes).toContain('person');
    expect(visibleTypes).toContain('externalSystem');
    expect(visibleTypes).not.toContain('component');

    // Component level
    await app.header.selectLevel('component');
    visibleTypes = await app.toolbar.getVisibleElementTypes();
    expect(visibleTypes).toContain('container');
    expect(visibleTypes).toContain('component');
    expect(visibleTypes).toContain('person');
    expect(visibleTypes).not.toContain('system');
    expect(visibleTypes).not.toContain('externalSystem');

    // Code level
    await app.header.selectLevel('code');
    visibleTypes = await app.toolbar.getVisibleElementTypes();
    expect(visibleTypes).toEqual(['component']);
  });
});
