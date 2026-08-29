import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test('customer login is blocked from Control Center', async ({ page }) => {
  const email = process.env.E2E_CUSTOMER_EMAIL;
  const password = process.env.E2E_CUSTOMER_PASSWORD;

  test.skip(
    !email || !password,
    'Set E2E_CUSTOMER_EMAIL and E2E_CUSTOMER_PASSWORD (see e2e/README.md).',
  );

  await page.goto('/login');
  await page.getByLabel('Email').fill(email!);
  await page.getByLabel('Password').fill(password!);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(
    page.getByText('This account cannot access the admin dashboard.'),
  ).toBeVisible();
  await expect(page.getByText('Control Center')).not.toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test('admin login still reaches Control Center', async ({ page }) => {
  test.skip(
    !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
    'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (see e2e/README.md).',
  );

  await loginAsAdmin(page);

  await expect(page.getByText('Control Center')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
