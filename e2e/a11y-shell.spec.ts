import {
  test,
  expect,
  openAdminShell,
  adminNav,
  openFirstOrderDetail,
} from './helpers/admin-fixtures';
import { expectNoSeriousAxeViolations } from './helpers/axe';

test('dashboard, products, and order detail have no serious axe violations', async ({
  page,
}) => {
  await openAdminShell(page);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expectNoSeriousAxeViolations(page);

  await adminNav(page).getByRole('link', { name: 'Products', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible({
    timeout: 15_000,
  });
  await expectNoSeriousAxeViolations(page);

  await openFirstOrderDetail(page);
  await expectNoSeriousAxeViolations(page);
});
