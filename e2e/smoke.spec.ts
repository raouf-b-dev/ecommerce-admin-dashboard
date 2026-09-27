import { test, expect } from '@playwright/test';

test('unauthenticated visit redirects to login', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/\/login\?redirect=%2F/);
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByText('Control Center')).not.toBeVisible();
});

test('login page loads without admin shell', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByText('Control Center')).not.toBeVisible();
});

test('login failure shows error', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@store.local');
  await page.getByLabel('Password').fill('not-the-password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(
    page.getByText(
      /Invalid email or password\.|Too many sign-in attempts/,
    ),
  ).toBeVisible();
  await expect(page).toHaveURL('/login');
});
