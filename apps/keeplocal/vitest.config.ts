import { defineConfig } from 'vitest/config';

// Unit tests: fast checks of the pure logic in src/lib and src/site (run with `npm run test:unit`).
// Browser tests live in tests/e2e and use Playwright instead.
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
