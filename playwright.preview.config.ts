import process from 'node:process';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /preview-smoke\.spec\.ts/,
  timeout: 30_000,
  expect: {
    timeout: 8_000
  },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4174/obsidian-admin-vue/preview/',
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
