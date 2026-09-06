import {
  test,
  expect,
  openAdminShell,
  adminNav,
  openProductEditBySku,
} from './helpers/admin-fixtures';
import { SEEDED_PRODUCT_SKU } from './helpers/seed';

test('products list opens create and edit', async ({ page }) => {
  await openAdminShell(page);

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

  await openProductEditBySku(page, SEEDED_PRODUCT_SKU);
  await expect(page.getByLabel('Name')).not.toHaveValue('');
});

test('product edit can deactivate then reactivate catalog status', async ({
  page,
}) => {
  await openAdminShell(page);
  await openProductEditBySku(page, SEEDED_PRODUCT_SKU);

  await expect(
    page.getByRole('heading', { name: 'Catalog status' }),
  ).toBeVisible();

  const deactivateButton = page.getByRole('button', {
    name: 'Deactivate product',
  });
  const activateButton = page.getByRole('button', { name: 'Activate product' });

  await expect(deactivateButton).toBeVisible({ timeout: 15_000 });
  await deactivateButton.click();
  await page.getByRole('dialog').getByRole('button', { name: 'Deactivate' }).click();
  await expect(activateButton).toBeVisible({ timeout: 15_000 });
  await activateButton.click();
  await expect(deactivateButton).toBeVisible({ timeout: 15_000 });
});

test('products search filter updates URL', async ({ page }) => {
  await openAdminShell(page);

  await adminNav(page).getByRole('link', { name: 'Products', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible({
    timeout: 15_000,
  });

  await page.getByPlaceholder('Search name, SKU, or description…').fill('seed');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page).toHaveURL(/search=seed/);
});

test('products status filter updates URL', async ({ page }) => {
  await openAdminShell(page);

  await adminNav(page).getByRole('link', { name: 'Products', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible({
    timeout: 15_000,
  });

  await page.getByLabel('Status').selectOption('true');
  await expect(page).toHaveURL(/isActive=true/);
});

test('products column sort updates URL', async ({ page }) => {
  await openAdminShell(page);

  await adminNav(page).getByRole('link', { name: 'Products', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible({
    timeout: 15_000,
  });

  await page.getByRole('button', { name: 'Price' }).click();
  await expect(page).toHaveURL(/sortBy=price/);
});
