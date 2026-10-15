import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';
import { writeMelodyFile } from './tests/e2e/melody';

/**
 * Browser tests for Humm (run with `npm run test:e2e -w apps/humm`).
 * Chromium gets a fake microphone that plays a generated tune (tests/e2e/melody.ts), so the
 * tests can record without a person. The AI is never called: the tests answer /api/identify
 * themselves (see tests/e2e/humm.spec.ts).
 */
const melody = writeMelodyFile(fileURLToPath(new URL('./tests/fixtures/generated/melody.wav', import.meta.url)));
const fakeMicrophone = {
  permissions: ['microphone'],
  launchOptions: {
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${melody}`],
  },
};

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:4325', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], ...fakeMicrophone } },
    { name: 'mobile', use: { ...devices['Pixel 7'], ...fakeMicrophone }, testMatch: /site\.spec\.ts/ },
  ],
  webServer: {
    command: 'npm run build && npx astro preview --port 4325 --ignore-lock',
    url: 'http://localhost:4325/',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
