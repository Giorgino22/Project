import { defineConfig, devices } from '@playwright/test';

/** Browser tests for the hub (run with `npm run test:e2e -w apps/hub`). */
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:4324', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /site\.spec\.ts/ },
  ],
  webServer: {
    command: 'npm run build && npx astro preview --port 4324 --ignore-lock',
    url: 'http://localhost:4324/',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
