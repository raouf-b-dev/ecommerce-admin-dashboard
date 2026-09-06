import {
  test as base,
  expect,
  type BrowserContext,
  type Page,
} from '@playwright/test';
import { adminNav, signInAsAdmin } from './auth';

export { adminNav, expect };

const DEFAULT_VIEWPORT = { width: 1280, height: 720 } as const;

/**
 * One signed-in page per admin worker. A new page per test would bootstrap
 * via silent refresh (React Strict Mode can fire two at once), which rotates
 * and can revoke the refresh cookie, or hit the API refresh throttle.
 */
export const test = base.extend<
  object,
  { adminContext: BrowserContext; adminPage: Page }
>({
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
      await provide(context);
      await context.close();
    },
    { scope: 'worker' },
  ],
  adminPage: [
    async ({ adminContext }, provide) => {
      const page = await adminContext.newPage();
      try {
        await signInAsAdmin(page);
      } catch (error) {
        await page.close();
        throw error;
      }
      await provide(page);
      await page.close();
    },
    { scope: 'worker' },
  ],
  context: async ({ adminContext }, provide) => {
    await provide(adminContext);
  },
  page: async ({ adminPage }, provide) => {
    await adminPage.setViewportSize(DEFAULT_VIEWPORT);
    await provide(adminPage);
    await adminPage.keyboard.press('Escape').catch(() => undefined);
  },
});

/**
 * Land on the admin shell. Prefer in-app navigation so we do not refresh
 * (and rotate) the session on every spec.
 */
export async function openAdminShell(page: Page): Promise<void> {
  const logout = page.getByRole('button', { name: 'Log out' });
  const dashboardHeading = page.getByRole('heading', { name: 'Dashboard' });

  if (await logout.isVisible().catch(() => false)) {
    if (await dashboardHeading.isVisible().catch(() => false)) {
      await blurActiveElement(page);
      return;
    }
    const dashLink = adminNav(page).getByRole('link', {
      name: 'Dashboard',
      exact: true,
    });
    if (await dashLink.isVisible().catch(() => false)) {
      await dashLink.click();
      await dashboardHeading.waitFor({ state: 'visible', timeout: 15_000 });
      await blurActiveElement(page);
      return;
    }
  }

  await page.goto('/');
  await waitForShellOrReauth(page);
}

async function waitForShellOrReauth(page: Page): Promise<void> {
  const logout = page.getByRole('button', { name: 'Log out' });
  const signIn = page.getByRole('heading', { name: 'Sign in' });

  await Promise.race([
    logout.waitFor({ state: 'visible', timeout: 15_000 }),
    signIn.waitFor({ state: 'visible', timeout: 15_000 }),
  ]).catch(() => undefined);

  if (await signIn.isVisible().catch(() => false)) {
    await signInAsAdmin(page);
  }

  await logout.waitFor({ state: 'visible', timeout: 15_000 });
  await blurActiveElement(page);
}

async function blurActiveElement(page: Page): Promise<void> {
  await page.evaluate('document.activeElement && document.activeElement.blur()');
}
