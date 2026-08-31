import { test, expect } from '@playwright/test';
import { loginAsAdmin, adminNav } from './helpers/auth';

test('inventory list opens after login', async ({ page }) => {
  test.skip(
    !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
    'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (see e2e/README.md).',
  );

  await loginAsAdmin(page);

  await adminNav(page).getByRole('link', { name: 'Inventory', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Inventory' })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByLabel('SKU')).toBeVisible();
  await expect(page.getByLabel('Low stock only')).toBeVisible();
});
