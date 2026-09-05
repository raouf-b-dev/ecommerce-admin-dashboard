import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

async function main() {
  const assetsDir = path.resolve(process.cwd(), 'docs/assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
  });

  const page = await context.newPage();

  // Pre-seed dark theme in localStorage before initial load
  await page.addInitScript(() => {
    localStorage.setItem('admin-ui-theme', 'dark');
  });

  const baseUrl = process.env.BASE_URL ?? 'http://localhost:5175';

  console.log(`Logging in via mock mode at ${baseUrl}...`);
  await page.goto(`${baseUrl}/login`);
  await page.waitForSelector('text=Demo 1-Click Login', { timeout: 10_000 });
  await page.click('text=Demo 1-Click Login');
  await page.waitForURL(`${baseUrl}/`, { timeout: 10_000 });

  // Ensure dark theme is active on documentElement
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });

  console.log('Capturing Dashboard Dark...');
  // Ensure period selector and metrics are loaded
  await page.waitForSelector('button:has-text("30 days")', { timeout: 10_000 });
  await page.waitForTimeout(1500); // Allow charts and badges to settle

  const dashboardPath = path.join(assetsDir, 'screenshot-dashboard-dark.png');
  await page.screenshot({ path: dashboardPath });
  console.log('Saved:', dashboardPath);

  console.log('Capturing Order Detail...');
  await page.goto(`${baseUrl}/orders`);
  await page.waitForSelector('table tbody tr', { timeout: 10_000 });
  // Click the first "View" link
  const viewLink = page.locator('table tbody tr a:has-text("View")').first();
  await viewLink.click();
  await page.waitForURL(/\/orders\/\d+/, { timeout: 10_000 });
  await page.waitForSelector('text=Line items', { timeout: 10_000 });
  await page.waitForSelector('text=Financial summary', { timeout: 10_000 });
  await page.waitForTimeout(1000);

  const orderDetailPath = path.join(assetsDir, 'screenshot-order-detail.png');
  await page.screenshot({ path: orderDetailPath });
  console.log('Saved:', orderDetailPath);

  console.log('Capturing RBAC Matrix...');
  await page.goto(`${baseUrl}/settings/roles`);
  await page.waitForSelector('table tbody tr', { timeout: 10_000 });
  // Find Edit button for the second role (Admin) or first role (Super Admin)
  const editButton = page.locator('table tbody tr button:has-text("Edit")').nth(1);
  await editButton.click();
  await page.waitForSelector('[role="dialog"]', { timeout: 10_000 });
  await page.waitForSelector('text=Catalog & Products', { timeout: 10_000 });
  await page.waitForTimeout(1000);

  const rbacPath = path.join(assetsDir, 'screenshot-rbac-matrix.png');
  await page.screenshot({ path: rbacPath });
  console.log('Saved:', rbacPath);

  await browser.close();
  console.log('All 3 Retina stills captured successfully!');
}

main().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
