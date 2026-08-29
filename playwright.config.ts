import { defineConfig } from '@playwright/test';

const apiBaseUrl = process.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
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
