import { Page, Locator, expect } from '@playwright/test';

/**
 * Base page class with common methods for all page objects
 */
export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the application
   */
  async navigate(): Promise<void> {
    await this.page.goto('/bac4-standalone.html');
    await this.waitForAppReady();
  }

  /**
   * Wait for the application to be fully loaded
   */
  async waitForAppReady(): Promise<void> {
    await expect(this.page.locator('.react-flow')).toBeVisible();
    await expect(this.page.locator('text=C4 Modelling Tool')).toBeVisible();
    // Wait for React Flow to initialize
    await this.page.waitForTimeout(500);
  }

  /**
   * Clear browser local storage (handles file:// protocol restrictions)
   */
  async clearLocalStorage(): Promise<void> {
    try {
      await this.page.evaluate(() => {
        try {
          localStorage.clear();
        } catch (e) {
          // localStorage may not be available for file:// protocol
          console.log('localStorage not available');
        }
      });
    } catch (e) {
      // Ignore errors - localStorage may not be accessible
    }
  }

  /**
   * Get value from local storage
   */
  async getLocalStorageItem(key: string): Promise<string | null> {
    try {
      return await this.page.evaluate((k) => {
        try {
          return localStorage.getItem(k);
        } catch (e) {
          return null;
        }
      }, key);
    } catch (e) {
      return null;
    }
  }

  /**
   * Set value in local storage
   */
  async setLocalStorageItem(key: string, value: string): Promise<void> {
    try {
      await this.page.evaluate(({ k, v }) => {
        try {
          localStorage.setItem(k, v);
        } catch (e) {
          console.log('localStorage not available');
        }
      }, { k: key, v: value });
    } catch (e) {
      // Ignore errors
    }
  }

  /**
   * Setup dialog handler to auto-accept dialogs
   */
  setupDialogAccept(): void {
    this.page.on('dialog', dialog => dialog.accept());
  }

  /**
   * Setup dialog handler to auto-dismiss dialogs
   */
  setupDialogDismiss(): void {
    this.page.on('dialog', dialog => dialog.dismiss());
  }

  /**
   * Wait for a specific amount of time (use sparingly)
   */
  async wait(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  /**
   * Take a screenshot for debugging
   */
  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `reports/screenshots/${name}.png` });
  }
}
