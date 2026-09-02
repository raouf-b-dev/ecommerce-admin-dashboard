import { test, expect } from '@playwright/test';
import { loginAsSuperAdmin } from './helpers/auth';

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
