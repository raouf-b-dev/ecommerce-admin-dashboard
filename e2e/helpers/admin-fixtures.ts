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
 * One signed-in page per admin worker. Worker setup (`signInAsAdmin`) is the
 * login-form coverage. A new page per test would bootstrap via silent refresh
 * (React Strict Mode can fire two at once), which rotates and can revoke the
 * refresh cookie, or hit the API refresh throttle.
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
  await waitForAdminShell(page);
}

async function waitForAdminShell(page: Page): Promise<void> {
  const logout = page.getByRole('button', { name: 'Log out' });
  const signIn = page.getByRole('heading', { name: 'Sign in' });

  await Promise.race([
    logout.waitFor({ state: 'visible', timeout: 15_000 }),
    signIn.waitFor({ state: 'visible', timeout: 15_000 }),
  ]).catch(() => undefined);

  if (await signIn.isVisible().catch(() => false)) {
    throw new Error(
      'Admin session was lost (landed on Sign in). The refresh cookie may have been rotated or throttled.',
    );
  }

  await logout.waitFor({ state: 'visible', timeout: 15_000 });
  await blurActiveElement(page);
}

async function blurActiveElement(page: Page): Promise<void> {
  await page.evaluate('document.activeElement && document.activeElement.blur()');
}

export async function openProductEditBySku(
  page: Page,
  sku: string,
): Promise<void> {
  await adminNav(page).getByRole('link', { name: 'Products', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible({
    timeout: 15_000,
  });
  await page.getByPlaceholder('Search name, SKU, or description…').fill(sku);
  await page.getByRole('button', { name: 'Search' }).click();
  const row = page.getByRole('row').filter({ hasText: sku });
  await expect(
    row,
    `Expected seeded product ${sku}. Run API npm run db:seed.`,
  ).toBeVisible({ timeout: 15_000 });
  await row.getByRole('link', { name: 'Edit' }).click();
  await expect(page).toHaveURL(/\/products\/\d+\/edit/);
  await expect(page.getByRole('heading', { name: 'Edit product' })).toBeVisible();
}

export async function openInventoryDetailBySku(
  page: Page,
  sku: string,
): Promise<void> {
  await adminNav(page)
    .getByRole('link', { name: 'Inventory', exact: true })
    .click();
  await expect(page.getByRole('heading', { name: 'Inventory' })).toBeVisible({
    timeout: 15_000,
  });
  await page.getByPlaceholder('Filter by SKU…').fill(sku);
  await page.getByRole('button', { name: 'Search' }).click();
  const row = page.getByRole('row').filter({ hasText: sku });
  await expect(
    row,
    `Expected seeded inventory row ${sku}. Run API npm run db:seed.`,
  ).toBeVisible({ timeout: 15_000 });
  await row.getByRole('link', { name: 'View' }).click();
}

export async function openFirstOrderDetail(page: Page): Promise<void> {
  await adminNav(page).getByRole('link', { name: 'Orders', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible({
    timeout: 15_000,
  });
  const viewLink = page.getByRole('link', { name: 'View' }).first();
  await expect(
    viewLink,
    'Expected a seeded order. Run API npm run db:seed.',
  ).toBeVisible({ timeout: 15_000 });
  await viewLink.click();
  await expect(page).toHaveURL(/\/orders\/\d+/);
  await expect(page.getByRole('heading', { name: 'Status actions' })).toBeVisible(
    { timeout: 15_000 },
  );
}
