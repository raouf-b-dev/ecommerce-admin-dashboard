import {
  test as base,
  expect,
  type BrowserContext,
  type Page,
} from '@playwright/test';
import { adminNav, signInAsAdmin } from './auth';

export { adminNav, expect };

/**
 * Worker-scoped admin session. Login is throttled per IP and refresh tokens
 * rotate; a saved storageState file would send a stale cookie on the next test.
 * One BrowserContext per worker keeps the cookie jar current. New pages still
 * bootstrap the in-memory access token via silent refresh.
 */
export const test = base.extend<object, { adminContext: BrowserContext }>({
  adminContext: [
    async ({ browser }, provide, workerInfo) => {
      test.skip(
        !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
        'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (see e2e/README.md).',
      );

      const context = await browser.newContext({
        baseURL: String(
          workerInfo.project.use.baseURL ?? 'http://localhost:5174',
        ),
      });
      const page = await context.newPage();
      try {
        await signInAsAdmin(page);
      } catch (error) {
        await context.close();
        throw error;
      }
      await page.close();
      await provide(context);
      await context.close();
    },
    { scope: 'worker' },
  ],
  context: async ({ adminContext }, provide) => {
    await provide(adminContext);
  },
});

/** Load the shell on a fresh page after the worker has already signed in. */
export async function openAdminShell(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Log out' }).waitFor({
    state: 'visible',
    timeout: 15_000,
  });
}
