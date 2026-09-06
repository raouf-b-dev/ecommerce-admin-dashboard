import { test, expect } from '@playwright/test';
import { loginAsSuperAdmin, adminNav } from './helpers/auth';

test('superadmin can open roles settings', async ({ page }) => {
  test.skip(
    !process.env.E2E_SUPERADMIN_PASSWORD,
    'Set E2E_SUPERADMIN_PASSWORD (see e2e/README.md).',
  );

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
  test.skip(
    !process.env.E2E_SUPERADMIN_PASSWORD,
    'Set E2E_SUPERADMIN_PASSWORD (see e2e/README.md).',
  );

  await loginAsSuperAdmin(page);

  await adminNav(page).getByRole('link', { name: 'Users', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible({
    timeout: 15_000,
  });

  const viewLink = page.getByRole('link', { name: 'View' }).first();
  await expect(viewLink).toBeVisible({ timeout: 15_000 });
  await viewLink.click();

  await expect(page).toHaveURL(/\/users\/\d+/);
  await expect(page.getByLabel('Assigned role')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Change role' })).toBeVisible();
});
