// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './',      // your test files are in the current folder
  timeout: 60000,     // optional, increase default timeout
  reporter: [['html', { outputFolder: 'reports' }]],
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
