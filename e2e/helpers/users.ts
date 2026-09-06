import { expect, type Locator, type Page } from '@playwright/test';
import { adminNav } from './auth';

export function userRowByEmail(page: Page, email: string): Locator {
  return page.getByRole('row').filter({
    has: page.getByText(email, { exact: true }),
  });
}

export async function openUserDetailByEmail(
  page: Page,
  email: string,
): Promise<void> {
  await adminNav(page).getByRole('link', { name: 'Users', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible({
    timeout: 15_000,
  });
  await page.getByLabel('Search').fill(email);
  await page.getByRole('button', { name: 'Apply filters' }).click();
  const row = userRowByEmail(page, email);
  await expect(row).toBeVisible({ timeout: 15_000 });
  await row.getByRole('link', { name: 'View' }).click();
  await expect(page).toHaveURL(/\/users\/\d+/);
}
