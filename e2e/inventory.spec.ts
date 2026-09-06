import { test, expect, openAdminShell, adminNav } from './helpers/admin-fixtures';

test('inventory list opens after login', async ({ page }) => {
  await openAdminShell(page);

  await adminNav(page).getByRole('link', { name: 'Inventory', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Inventory' })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByPlaceholder('Filter by SKU…')).toBeVisible();
  await expect(page.getByLabel('Low stock only')).toBeVisible();
});

test('inventory productId filter updates URL', async ({ page }) => {
  await openAdminShell(page);

  await adminNav(page).getByRole('link', { name: 'Inventory', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Inventory' })).toBeVisible({
    timeout: 15_000,
  });

  await page.getByRole('button', { name: 'Filters' }).click();
  await page.getByLabel('Product ID').fill('1');
  await page.getByRole('button', { name: 'Apply advanced filters' }).click();
  await expect(page).toHaveURL(/productId=1/);
});

test('inventory column sort updates URL', async ({ page }) => {
  await openAdminShell(page);

  await adminNav(page).getByRole('link', { name: 'Inventory', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Inventory' })).toBeVisible({
    timeout: 15_000,
  });

  await page.getByRole('button', { name: 'Available' }).click();
  await expect(page).toHaveURL(/sortBy=availableQuantity/);
});

test('inventory adjust adds then subtracts one unit', async ({ page }) => {
  await openAdminShell(page);

  await adminNav(page).getByRole('link', { name: 'Inventory', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Inventory' })).toBeVisible({
    timeout: 15_000,
  });

  await page.getByPlaceholder('Filter by SKU…').fill('ELEC-ANC-001');
  await page.getByRole('button', { name: 'Search' }).click();

  const viewLink = page.getByRole('link', { name: 'View' }).first();
  await expect(viewLink).toBeVisible({ timeout: 15_000 });
  await viewLink.click();

  const available = page
    .getByText('Available Stock', { exact: true })
    .locator('xpath=following-sibling::*');
  await expect(available).toBeVisible({ timeout: 15_000 });
  const before = Number.parseInt((await available.innerText()).trim(), 10);
  expect(Number.isFinite(before)).toBe(true);

  async function applyAdjustment(type: 'ADD' | 'SUBTRACT') {
    await page.getByRole('button', { name: 'Adjust stock' }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Adjust stock' })).toBeVisible();
    await dialog.getByLabel('Type').selectOption(type);
    await dialog.getByLabel('Quantity').fill('1');
    await dialog.getByRole('button', { name: 'Apply adjustment' }).click();
    await expect(dialog).toHaveCount(0, { timeout: 15_000 });
  }

  await applyAdjustment('ADD');
  await expect(available).toHaveText(String(before + 1), { timeout: 15_000 });

  await applyAdjustment('SUBTRACT');
  await expect(available).toHaveText(String(before), { timeout: 15_000 });
});
