import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'reports/html' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
    ['list'],
  ],

  use: {
    // Base URL points to the local server
    baseURL: 'http://localhost:5173',

    // Capture screenshots only on failure
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',

    // Timeouts
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // Only Chromium as specified
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // For visual regression consistency
        deviceScaleFactor: 1,
        hasTouch: false,
        isMobile: false,
      },
    },
    // Additional viewport for responsive testing
    {
      name: 'chromium-small',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],

  // Output directories
  outputDir: 'reports/test-results',

  // Snapshot settings for visual regression
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
      animations: 'disabled',
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.01,
    },
  },

  // Serve the standalone HTML file via a simple HTTP server
  webServer: {
    command: 'npx serve .. -l 5173 --no-clipboard',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    cwd: __dirname,
  },
});
