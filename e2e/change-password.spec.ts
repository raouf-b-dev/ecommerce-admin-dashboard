import { test, expect } from '@playwright/test';

/**
 * Uses superadmin@store.local so smoke tests can keep using admin@store.local
 * via loginAsAdmin without a rotated password.
 */
test.describe('Forced password change', () => {
  test('seeded super admin completes rotation and reaches dashboard', async ({
    page,
  }) => {
    const email =
      process.env.E2E_SUPERADMIN_EMAIL ?? 'superadmin@store.local';
    const password = process.env.E2E_SUPERADMIN_PASSWORD;
    const newPassword =
      process.env.E2E_SUPERADMIN_NEW_PASSWORD ??
      (password ? `${password}Rotated1!` : undefined);

    test.skip(
      !password || !newPassword,
      'Set E2E_SUPERADMIN_PASSWORD (and optionally E2E_SUPERADMIN_NEW_PASSWORD). See e2e/README.md.',
    );

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password!);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/change-password/);
    await expect(
      page.getByRole('heading', { name: 'Change your password' }),
    ).toBeVisible();

    await page.getByLabel('Current password').fill(password!);
    await page.getByLabel('New password', { exact: true }).fill(newPassword!);
    await page.getByLabel('Confirm new password').fill(newPassword!);
    await page.getByRole('button', { name: 'Update password' }).click();

    await expect(page.getByText('Control Center')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
