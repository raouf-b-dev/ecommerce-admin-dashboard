import { test, expect } from '@playwright/test';

test('limited operator lands safely on authorized section without 403 loop', async ({
  page,
}) => {
  const email = process.env.E2E_CATALOG_EMAIL ?? 'catalog@store.local';
  const password = process.env.E2E_CATALOG_PASSWORD ?? 'demo';

  test.skip(
    !process.env.VITE_ENABLE_MOCK && !process.env.E2E_CATALOG_EMAIL,
    'Set E2E_CATALOG_EMAIL or run with mock mode for catalog operator safe landing test.',
  );

  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/products/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Products' }),
  ).toBeVisible();
  await expect(page.getByText('Access denied')).not.toBeVisible();
});
