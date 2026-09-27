import { test, expect, openAdminShell, adminNav } from './helpers/admin-fixtures';
import { SEEDED_CUSTOMER_EMAIL } from './helpers/seed';
import { openUserDetailByEmail, userRowByEmail } from './helpers/users';

test('users list opens after login', async ({ page }) => {
  await openAdminShell(page);

  await adminNav(page).getByRole('link', { name: 'Users', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByLabel('Search')).toBeVisible();
  await expect(page.getByLabel('Status')).toBeVisible();
  await expect(page.getByLabel('Role')).toBeVisible();

  await page.getByLabel('Search').fill(SEEDED_CUSTOMER_EMAIL);
  await page.getByRole('button', { name: 'Apply filters' }).click();
  await expect(
    userRowByEmail(page, SEEDED_CUSTOMER_EMAIL),
  ).toBeVisible({ timeout: 15_000 });
});

test('admin user detail does not show role assignment', async ({ page }) => {
  await openAdminShell(page);

  const adminEmail = process.env.E2E_ADMIN_EMAIL ?? 'admin@store.local';
  await openUserDetailByEmail(page, adminEmail);

  await expect(
    page.getByRole('button', { name: 'Change role' }),
  ).toHaveCount(0);
  await expect(page.getByLabel('Assigned role')).toHaveCount(0);
});

test('customer detail shows addresses and can add then delete one', async ({
  page,
}) => {
  await openAdminShell(page);
  await openUserDetailByEmail(page, SEEDED_CUSTOMER_EMAIL);

  await expect(
    page.getByRole('heading', { name: 'Addresses' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Add address' }),
  ).toBeVisible();

  const street = `E2E ${Date.now()} Test St`;

  try {
    await page.getByRole('button', { name: 'Add address' }).click();
    const form = page.getByRole('dialog');
    await form.getByLabel('Street', { exact: true }).fill(street);
    await form.getByLabel('Street line 2').fill('Suite 1');
    await form.getByLabel('City').fill('Algiers');
    await form.getByLabel('State').fill('Algiers');
    await form.getByLabel('Postal code').fill('16000');
    await form.getByLabel('Country').fill('DZ');
    await form.getByRole('button', { name: 'Add address' }).click();
    await expect(page.getByText(street)).toBeVisible({ timeout: 15_000 });

    const card = page.getByRole('listitem').filter({ hasText: street });
    await card.getByRole('button', { name: 'Set default' }).click();
    await expect(card.getByText('Default', { exact: true })).toBeVisible({
      timeout: 15_000,
    });
  } finally {
    const card = page.getByRole('listitem').filter({ hasText: street });
    if (await card.count()) {
      await card.getByRole('button', { name: 'Delete' }).click();
      await page
        .getByRole('dialog')
        .getByRole('button', { name: 'Delete' })
        .click();
      await expect(page.getByText(street)).toHaveCount(0, { timeout: 15_000 });
    }
  }
});

test('customer detail can deactivate then reactivate', async ({ page }) => {
  await openAdminShell(page);
  await openUserDetailByEmail(page, SEEDED_CUSTOMER_EMAIL);

  await expect(
    page.getByRole('heading', { name: 'Danger Zone' }),
  ).toBeVisible({ timeout: 15_000 });

  const deactivate = page.getByRole('button', {
    name: 'Deactivate user',
    exact: true,
  });
  const activate = page.getByRole('button', {
    name: 'Activate user',
    exact: true,
  });

  await expect(deactivate).toBeVisible({ timeout: 15_000 });
  await deactivate.click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Deactivate', exact: true })
    .click();
  await expect(activate).toBeVisible({ timeout: 15_000 });
  await activate.click();
  await expect(deactivate).toBeVisible({ timeout: 15_000 });
});
