import { defineConfig, devices } from '@playwright/test';

const apiBaseUrl = process.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

if (
  process.env.CI &&
  (!process.env.E2E_ADMIN_EMAIL ||
    !process.env.E2E_ADMIN_PASSWORD ||
    !process.env.E2E_CUSTOMER_EMAIL ||
    !process.env.E2E_CUSTOMER_PASSWORD ||
    !process.env.E2E_SUPERADMIN_PASSWORD)
) {
  throw new Error(
    'CI e2e requires E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, E2E_CUSTOMER_EMAIL, E2E_CUSTOMER_PASSWORD, and E2E_SUPERADMIN_PASSWORD (see e2e/README.md).',
  );
}

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  // Guest specs can share the pool. Admin, phone, and superadmin stay at 1
  // worker each (shared seed accounts, refresh-token rotation, mutating catalog).
  // Phone projects depend on admin so they do not sign in beside it.
  fullyParallel: false,
  workers: 2,
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
  projects: [
    {
      name: 'guest',
      testMatch: ['smoke.spec.ts', 'a11y.spec.ts', 'operator-gate.spec.ts'],
      fullyParallel: true,
    },
    {
      name: 'admin',
      testMatch: [
        'products.spec.ts',
        'inventory.spec.ts',
        'orders.spec.ts',
        'users.spec.ts',
        'keyboard.spec.ts',
        'critical-path.spec.ts',
        'shell.spec.ts',
        'a11y-shell.spec.ts',
      ],
      grepInvert: /@mobile/,
      fullyParallel: false,
      workers: 1,
    },
    {
      name: 'mobile-pixel',
      dependencies: ['admin'],
      grep: /@mobile/,
      fullyParallel: false,
      workers: 1,
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 375, height: 851 },
      },
    },
    {
      name: 'mobile-iphone',
      dependencies: ['mobile-pixel'],
      grep: /@mobile/,
      fullyParallel: false,
      workers: 1,
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'superadmin',
      testMatch: ['roles.spec.ts', 'change-password.spec.ts', 'session.spec.ts'],
      fullyParallel: false,
      workers: 1,
    },
  ],
});
