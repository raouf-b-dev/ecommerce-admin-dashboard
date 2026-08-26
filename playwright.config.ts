import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev -- --port 5174 --strictPort',
    port: 5174,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
