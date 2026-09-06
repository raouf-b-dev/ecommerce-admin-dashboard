import { defineConfig } from '@playwright/test';

const apiBaseUrl = process.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

if (
  process.env.CI &&
  (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD)
) {
  throw new Error(
    'CI e2e requires E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (see e2e/README.md).',
  );
}

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  // Shared seeded admin + API login throttle - parallel workers race
  // password rotation and trip 429s.
  fullyParallel: false,
  workers: 1,
  // Helpers wait out a 429 window; keep this above that wait.
  timeout: 180_000,
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev -- --port 5174 --strictPort',
    port: 5174,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      VITE_API_BASE_URL: apiBaseUrl,
    },
  },
});
