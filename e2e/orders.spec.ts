import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test('orders list opens detail and can process a confirmed order', async ({
  page,
}) => {
  test.skip(
    !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
    'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (see e2e/README.md). Requires API db:seed demo orders.',
  );

  await loginAsAdmin(page);

  await page.getByRole('link', { name: 'Orders' }).click();
  await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByLabel('Customer email')).toBeVisible();
  await expect(page.getByLabel('Status')).toBeVisible();

  await page.getByLabel('Status').selectOption('confirmed');
  await expect(page.getByText('Page')).toBeVisible({ timeout: 15_000 });

  const viewLink = page.getByRole('link', { name: 'View' }).first();
  const hasConfirmed = await viewLink.isVisible().catch(() => false);
  test.skip(
    !hasConfirmed,
    'No confirmed seeded orders — run API npm run db:seed.',
  );

  await viewLink.click();
  await expect(page).toHaveURL(/\/orders\/\d+/);
  await expect(page.getByText('Status actions')).toBeVisible({
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
