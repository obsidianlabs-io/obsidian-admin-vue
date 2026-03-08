import process from 'node:process';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /ui-baseline\.spec\.ts/,
  timeout: 30_000,
  expect: {
    timeout: 8_000,
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02
    }
  },
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
  use: {
    baseURL: 'http://127.0.0.1:4174/obsidian-admin-vue/preview/',
    viewport: {
      width: 1440,
      height: 960
    },
    colorScheme: 'light',
    locale: 'en-US',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: 'node scripts/serve-pages-preview.mjs --root .pages-dist --base /obsidian-admin-vue --port 4174',
    url: 'http://127.0.0.1:4174/obsidian-admin-vue/preview/',
    timeout: 30_000,
    reuseExistingServer: !process.env.CI
  }
});
