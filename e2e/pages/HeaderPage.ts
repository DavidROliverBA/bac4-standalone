import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the Header component
 * Handles: title editing, level selector, export/import menus, layout, clear all
 */
export class HeaderPage extends BasePage {
  // Title elements
  readonly titleDisplay: Locator;
  readonly titleInput: Locator;

  // Level selector
  readonly levelSelector: Locator;

  // Export menu
  readonly exportButton: Locator;
  readonly exportMenu: Locator;
  readonly exportJsonOption: Locator;
  readonly exportStructurizrOption: Locator;
  readonly exportPlantUmlOption: Locator;
  readonly exportMermaidOption: Locator;
  readonly exportMarkdownOption: Locator;
  readonly exportHtmlOption: Locator;
  readonly exportPngOption: Locator;
  readonly exportSvgOption: Locator;
  readonly exportDrawioOption: Locator;

  // Import
  readonly importButton: Locator;
  readonly importInput: Locator;

  // Layout menu
  readonly layoutButton: Locator;
  readonly layoutMenu: Locator;
  readonly layoutHierarchical: Locator;
  readonly layoutGrid: Locator;
  readonly layoutCircular: Locator;
  readonly layoutForceDirected: Locator;

  // Clear all
  readonly clearAllButton: Locator;

  constructor(page: Page) {
    super(page);

    // Title
    this.titleDisplay = page.locator('[title="Double-click to edit title"]');
    this.titleInput = page.locator('header input[type="text"]');

    // Level selector
    this.levelSelector = page.locator('header select');

    // Export menu
    this.exportButton = page.locator('button:has-text("Export")');
    this.exportMenu = page.locator('.absolute.w-48.bg-white.rounded-lg.shadow-lg').first();
    this.exportJsonOption = page.locator('button:has-text("JSON (BAC4)")');
    this.exportStructurizrOption = page.locator('button:has-text("Structurizr JSON")');
    this.exportPlantUmlOption = page.locator('button:has-text("PlantUML")');
    this.exportMermaidOption = page.locator('button:has-text("Mermaid")');
    this.exportMarkdownOption = page.locator('button:has-text("Markdown")');
    this.exportHtmlOption = page.locator('button:has-text("HTML Document")');
    this.exportPngOption = page.locator('button:has-text("PNG Image")');
    this.exportSvgOption = page.locator('button:has-text("SVG Image")');
    this.exportDrawioOption = page.locator('button:has-text("Draw.io")');

    // Import
    this.importButton = page.locator('label:has-text("Import")');
    this.importInput = page.locator('input[type="file"][accept=".json"]');

    // Layout menu (appears when layout button is clicked)
    this.layoutButton = page.locator('button:has-text("Layout")');
    this.layoutMenu = this.layoutButton.locator('..').locator('.absolute.w-48');
    this.layoutHierarchical = page.locator('button:has-text("Hierarchical")');
    this.layoutGrid = page.locator('button:has-text("Grid")');
    this.layoutCircular = page.locator('button:has-text("Circular")');
    this.layoutForceDirected = page.locator('button:has-text("Force-Directed")');

    // Clear all
    this.clearAllButton = page.locator('button:has-text("Clear All")');
  }

  // ==================== Title Methods ====================

  /**
   * Get the current title text
   */
  async getTitle(): Promise<string> {
    return await this.titleDisplay.textContent() || '';
  }

  /**
   * Start editing the title (double-click)
   */
  async startTitleEdit(): Promise<void> {
    await this.titleDisplay.dblclick();
    await expect(this.titleInput).toBeVisible();
    await expect(this.titleInput).toBeFocused();
  }

  /**
   * Edit title and save with Enter key
   */
  async editTitle(newTitle: string): Promise<void> {
    await this.startTitleEdit();
    await this.titleInput.fill(newTitle);
    await this.titleInput.press('Enter');
  }

  /**
   * Edit title and save with blur
   */
  async editTitleWithBlur(newTitle: string): Promise<void> {
    await this.startTitleEdit();
    await this.titleInput.fill(newTitle);
    await this.page.locator('.react-flow').click();
  }

  /**
   * Cancel title edit with Escape
   */
  async cancelTitleEdit(): Promise<void> {
    await this.titleInput.press('Escape');
    await expect(this.titleInput).not.toBeVisible();
  }

  /**
   * Check if title is in edit mode
   */
  async isTitleEditing(): Promise<boolean> {
    return await this.titleInput.isVisible();
  }

  // ==================== Level Selector Methods ====================

  /**
   * Get current C4 level
   */
  async getCurrentLevel(): Promise<string> {
    return await this.levelSelector.inputValue();
  }

  /**
   * Select a C4 level
   */
  async selectLevel(level: 'context' | 'container' | 'component' | 'code'): Promise<void> {
    await this.levelSelector.selectOption(level);
  }

  /**
   * Get all available levels
   */
  async getAvailableLevels(): Promise<string[]> {
    const options = await this.levelSelector.locator('option').allTextContents();
    return options;
  }

  // ==================== Export Methods ====================

  /**
   * Open the export menu
   */
  async openExportMenu(): Promise<void> {
    await this.exportButton.click();
    await expect(this.exportMenu).toBeVisible();
  }

  /**
   * Close the export menu
   */
  async closeExportMenu(): Promise<void> {
    await this.page.locator('.react-flow').click();
    await expect(this.exportMenu).not.toBeVisible();
  }

  /**
   * Check if export menu is open
   */
  async isExportMenuOpen(): Promise<boolean> {
    return await this.exportMenu.isVisible();
  }

  /**
   * Export as JSON and capture download
   */
  async exportJson(): Promise<{ filename: string; content: string }> {
    const downloadPromise = this.page.waitForEvent('download');
    await this.openExportMenu();
    await this.exportJsonOption.click();
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
   * Export as Structurizr JSON
   */
  async exportStructurizr(): Promise<{ filename: string; content: string }> {
    const downloadPromise = this.page.waitForEvent('download');
    await this.openExportMenu();
    await this.exportStructurizrOption.click();
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
   * Export as PlantUML
   */
  async exportPlantUml(): Promise<{ filename: string; content: string }> {
    const downloadPromise = this.page.waitForEvent('download');
    await this.openExportMenu();
    await this.exportPlantUmlOption.click();
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

  // ==================== Import Methods ====================

  /**
   * Import a JSON file
   */
  async importFile(filePath: string): Promise<void> {
    await this.importInput.setInputFiles(filePath);
  }

  // ==================== Layout Methods ====================

  /**
   * Open the layout menu
   */
  async openLayoutMenu(): Promise<void> {
    await this.layoutButton.click();
    await expect(this.layoutMenu).toBeVisible();
  }

  /**
   * Apply hierarchical layout
   */
  async applyHierarchicalLayout(): Promise<void> {
    await this.openLayoutMenu();
    await this.layoutHierarchical.click();
  }

  /**
   * Apply grid layout
   */
  async applyGridLayout(): Promise<void> {
    await this.openLayoutMenu();
    await this.layoutGrid.click();
  }

  /**
   * Apply circular layout
   */
  async applyCircularLayout(): Promise<void> {
    await this.openLayoutMenu();
    await this.layoutCircular.click();
  }

  /**
   * Apply force-directed layout
   */
  async applyForceDirectedLayout(): Promise<void> {
    await this.openLayoutMenu();
    await this.layoutForceDirected.click();
  }

  // ==================== Clear All Methods ====================

  /**
   * Click clear all button (will trigger confirmation dialog)
   */
  async clickClearAll(): Promise<void> {
    await this.clearAllButton.click();
  }

  /**
   * Clear all with auto-accept
   */
  async clearAllAndConfirm(): Promise<void> {
    this.setupDialogAccept();
    await this.clearAllButton.click();
    await this.wait(300);
  }
}
