import { test, expect, openAdminShell, adminNav } from './helpers/admin-fixtures';

test('orders list opens detail and can process a confirmed order', async ({
  page,
}) => {
  await openAdminShell(page);

  await adminNav(page).getByRole('link', { name: 'Orders', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByPlaceholder('Search by customer email…')).toBeVisible();
  await expect(page.getByLabel('Status')).toBeVisible();

  await page.getByLabel('Status').selectOption('confirmed');
  await expect(page.getByText('Page')).toBeVisible({ timeout: 15_000 });

  const viewLink = page.getByRole('link', { name: 'View' }).first();
  const hasConfirmed = await viewLink.isVisible().catch(() => false);
  test.skip(
    !hasConfirmed,
    'No confirmed seeded orders - run API npm run db:seed.',
  );

  const href = await viewLink.getAttribute('href');
  expect(href).toBeTruthy();
  await page.goto(href!);
  await expect(page).toHaveURL(/\/orders\/\d+/);
  await expect(page.getByRole('heading', { name: 'Status actions' })).toBeVisible({
    timeout: 15_000,
  });

  const processButton = page.getByRole('button', { name: 'Process' });
  await expect(processButton).toBeVisible();
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

  await adminNav(page).getByRole('link', { name: 'Orders', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible({
    timeout: 15_000,
  });

  await page.getByLabel('Status').selectOption('processing');
  await expect(page).toHaveURL(/status=processing/);

  const viewLink = page.getByRole('link', { name: 'View' }).first();
  const hasProcessing = await viewLink.isVisible().catch(() => false);
  test.skip(
    !hasProcessing,
    'No processing orders - run the confirmed-order process spec first or API db:seed.',
  );

  const href = await viewLink.getAttribute('href');
  expect(href).toBeTruthy();
  await page.goto(href!);
  await expect(page.getByRole('heading', { name: 'Status actions' })).toBeVisible({
    timeout: 15_000,
  });

  const shipButton = page.getByRole('button', { name: 'Ship' });
  await expect(shipButton).toBeVisible();
  await shipButton.click();
  await expect(page.getByText(/shipped/i).first()).toBeVisible({
    timeout: 15_000,
  });
});

test('orders status filter updates URL', async ({ page }) => {
  await openAdminShell(page);

  await adminNav(page).getByRole('link', { name: 'Orders', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible({
    timeout: 15_000,
  });

  await page.getByLabel('Status').selectOption('confirmed');
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
