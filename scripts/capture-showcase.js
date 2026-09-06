import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

async function main() {
  const assetsDir = path.resolve(process.cwd(), 'docs/assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const baseUrl = process.env.BASE_URL ?? 'http://localhost:5175';

  console.log(`Starting showcase capture at ${baseUrl} (1440x900 @ 2x -> 2880x1800)...`);
  const browser = await chromium.launch({ headless: true });

  // -------------------------------------------------------------
  // 1. CAPTURE ALL DARK THEME STILLS
  // -------------------------------------------------------------
  console.log('\n=== CAPTURING DARK THEME STILLS ===');
  const darkContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
  });
  const darkPage = await darkContext.newPage();
  await darkPage.addInitScript(() => {
    localStorage.setItem('admin-ui-theme', 'dark');
  });

  // Login Dark
  console.log('Logging in via mock mode (dark context)...');
  await darkPage.goto(`${baseUrl}/login`);
  await darkPage.waitForSelector('text=Demo 1-Click Login', { timeout: 15_000 });
  await darkPage.click('text=Demo 1-Click Login');
  await darkPage.waitForURL(`${baseUrl}/`, { timeout: 15_000 });
  await darkPage.waitForSelector('button:has-text("30 days")', { timeout: 10_000 });
  await darkPage.waitForTimeout(1000);

  // Dashboard Dark
  console.log('Capturing Dashboard Dark...');
  const dashDarkPath = path.join(assetsDir, 'screenshot-dashboard-dark.png');
  await darkPage.screenshot({ path: dashDarkPath });
  console.log('Saved:', dashDarkPath);

  // Products Table Dark
  console.log('Capturing Products Table Dark...');
  await darkPage.goto(`${baseUrl}/products`);
  await darkPage.waitForSelector('table tbody tr', { timeout: 10_000 });
  await darkPage.waitForTimeout(800);
  const prodDarkPath = path.join(assetsDir, 'screenshot-products-dark.png');
  await darkPage.screenshot({ path: prodDarkPath });
  console.log('Saved:', prodDarkPath);

  // Categories Page Dark
  console.log('Capturing Categories Page Dark...');
  await darkPage.goto(`${baseUrl}/products/categories`);
  await darkPage.waitForSelector('table tbody tr', { timeout: 10_000 });
  await darkPage.waitForTimeout(800);
  const catDarkPath = path.join(assetsDir, 'screenshot-categories-dark.png');
  await darkPage.screenshot({ path: catDarkPath });
  console.log('Saved:', catDarkPath);

  // Category Create Modal (Dark)
  console.log('Capturing Category Create Modal...');
  const createBtn = darkPage.locator('button:has-text("Create category")');
  await createBtn.click();
  await darkPage.waitForSelector('[role="dialog"]', { timeout: 10_000 });
  await darkPage.waitForTimeout(600);
  const createModalPath = path.join(assetsDir, 'screenshot-category-create-modal.png');
  await darkPage.screenshot({ path: createModalPath });
  console.log('Saved:', createModalPath);
  await darkPage.keyboard.press('Escape');
  await darkPage.waitForTimeout(400);

  // Category Delete Modal (Dark)
  console.log('Capturing Category Delete Modal...');
  const deleteBtn = darkPage.locator('table tbody tr button:has-text("Delete")').first();
  await deleteBtn.click();
  await darkPage.waitForSelector('[role="dialog"]', { timeout: 10_000 });
  await darkPage.waitForTimeout(600);
  const deleteModalPath = path.join(assetsDir, 'screenshot-category-delete-modal.png');
  await darkPage.screenshot({ path: deleteModalPath });
  console.log('Saved:', deleteModalPath);
  await darkPage.keyboard.press('Escape');
  await darkPage.waitForTimeout(400);

  // Product Edit Dark
  console.log('Capturing Product Edit Dark...');
  await darkPage.goto(`${baseUrl}/products`);
  await darkPage.waitForSelector('table tbody tr', { timeout: 10_000 });
  const prodEditLink = darkPage.locator('table tbody tr a:has-text("Edit")').first();
  await prodEditLink.click();
  await darkPage.waitForURL(/\/products\/\d+\/edit/, { timeout: 10_000 });
  await darkPage.waitForSelector('text=Media asset', { timeout: 10_000 });
  await darkPage.waitForTimeout(800);
  const prodEditDarkPath = path.join(assetsDir, 'screenshot-product-edit-dark.png');
  await darkPage.screenshot({ path: prodEditDarkPath });
  console.log('Saved:', prodEditDarkPath);

  // Order Detail Dark
  console.log('Capturing Order Detail Dark...');
  await darkPage.goto(`${baseUrl}/orders`);
  await darkPage.waitForSelector('table tbody tr', { timeout: 10_000 });
  const orderDetailLink = darkPage.locator('table tbody tr a:has-text("View")').first();
  await orderDetailLink.click();
  await darkPage.waitForURL(/\/orders\/\d+/, { timeout: 10_000 });
  await darkPage.waitForSelector('text=Line items', { timeout: 10_000 });
  await darkPage.waitForSelector('text=Financial summary', { timeout: 10_000 });
  await darkPage.waitForTimeout(800);
  const orderDarkPath = path.join(assetsDir, 'screenshot-order-detail-dark.png');
  await darkPage.screenshot({ path: orderDarkPath });
  fs.copyFileSync(orderDarkPath, path.join(assetsDir, 'screenshot-order-detail.png'));
  console.log('Saved:', orderDarkPath, 'and screenshot-order-detail.png');

  // Inventory Detail Dark
  console.log('Capturing Inventory Detail Dark...');
  await darkPage.goto(`${baseUrl}/inventory`);
  await darkPage.waitForSelector('table tbody tr', { timeout: 10_000 });
  const invDetailLink = darkPage.locator('table tbody tr a:has-text("View")').first();
  await invDetailLink.click();
  await darkPage.waitForURL(/\/inventory\/\d+/, { timeout: 10_000 });
  await darkPage.waitForSelector('text=Available', { timeout: 10_000 });
  await darkPage.waitForTimeout(800);
  const invDarkPath = path.join(assetsDir, 'screenshot-inventory-detail-dark.png');
  await darkPage.screenshot({ path: invDarkPath });
  console.log('Saved:', invDarkPath);

  // User Detail Dark
  console.log('Capturing User Detail Dark...');
  await darkPage.goto(`${baseUrl}/users`);
  await darkPage.waitForSelector('table tbody tr', { timeout: 10_000 });
  const userDetailLink = darkPage.locator('table tbody tr a:has-text("View")').first();
  await userDetailLink.click();
  await darkPage.waitForURL(/\/users\/\d+/, { timeout: 10_000 });
  await darkPage.waitForSelector('text=Profile details', { timeout: 10_000 });
  await darkPage.waitForTimeout(800);
  const userDarkPath = path.join(assetsDir, 'screenshot-user-detail-dark.png');
  await darkPage.screenshot({ path: userDarkPath });
  console.log('Saved:', userDarkPath);

  // RBAC Matrix Dark
  console.log('Capturing RBAC Matrix Dark...');
  await darkPage.goto(`${baseUrl}/settings/roles`);
  await darkPage.waitForSelector('table tbody tr', { timeout: 10_000 });
  const editRoleDarkBtn = darkPage.locator('table tbody tr button:has-text("Edit")').nth(1);
  await editRoleDarkBtn.click();
  await darkPage.waitForSelector('[role="dialog"]', { timeout: 10_000 });
  await darkPage.waitForSelector('text=Catalog & Products', { timeout: 10_000 });
  await darkPage.waitForTimeout(800);
  const rbacDarkPath = path.join(assetsDir, 'screenshot-rbac-matrix-dark.png');
  await darkPage.screenshot({ path: rbacDarkPath });
  fs.copyFileSync(rbacDarkPath, path.join(assetsDir, 'screenshot-rbac-matrix.png'));
  console.log('Saved:', rbacDarkPath, 'and screenshot-rbac-matrix.png');
  await darkPage.keyboard.press('Escape');
  await darkPage.waitForTimeout(400);

  await darkContext.close();

  // -------------------------------------------------------------
  // 2. CAPTURE ALL LIGHT THEME STILLS
  // -------------------------------------------------------------
  console.log('\n=== CAPTURING LIGHT THEME STILLS ===');
  const lightContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: 'light',
  });
  const lightPage = await lightContext.newPage();
  await lightPage.addInitScript(() => {
    localStorage.setItem('admin-ui-theme', 'light');
  });

  // Login Light
  console.log('Logging in via mock mode (light context)...');
  await lightPage.goto(`${baseUrl}/login`);
  await lightPage.waitForSelector('text=Demo 1-Click Login', { timeout: 15_000 });
  await lightPage.click('text=Demo 1-Click Login');
  await lightPage.waitForURL(`${baseUrl}/`, { timeout: 15_000 });
  await lightPage.waitForSelector('button:has-text("30 days")', { timeout: 10_000 });
  await lightPage.waitForTimeout(1000);

  // Dashboard Light
  console.log('Capturing Dashboard Light...');
  const dashLightPath = path.join(assetsDir, 'screenshot-dashboard-light.png');
  await lightPage.screenshot({ path: dashLightPath });
  console.log('Saved:', dashLightPath);

  // Products Table Light
  console.log('Capturing Products Table Light...');
  await lightPage.goto(`${baseUrl}/products`);
  await lightPage.waitForSelector('table tbody tr', { timeout: 10_000 });
  await lightPage.waitForTimeout(800);
  const prodLightPath = path.join(assetsDir, 'screenshot-products-light.png');
  await lightPage.screenshot({ path: prodLightPath });
  console.log('Saved:', prodLightPath);

  // Categories Page Light
  console.log('Capturing Categories Page Light...');
  await lightPage.goto(`${baseUrl}/products/categories`);
  await lightPage.waitForSelector('table tbody tr', { timeout: 10_000 });
  await lightPage.waitForTimeout(800);
  const catLightPath = path.join(assetsDir, 'screenshot-categories-light.png');
  await lightPage.screenshot({ path: catLightPath });
  console.log('Saved:', catLightPath);

  // Product Edit Light
  console.log('Capturing Product Edit Light...');
  await lightPage.goto(`${baseUrl}/products`);
  await lightPage.waitForSelector('table tbody tr', { timeout: 10_000 });
  const prodEditLightLink = lightPage.locator('table tbody tr a:has-text("Edit")').first();
  await prodEditLightLink.click();
  await lightPage.waitForURL(/\/products\/\d+\/edit/, { timeout: 10_000 });
  await lightPage.waitForSelector('text=Media asset', { timeout: 10_000 });
  await lightPage.waitForTimeout(800);
  const prodEditLightPath = path.join(assetsDir, 'screenshot-product-edit-light.png');
  await lightPage.screenshot({ path: prodEditLightPath });
  console.log('Saved:', prodEditLightPath);

  // Order Detail Light
  console.log('Capturing Order Detail Light...');
  await lightPage.goto(`${baseUrl}/orders`);
  await lightPage.waitForSelector('table tbody tr', { timeout: 10_000 });
  const orderDetailLightLink = lightPage.locator('table tbody tr a:has-text("View")').first();
  await orderDetailLightLink.click();
  await lightPage.waitForURL(/\/orders\/\d+/, { timeout: 10_000 });
  await lightPage.waitForSelector('text=Line items', { timeout: 10_000 });
  await lightPage.waitForSelector('text=Financial summary', { timeout: 10_000 });
  await lightPage.waitForTimeout(800);
  const orderLightPath = path.join(assetsDir, 'screenshot-order-detail-light.png');
  await lightPage.screenshot({ path: orderLightPath });
  console.log('Saved:', orderLightPath);

  // Inventory Detail Light
  console.log('Capturing Inventory Detail Light...');
  await lightPage.goto(`${baseUrl}/inventory`);
  await lightPage.waitForSelector('table tbody tr', { timeout: 10_000 });
  const invDetailLightLink = lightPage.locator('table tbody tr a:has-text("View")').first();
  await invDetailLightLink.click();
  await lightPage.waitForURL(/\/inventory\/\d+/, { timeout: 10_000 });
  await lightPage.waitForSelector('text=Available', { timeout: 10_000 });
  await lightPage.waitForTimeout(800);
  const invLightPath = path.join(assetsDir, 'screenshot-inventory-detail-light.png');
  await lightPage.screenshot({ path: invLightPath });
  console.log('Saved:', invLightPath);

  // User Detail Light
  console.log('Capturing User Detail Light...');
  await lightPage.goto(`${baseUrl}/users`);
  await lightPage.waitForSelector('table tbody tr', { timeout: 10_000 });
  const userDetailLightLink = lightPage.locator('table tbody tr a:has-text("View")').first();
  await userDetailLightLink.click();
  await lightPage.waitForURL(/\/users\/\d+/, { timeout: 10_000 });
  await lightPage.waitForSelector('text=Profile details', { timeout: 10_000 });
  await lightPage.waitForTimeout(800);
  const userLightPath = path.join(assetsDir, 'screenshot-user-detail-light.png');
  await lightPage.screenshot({ path: userLightPath });
  console.log('Saved:', userLightPath);

  // RBAC Matrix Light
  console.log('Capturing RBAC Matrix Light...');
  await lightPage.goto(`${baseUrl}/settings/roles`);
  await lightPage.waitForSelector('table tbody tr', { timeout: 10_000 });
  const editRoleLightBtn = lightPage.locator('table tbody tr button:has-text("Edit")').nth(1);
  await editRoleLightBtn.click();
  await lightPage.waitForSelector('[role="dialog"]', { timeout: 10_000 });
  await lightPage.waitForSelector('text=Catalog & Products', { timeout: 10_000 });
  await lightPage.waitForTimeout(800);
  const rbacLightPath = path.join(assetsDir, 'screenshot-rbac-matrix-light.png');
  await lightPage.screenshot({ path: rbacLightPath });
  console.log('Saved:', rbacLightPath);
  await lightPage.keyboard.press('Escape');

  await lightContext.close();
  await browser.close();

  console.log('\nAll Retina stills (1440x900 @ 2x -> 2880x1800) in both themes successfully captured!');
}

main().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
