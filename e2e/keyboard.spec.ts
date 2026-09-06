import { test, expect } from '@playwright/test';
import { loginAsAdmin, adminNav } from './helpers/auth';

test('skip link moves focus to main', async ({ page }) => {
  test.skip(
    !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
    'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (see e2e/README.md).',
  );

  await loginAsAdmin(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

test('desktop sidebar links are keyboard reachable', async ({ page }) => {
  test.skip(
    !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
    'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (see e2e/README.md).',
  );

  await page.setViewportSize({ width: 1280, height: 800 });
  await loginAsAdmin(page);

  await adminNav(page).getByRole('link', { name: 'Products', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible({
    timeout: 15_000,
  });
});

test('mobile sheet opens from keyboard and closes on Escape', async ({ page }) => {
  test.skip(
    !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
    'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (see e2e/README.md).',
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await loginAsAdmin(page);

  const menu = page.getByRole('button', { name: 'Open navigation menu' });
  await expect(menu).toBeVisible();
  await menu.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('link', { name: 'Products' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
});

test('adjust stock dialog closes on Escape', async ({ page }) => {
  test.skip(
    !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
    'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (see e2e/README.md).',
  );

  await page.setViewportSize({ width: 1280, height: 800 });
  await loginAsAdmin(page);
  await adminNav(page).getByRole('link', { name: 'Inventory', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Inventory' })).toBeVisible({
    timeout: 15_000,
  });

  const viewLink = page.getByRole('link', { name: 'View' }).first();
  await expect(viewLink).toBeVisible({ timeout: 15_000 });
  await viewLink.click();

  const adjust = page.getByRole('button', { name: 'Adjust stock' }).first();
  await expect(adjust).toBeVisible({ timeout: 15_000 });
  await adjust.click();
  await expect(page.getByRole('heading', { name: 'Adjust stock' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Adjust stock' })).toHaveCount(0);
});
