import { test, expect } from '@playwright/test';

test('admin shell loads', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Control Center')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('login page loads without admin shell', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  await expect(page.getByText('Control Center')).not.toBeVisible();
});

test('mobile navigation opens and navigates', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await expect(page.getByRole('link', { name: 'Products' })).toBeVisible();

  await page.getByRole('link', { name: 'Products' }).click();
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
});
