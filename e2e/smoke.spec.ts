import { test, expect } from '@playwright/test';

test('admin shell loads', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Control Center')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
