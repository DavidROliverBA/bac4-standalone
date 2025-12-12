import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility testing utilities using axe-core
 */

export interface A11yResults {
  violations: any[];
  passes: any[];
  incomplete: any[];
  inapplicable: any[];
}

export interface A11yViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: any[];
}

/**
 * Run accessibility audit on the page
 */
export async function runA11yAudit(
  page: Page,
  options?: {
    include?: string[];
    exclude?: string[];
    tags?: string[];
  }
): Promise<A11yResults> {
  let builder = new AxeBuilder({ page });

  // Set WCAG tags by default
  const tags = options?.tags || ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
  builder = builder.withTags(tags);

  // Exclude common non-compliant third-party elements
  const defaultExclusions = [
    '.react-flow__minimap',
    '.react-flow__controls',
    '.react-flow__background',
  ];

  const exclusions = [...defaultExclusions, ...(options?.exclude || [])];
  for (const selector of exclusions) {
    builder = builder.exclude(selector);
  }

  // Include specific elements if specified
  if (options?.include?.length) {
    for (const selector of options.include) {
      builder = builder.include(selector);
    }
  }

  const results = await builder.analyze();

  return {
    violations: results.violations,
    passes: results.passes,
    incomplete: results.incomplete,
    inapplicable: results.inapplicable,
  };
}

/**
 * Assert that no accessibility violations exist
 */
export async function assertNoA11yViolations(
  page: Page,
  context?: string,
  options?: {
    exclude?: string[];
    ignoreRules?: string[];
  }
): Promise<void> {
  const results = await runA11yAudit(page, {
    include: context ? [context] : undefined,
    exclude: options?.exclude,
  });

  let violations = results.violations;

  // Filter out ignored rules
  if (options?.ignoreRules?.length) {
    violations = violations.filter(
      (v: A11yViolation) => !options.ignoreRules!.includes(v.id)
    );
  }

  if (violations.length > 0) {
    const violationMessages = violations
      .map((v: A11yViolation) => {
        const nodeInfo = v.nodes.map((n: any) => n.html).join('\n  ');
        return `[${v.impact}] ${v.id}: ${v.description}\n  Help: ${v.help}\n  Elements:\n  ${nodeInfo}`;
      })
      .join('\n\n');

    throw new Error(`Accessibility violations found:\n\n${violationMessages}`);
  }
}

/**
 * Get violations of a specific impact level
 */
export async function getViolationsByImpact(
  page: Page,
  impact: 'minor' | 'moderate' | 'serious' | 'critical'
): Promise<A11yViolation[]> {
  const results = await runA11yAudit(page);
  return results.violations.filter((v: A11yViolation) => v.impact === impact);
}

/**
 * Check if an element has visible focus indicator
 */
export async function hasFocusIndicator(
  page: Page,
  selector: string
): Promise<boolean> {
  const element = page.locator(selector);
  await element.focus();

  const styles = await element.evaluate((el: HTMLElement) => {
    const computed = window.getComputedStyle(el);
    return {
      outline: computed.outline,
      outlineWidth: computed.outlineWidth,
      outlineColor: computed.outlineColor,
      outlineStyle: computed.outlineStyle,
      boxShadow: computed.boxShadow,
    };
  });

  // Check for visible focus indicator
  const hasOutline =
    styles.outlineStyle !== 'none' &&
    styles.outlineWidth !== '0px' &&
    styles.outlineColor !== 'transparent';

  const hasBoxShadow =
    styles.boxShadow !== 'none' && styles.boxShadow !== '';

  return hasOutline || hasBoxShadow;
}

/**
 * Check color contrast ratio
 */
export async function checkColorContrast(page: Page): Promise<{
  passes: boolean;
  violations: A11yViolation[];
}> {
  const results = await runA11yAudit(page);
  const contrastViolations = results.violations.filter(
    (v: A11yViolation) => v.id === 'color-contrast'
  );

  return {
    passes: contrastViolations.length === 0,
    violations: contrastViolations,
  };
}

/**
 * Check if form inputs have associated labels
 */
export async function checkFormLabels(page: Page): Promise<{
  passes: boolean;
  unlabeledInputs: string[];
}> {
  const unlabeledInputs: string[] = [];

  const inputs = page.locator('input:not([type="hidden"]), textarea, select');
  const count = await inputs.count();

  for (let i = 0; i < count; i++) {
    const input = inputs.nth(i);
    const id = await input.getAttribute('id');
    const ariaLabel = await input.getAttribute('aria-label');
    const ariaLabelledby = await input.getAttribute('aria-labelledby');

    // Check if input has a label
    let hasLabel = false;

    if (ariaLabel || ariaLabelledby) {
      hasLabel = true;
    } else if (id) {
      const label = page.locator(`label[for="${id}"]`);
      hasLabel = await label.count() > 0;
    }

    // Check if input is wrapped in a label
    if (!hasLabel) {
      const parentLabel = input.locator('xpath=ancestor::label');
      hasLabel = await parentLabel.count() > 0;
    }

    if (!hasLabel) {
      const html = await input.evaluate((el) => el.outerHTML);
      unlabeledInputs.push(html);
    }
  }

  return {
    passes: unlabeledInputs.length === 0,
    unlabeledInputs,
  };
}

/**
 * Check if buttons have accessible names
 */
export async function checkButtonAccessibility(page: Page): Promise<{
  passes: boolean;
  inaccessibleButtons: string[];
}> {
  const inaccessibleButtons: string[] = [];

  const buttons = page.locator('button, [role="button"]');
  const count = await buttons.count();

  for (let i = 0; i < count; i++) {
    const button = buttons.nth(i);
    const text = await button.textContent();
    const ariaLabel = await button.getAttribute('aria-label');
    const title = await button.getAttribute('title');

    const hasAccessibleName =
      (text && text.trim().length > 0) ||
      (ariaLabel && ariaLabel.trim().length > 0) ||
      (title && title.trim().length > 0);

    if (!hasAccessibleName) {
      const html = await button.evaluate((el) => el.outerHTML);
      inaccessibleButtons.push(html);
    }
  }

  return {
    passes: inaccessibleButtons.length === 0,
    inaccessibleButtons,
  };
}

/**
 * Test keyboard navigation sequence
 */
export async function testTabSequence(
  page: Page,
  expectedSelectors: string[]
): Promise<{ passes: boolean; actual: string[] }> {
  const actual: string[] = [];

  // Start from the beginning
  await page.keyboard.press('Tab');

  for (let i = 0; i < expectedSelectors.length; i++) {
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return '';

      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : '';
      const classes = el.className
        ? `.${el.className.split(' ').filter(Boolean).join('.')}`
        : '';

      return `${tag}${id}${classes}`;
    });

    actual.push(focused);

    if (i < expectedSelectors.length - 1) {
      await page.keyboard.press('Tab');
    }
  }

  const passes = expectedSelectors.every((expected, i) => {
    return actual[i]?.includes(expected);
  });

  return { passes, actual };
}

/**
 * Check ARIA landmarks
 */
export async function checkLandmarks(page: Page): Promise<{
  header: boolean;
  main: boolean;
  navigation: boolean;
  aside: boolean;
}> {
  return {
    header: await page.locator('header, [role="banner"]').count() > 0,
    main: await page.locator('main, [role="main"]').count() > 0,
    navigation: await page.locator('nav, [role="navigation"]').count() > 0,
    aside: await page.locator('aside, [role="complementary"]').count() > 0,
  };
}
