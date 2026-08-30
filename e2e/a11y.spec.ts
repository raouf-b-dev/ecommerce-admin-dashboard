import { test, expect } from '@playwright/test';
import { loginAsAdmin, adminNav } from './helpers/auth';
import { expectNoSeriousAxeViolations } from './helpers/axe';

test('login page has no serious axe violations', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await expectNoSeriousAxeViolations(page);
});

test('dashboard, products, and order detail have no serious axe violations', async ({
  page,
}) => {
  test.skip(
    !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
    'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (see e2e/README.md).',
  );

  await loginAsAdmin(page);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expectNoSeriousAxeViolations(page);

  await adminNav(page).getByRole('link', { name: 'Products', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible({
    timeout: 15_000,
  });
  await expectNoSeriousAxeViolations(page);

  await adminNav(page).getByRole('link', { name: 'Orders', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible({
    timeout: 15_000,
  });
  const viewLink = page.getByRole('link', { name: 'View' }).first();
  await expect(viewLink).toBeVisible({ timeout: 15_000 });
  await viewLink.click();
  await expect(page.getByRole('heading', { name: 'Status actions' })).toBeVisible({
    timeout: 15_000,
  });
  await expectNoSeriousAxeViolations(page);
});
