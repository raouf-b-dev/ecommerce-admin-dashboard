import { test, expect, openAdminShell } from './helpers/admin-fixtures';

test('signed-in session shows the admin shell', async ({ page }) => {
  await openAdminShell(page);

  await expect(page.getByText('Control Center')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByLabel('Period')).toBeVisible();
  await expect(page.getByText('Needs attention')).toBeVisible({ timeout: 15_000 });
});

test('mobile navigation opens and navigates', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openAdminShell(page);

  await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await expect(page.getByRole('link', { name: 'Products' })).toBeVisible();

  await page.getByRole('link', { name: 'Products' }).click();
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
});

test('forbidden route shows access denied inside shell', async ({ page }) => {
  await openAdminShell(page);
  await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();

  await page.goto('/settings/roles');
  await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible({
    timeout: 15_000,
  });
  await expect(
    page.getByRole('heading', { name: 'Access denied' }),
  ).toBeVisible({ timeout: 15_000 });
});
