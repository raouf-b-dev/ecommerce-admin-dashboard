import { test, expect } from '@playwright/test';
import { loginAsAdmin, adminNav } from './helpers/auth';

test('users list opens after login', async ({ page }) => {
  test.skip(
    !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
    'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (see e2e/README.md).',
  );

  await loginAsAdmin(page);

  await adminNav(page).getByRole('link', { name: 'Users', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByLabel('Search')).toBeVisible();
  await expect(page.getByLabel('Status')).toBeVisible();
  await expect(page.getByLabel('Role')).toBeVisible();

  const customerEmail = page.getByText('customer@store.local');
  if (await customerEmail.count()) {
    await expect(customerEmail.first()).toBeVisible();
  }
});

test('admin user detail does not show role assignment', async ({ page }) => {
  test.skip(
    !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
    'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (see e2e/README.md).',
  );

  await loginAsAdmin(page);

  await adminNav(page).getByRole('link', { name: 'Users', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible({
    timeout: 15_000,
  });

  const viewLink = page.getByRole('link', { name: 'View' }).first();
  await expect(viewLink).toBeVisible({ timeout: 15_000 });
  await viewLink.click();

  await expect(page).toHaveURL(/\/users\/\d+/);
  await expect(
    page.getByRole('button', { name: 'Change role' }),
  ).toHaveCount(0);
  await expect(page.getByLabel('Assigned role')).toHaveCount(0);
});
