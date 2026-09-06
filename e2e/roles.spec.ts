import { test, expect } from '@playwright/test';
import { loginAsSuperAdmin, adminNav } from './helpers/auth';
import { SEEDED_CUSTOMER_EMAIL } from './helpers/seed';

test('superadmin can open roles settings', async ({ page }) => {
  await loginAsSuperAdmin(page);
  await page.goto('/settings/roles');

  await expect(
    page.getByRole('heading', { name: 'Role management' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Create role' }),
  ).toBeVisible();
});

test('superadmin can open role assignment on user detail', async ({ page }) => {
  await loginAsSuperAdmin(page);

  await adminNav(page).getByRole('link', { name: 'Users', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible({
    timeout: 15_000,
  });

  await page.getByLabel('Search').fill(SEEDED_CUSTOMER_EMAIL);
  await page.getByRole('button', { name: 'Apply filters' }).click();
  const row = page.getByRole('row').filter({ hasText: SEEDED_CUSTOMER_EMAIL });
  await expect(row).toBeVisible({ timeout: 15_000 });
  await row.getByRole('link', { name: 'View' }).click();

  await expect(page).toHaveURL(/\/users\/\d+/);
  await expect(page.getByLabel('Assigned role')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Change role' })).toBeVisible();
});
