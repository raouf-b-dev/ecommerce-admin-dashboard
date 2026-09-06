import { test, expect } from '@playwright/test';
import { loginAsSuperAdmin } from './helpers/auth';
import { SEEDED_CUSTOMER_EMAIL } from './helpers/seed';
import { openUserDetailByEmail } from './helpers/users';

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
  await openUserDetailByEmail(page, SEEDED_CUSTOMER_EMAIL);

  await expect(page.getByLabel('Assigned role')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Change role' })).toBeVisible();
});
