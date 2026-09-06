import { test, expect, openAdminShell, adminNav } from './helpers/admin-fixtures';

test('skip link moves focus to main', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openAdminShell(page);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

test('desktop sidebar links are keyboard reachable', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openAdminShell(page);

  await adminNav(page).getByRole('link', { name: 'Products', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible({
    timeout: 15_000,
  });
});

test('mobile sheet opens from keyboard and closes on Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openAdminShell(page);

  const menu = page.getByRole('button', { name: 'Open navigation menu' });
  await expect(menu).toBeVisible();
  await menu.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('link', { name: 'Products' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
});

test('adjust stock dialog closes on Escape', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openAdminShell(page);
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
