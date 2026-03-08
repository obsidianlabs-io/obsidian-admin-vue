import process from 'node:process';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /full-stack\.spec\.ts/,
  timeout: 45_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: 'http://127.0.0.1:9527',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://127.0.0.1:9527/login',
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    env: {
      PLAYWRIGHT: 'true',
      VITE_HTTP_PROXY: 'Y',
      VITE_REALTIME_ENABLED: 'N'
    }
  }
});
