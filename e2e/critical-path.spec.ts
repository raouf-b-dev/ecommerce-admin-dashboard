import {
  test,
  expect,
  openAdminShell,
  openProductEditBySku,
  openFirstOrderDetail,
} from './helpers/admin-fixtures';
import { SEEDED_PRODUCT_SKU } from './helpers/seed';

test('operator journey: dashboard, products, order detail', async ({ page }) => {
  await openAdminShell(page);

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByLabel('Period')).toBeVisible();
  await expect(page.getByText('Needs attention')).toBeVisible({
    timeout: 15_000,
  });

  await openProductEditBySku(page, SEEDED_PRODUCT_SKU);
  await openFirstOrderDetail(page);
});
