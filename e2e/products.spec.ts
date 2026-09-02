import { test, expect } from '@playwright/test';
import { loginAsAdmin, adminNav } from './helpers/auth';

test('products list opens create and edit', async ({ page }) => {
  test.skip(
    !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
    'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (see e2e/README.md).',
  );

  await loginAsAdmin(page);

  await adminNav(page).getByRole('link', { name: 'Products', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByRole('link', { name: 'New product' })).toBeVisible();

  await page.getByRole('link', { name: 'New product' }).click();
  await expect(page).toHaveURL(/\/products\/new/);
  await expect(page.getByRole('heading', { name: 'New product' })).toBeVisible();
  await expect(page.getByLabel('Name')).toBeVisible();
  await expect(page.getByLabel('Price')).toBeVisible();

  await adminNav(page).getByRole('link', { name: 'Products', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();

  const editLink = page.getByRole('link', { name: 'Edit' }).first();
  await expect(editLink).toBeVisible({ timeout: 15_000 });
  await editLink.click();

  await expect(page).toHaveURL(/\/products\/\d+\/edit/);
  await expect(page.getByRole('heading', { name: 'Edit product' })).toBeVisible();
  await expect(page.getByLabel('Name')).not.toHaveValue('');
});

test('product edit can deactivate then reactivate catalog status', async ({
  page,
}) => {
  test.skip(
    !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
    'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (see e2e/README.md).',
  );

  await loginAsAdmin(page);

  await adminNav(page).getByRole('link', { name: 'Products', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible({
    timeout: 15_000,
  });

  const editLink = page.getByRole('link', { name: 'Edit' }).first();
  await expect(editLink).toBeVisible({ timeout: 15_000 });
  await editLink.click();
  await expect(page.getByRole('heading', { name: 'Edit product' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Catalog status' }),
  ).toBeVisible();

  const deactivateButton = page.getByRole('button', {
    name: 'Deactivate product',
  });
  const activateButton = page.getByRole('button', { name: 'Activate product' });

  if (await deactivateButton.isVisible()) {
    await deactivateButton.click();
    await page.getByRole('dialog').getByRole('button', { name: 'Deactivate' }).click();
    await expect(activateButton).toBeVisible({ timeout: 15_000 });
    await activateButton.click();
    await expect(deactivateButton).toBeVisible({ timeout: 15_000 });
  } else {
    await expect(activateButton).toBeVisible();
    await activateButton.click();
    await expect(deactivateButton).toBeVisible({ timeout: 15_000 });
    await deactivateButton.click();
    await page.getByRole('dialog').getByRole('button', { name: 'Deactivate' }).click();
    await expect(activateButton).toBeVisible({ timeout: 15_000 });
  }
});

test('products search filter updates URL', async ({ page }) => {
  test.skip(
    !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
    'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (see e2e/README.md).',
  );

  await loginAsAdmin(page);

  await adminNav(page).getByRole('link', { name: 'Products', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible({
    timeout: 15_000,
  });

  await page.getByLabel('Search').fill('seed');
  await page.getByRole('button', { name: 'Apply filters' }).click();
  await expect(page).toHaveURL(/search=seed/);
});

test('products column sort updates URL', async ({ page }) => {
  test.skip(
    !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
    'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (see e2e/README.md).',
  );

  await loginAsAdmin(page);

  await adminNav(page).getByRole('link', { name: 'Products', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible({
    timeout: 15_000,
  });

  await page.getByRole('button', { name: 'Price' }).click();
  await expect(page).toHaveURL(/sortBy=price/);
});
