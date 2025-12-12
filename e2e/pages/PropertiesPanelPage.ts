import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the Properties Panel component
 * Handles: element editing, relationship editing, delete functionality
 */
export class PropertiesPanelPage extends BasePage {
  readonly panel: Locator;
  readonly title: Locator;
  readonly closeButton: Locator;
  readonly deleteButton: Locator;
  readonly placeholderText: Locator;

  // Element properties fields
  readonly typeDisplay: Locator;
  readonly idDisplay: Locator;
  readonly nameInput: Locator;
  readonly technologyInput: Locator;
  readonly descriptionTextarea: Locator;
  readonly tagsInput: Locator;

  // Relationship properties fields
  readonly edgeDescriptionInput: Locator;
  readonly edgeTechnologyInput: Locator;
  readonly arrowDirectionSelect: Locator;
  readonly lineStyleSelect: Locator;

  constructor(page: Page) {
    super(page);

    // Panel container (right sidebar with w-80 class)
    this.panel = page.locator('aside.w-80');
    this.title = this.panel.locator('h2');
    this.closeButton = this.panel.locator('button').filter({ has: page.locator('svg') }).first();
    this.deleteButton = this.panel.locator('button:has-text("Delete")');
    this.placeholderText = this.panel.locator('text=Select an element');

    // Element fields - using more specific selectors
    this.typeDisplay = this.panel.locator('.bg-gray-100, .bg-gray-50').first();
    this.idDisplay = this.panel.locator('.font-mono').first();
    this.nameInput = this.panel.locator('input').filter({ has: page.locator('[placeholder*="name" i]') }).first();
    this.technologyInput = this.panel.locator('input').filter({ has: page.locator('[placeholder*="technology" i], [placeholder*="Spring" i]') }).first();
    this.descriptionTextarea = this.panel.locator('textarea').first();
    this.tagsInput = this.panel.locator('input').filter({ has: page.locator('[placeholder*="tag" i]') }).first();

    // Relationship fields
    this.edgeDescriptionInput = this.panel.locator('input[placeholder*="API" i], input[placeholder*="calls" i]').first();
    this.edgeTechnologyInput = this.panel.locator('input[placeholder*="REST" i], input[placeholder*="gRPC" i]').first();
    this.arrowDirectionSelect = this.panel.locator('select').first();
    this.lineStyleSelect = this.panel.locator('select').last();
  }

  // ==================== State Methods ====================

  /**
   * Check if showing element properties
   */
  async isShowingElementProperties(): Promise<boolean> {
    const titleText = await this.title.textContent();
    return (titleText?.toLowerCase().includes('properties') || false) &&
           !(titleText?.toLowerCase().includes('relationship') || false);
  }

  /**
   * Check if showing relationship properties
   */
  async isShowingRelationshipProperties(): Promise<boolean> {
    const titleText = await this.title.textContent();
    return titleText?.toLowerCase().includes('relationship') || false;
  }

  /**
   * Check if showing placeholder (nothing selected)
   */
  async isShowingPlaceholder(): Promise<boolean> {
    return await this.placeholderText.isVisible();
  }

  /**
   * Check if panel is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.panel.isVisible();
  }

  // ==================== Element Property Methods ====================

  /**
   * Get the element type display text
   */
  async getElementType(): Promise<string> {
    // Find the element type label
    const typeLabel = this.panel.locator('.uppercase, .font-semibold').filter({ hasText: /system|container|component|person|external/i }).first();
    return await typeLabel.textContent() || '';
  }

  /**
   * Get the current name value
   */
  async getName(): Promise<string> {
    const input = this.panel.locator('input').first();
    return await input.inputValue();
  }

  /**
   * Set the name field
   */
  async setName(name: string): Promise<void> {
    const input = this.panel.locator('input').first();
    await input.fill(name);
    await input.blur();
    await this.wait(100);
  }

  /**
   * Get the current technology value
   */
  async getTechnology(): Promise<string> {
    const inputs = this.panel.locator('input');
    const count = await inputs.count();
    if (count > 1) {
      return await inputs.nth(1).inputValue();
    }
    return '';
  }

  /**
   * Set the technology field
   */
  async setTechnology(technology: string): Promise<void> {
    const inputs = this.panel.locator('input');
    const techInput = inputs.nth(1);
    await techInput.fill(technology);
    await techInput.blur();
    await this.wait(100);
  }

  /**
   * Get the current description value
   */
  async getDescription(): Promise<string> {
    return await this.descriptionTextarea.inputValue();
  }

  /**
   * Set the description field
   */
  async setDescription(description: string): Promise<void> {
    await this.descriptionTextarea.fill(description);
    await this.descriptionTextarea.blur();
    await this.wait(100);
  }

  /**
   * Get the current tags value
   */
  async getTags(): Promise<string> {
    const inputs = this.panel.locator('input');
    const count = await inputs.count();
    if (count > 2) {
      return await inputs.nth(2).inputValue();
    }
    return '';
  }

  /**
   * Set the tags field
   */
  async setTags(tags: string): Promise<void> {
    const inputs = this.panel.locator('input');
    const tagsInput = inputs.nth(2);
    await tagsInput.fill(tags);
    await tagsInput.blur();
    await this.wait(100);
  }

  // ==================== Relationship Property Methods ====================

  /**
   * Get the relationship description
   */
  async getEdgeDescription(): Promise<string> {
    const input = this.panel.locator('input').first();
    return await input.inputValue();
  }

  /**
   * Set the relationship description
   */
  async setEdgeDescription(description: string): Promise<void> {
    const input = this.panel.locator('input').first();
    await input.fill(description);
    await input.blur();
    await this.wait(100);
  }

  /**
   * Get the relationship technology
   */
  async getEdgeTechnology(): Promise<string> {
    const inputs = this.panel.locator('input');
    const count = await inputs.count();
    if (count > 1) {
      return await inputs.nth(1).inputValue();
    }
    return '';
  }

  /**
   * Set the relationship technology
   */
  async setEdgeTechnology(technology: string): Promise<void> {
    const inputs = this.panel.locator('input');
    const techInput = inputs.nth(1);
    await techInput.fill(technology);
    await techInput.blur();
    await this.wait(100);
  }

  /**
   * Get the arrow direction value
   */
  async getArrowDirection(): Promise<string> {
    return await this.arrowDirectionSelect.inputValue();
  }

  /**
   * Set the arrow direction
   */
  async setArrowDirection(direction: 'right' | 'left' | 'both' | 'none'): Promise<void> {
    await this.arrowDirectionSelect.selectOption(direction);
    await this.wait(100);
  }

  /**
   * Get the line style value
   */
  async getLineStyle(): Promise<string> {
    return await this.lineStyleSelect.inputValue();
  }

  /**
   * Set the line style
   */
  async setLineStyle(style: 'solid' | 'dashed' | 'dotted'): Promise<void> {
    await this.lineStyleSelect.selectOption(style);
    await this.wait(100);
  }

  // ==================== Action Methods ====================

  /**
   * Close the properties panel
   */
  async close(): Promise<void> {
    await this.closeButton.click();
    await this.wait(100);
  }

  /**
   * Click delete button (will trigger confirmation)
   */
  async clickDelete(): Promise<void> {
    await this.deleteButton.click();
  }

  /**
   * Delete with confirmation
   */
  async deleteAndConfirm(): Promise<void> {
    this.setupDialogAccept();
    await this.deleteButton.click();
    await this.wait(300);
  }

  /**
   * Delete and cancel confirmation
   */
  async deleteAndCancel(): Promise<void> {
    this.setupDialogDismiss();
    await this.deleteButton.click();
    await this.wait(100);
  }

  // ==================== Validation Methods ====================

  /**
   * Check if all element fields are present
   */
  async hasAllElementFields(): Promise<boolean> {
    const inputs = this.panel.locator('input');
    const textareas = this.panel.locator('textarea');

    const inputCount = await inputs.count();
    const textareaCount = await textareas.count();

    return inputCount >= 3 && textareaCount >= 1;
  }

  /**
   * Check if all relationship fields are present
   */
  async hasAllRelationshipFields(): Promise<boolean> {
    const inputs = this.panel.locator('input');
    const selects = this.panel.locator('select');

    const inputCount = await inputs.count();
    const selectCount = await selects.count();

    return inputCount >= 2 && selectCount >= 2;
  }
}
