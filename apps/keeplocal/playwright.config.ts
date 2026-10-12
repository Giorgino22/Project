import { defineConfig, devices } from '@playwright/test';

/**
 * Browser tests: they open the real, built website in Chromium and use every tool
 * like a visitor would (choose files, click buttons, download results).
 * Run with `npm run test:e2e`. First time on a new computer: `npx playwright install chromium`.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  globalSetup: './tests/e2e/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    acceptDownloads: true,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    // On a phone-sized screen we only check that pages load and nothing overflows.
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /site\.spec\.ts/ },
  ],
  webServer: {
    // Builds the site and serves the finished files from dist/, exactly as they will be published.
    // --ignore-lock keeps the preview server in the foreground (Astro may otherwise start it in
    // the background when it detects an automated environment, and the tests couldn't stop it).
    command: 'npm run build && npx astro preview --port 4321 --ignore-lock',
    url: 'http://localhost:4321/',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
