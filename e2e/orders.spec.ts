import { type Page } from '@playwright/test';
import { test, expect, openAdminShell, adminNav } from './helpers/admin-fixtures';

async function openFirstOrderWithStatus(
  page: Page,
  status: 'confirmed' | 'processing',
): Promise<void> {
  await adminNav(page).getByRole('link', { name: 'Orders', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible({
    timeout: 15_000,
  });

  await page.getByLabel('Status filter').selectOption(status);
  await expect(page).toHaveURL(new RegExp(`status=${status}`));

  const row = page
    .getByRole('row')
    .filter({
      has: page.getByText(status.replaceAll('_', ' '), { exact: false }),
    })
    .first();
  await expect(
    row,
    `Expected a seeded ${status} order. Run API npm run db:seed.`,
  ).toBeVisible({ timeout: 15_000 });

  const href = await row.getByRole('link', { name: 'View' }).getAttribute('href');
  expect(href, 'Order View link should have an href').toBeTruthy();
  await page.goto(href!);
  await expect(page).toHaveURL(/\/orders\/\d+/);
  await expect(page.getByRole('heading', { name: 'Status actions' })).toBeVisible({
    timeout: 15_000,
  });
}

test.describe('order status transitions', () => {
  test.describe.configure({ mode: 'serial' });

  test('orders list opens detail and can process a confirmed order', async ({
    page,
  }) => {
    await openAdminShell(page);

    await adminNav(page).getByRole('link', { name: 'Orders', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByPlaceholder('Search by customer email…')).toBeVisible();
    await expect(page.getByLabel('Status filter')).toBeVisible();

    await openFirstOrderWithStatus(page, 'confirmed');

    const processButton = page.getByRole('button', { name: 'Process' });
    await expect(processButton).toBeVisible({ timeout: 15_000 });
    await processButton.click();

    await expect(page.getByText(/processing/i).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByRole('button', { name: 'Ship' }),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('orders can ship a processing order', async ({ page }) => {
    await openAdminShell(page);

    await openFirstOrderWithStatus(page, 'processing');

    const shipButton = page.getByRole('button', { name: 'Ship' });
    await expect(shipButton).toBeVisible({ timeout: 15_000 });
    await shipButton.click();
    await expect(page.getByText(/shipped/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });
});

test('orders status filter updates URL', async ({ page }) => {
  await openAdminShell(page);

  await adminNav(page).getByRole('link', { name: 'Orders', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible({
    timeout: 15_000,
  });

  await page.getByLabel('Status filter').selectOption('confirmed');
  await expect(page).toHaveURL(/status=confirmed/);
});

test('orders column sort updates URL', async ({ page }) => {
  await openAdminShell(page);

  await adminNav(page).getByRole('link', { name: 'Orders', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible({
    timeout: 15_000,
  });

  await page.getByRole('button', { name: 'Total' }).click();
  await expect(page).toHaveURL(/sortBy=totalPrice/);
});
