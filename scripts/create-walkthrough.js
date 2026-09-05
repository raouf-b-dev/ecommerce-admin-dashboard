import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

/**
 * Encodes multiple WebP screenshots into an official RIFF/VP8X animated WebP.
 * Follows Google WebP Container Specification:
 * https://developers.google.com/speed/webp/docs/riff_container#extended_file_format
 */
function createAnimatedWebp(frames, width, height, durationMs = 1200) {
  const anmfChunks = [];

  for (const frameBuf of frames) {
    // Single-frame WebP structure:
    // RIFF (4) + size (4) + WEBP (4) + subchunks...
    let offset = 12;
    const subChunks = [];

    while (offset < frameBuf.length) {
      const chunkId = frameBuf.toString('ascii', offset, offset + 4);
      const chunkSize = frameBuf.readUInt32LE(offset + 4);
      const paddedSize = chunkSize + (chunkSize % 2);
      const chunkTotalLen = 8 + paddedSize;

      // Keep only image data chunks: VP8, VP8L, ALPH
      if (chunkId === 'VP8 ' || chunkId === 'VP8L' || chunkId === 'ALPH') {
        subChunks.push(frameBuf.subarray(offset, offset + chunkTotalLen));
      }
      offset += chunkTotalLen;
    }

    const payload = Buffer.concat(subChunks);

    // ANMF chunk header (16 bytes payload + image chunks)
    const anmfHeader = Buffer.alloc(16);
    // Frame X (3 bytes LE)
    anmfHeader.writeUIntLE(0, 0, 3);
    // Frame Y (3 bytes LE)
    anmfHeader.writeUIntLE(0, 3, 3);
    // Frame Width - 1 (3 bytes LE)
    anmfHeader.writeUIntLE(width - 1, 6, 3);
    // Frame Height - 1 (3 bytes LE)
    anmfHeader.writeUIntLE(height - 1, 9, 3);
    // Frame Duration in ms (3 bytes LE)
    anmfHeader.writeUIntLE(durationMs, 12, 3);
    // Flags: Dispose to background (0x01) + do not blend (0x02) = 0x03
    anmfHeader.writeUInt8(0x02, 15);

    const anmfPayload = Buffer.concat([anmfHeader, payload]);
    const anmfChunkHeader = Buffer.alloc(8);
    anmfChunkHeader.write('ANMF', 0, 4, 'ascii');
    anmfChunkHeader.writeUInt32LE(anmfPayload.length, 4);

    const padding = anmfPayload.length % 2 === 1 ? Buffer.alloc(1) : Buffer.alloc(0);
    anmfChunks.push(Buffer.concat([anmfChunkHeader, anmfPayload, padding]));
  }

  // VP8X header (18 bytes total)
  const vp8x = Buffer.alloc(18);
  vp8x.write('VP8X', 0, 4, 'ascii');
  vp8x.writeUInt32LE(10, 4);
  vp8x.writeUInt8(0x02, 8); // Animation flag
  vp8x.writeUIntLE(width - 1, 12, 3);
  vp8x.writeUIntLE(height - 1, 15, 3);

  // ANIM header (14 bytes total)
  const anim = Buffer.alloc(14);
  anim.write('ANIM', 0, 4, 'ascii');
  anim.writeUInt32LE(6, 4);
  anim.writeUInt32LE(0x00000000, 8); // Background color
  anim.writeUInt16LE(0, 12); // Loop count (0 = loop indefinitely)

  const body = Buffer.concat([vp8x, anim, ...anmfChunks]);

  const riffHeader = Buffer.alloc(12);
  riffHeader.write('RIFF', 0, 4, 'ascii');
  riffHeader.writeUInt32LE(body.length + 4, 4);
  riffHeader.write('WEBP', 8, 4, 'ascii');

  return Buffer.concat([riffHeader, body]);
}

async function captureWalkthrough() {
  const width = 1280;
  const height = 800;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
  });

  const page = await context.newPage();
  const baseUrl = process.env.BASE_URL ?? 'http://localhost:5175';
  const frames = [];

  async function snap(description) {
    console.log(`Capturing frame: ${description}`);
    await page.waitForTimeout(350);
    const buf = await page.screenshot({ type: 'webp', quality: 80 });
    frames.push(buf);
  }

  // Frame 1: Login page
  await page.goto(`${baseUrl}/login`);
  await page.waitForSelector('text=Demo 1-Click Login', { timeout: 10_000 });
  await snap('1. Login page with Demo 1-Click button');

  // Login
  await page.addInitScript(() => {
    localStorage.setItem('admin-ui-theme', 'dark');
  });
  await page.click('text=Demo 1-Click Login');
  await page.waitForURL(`${baseUrl}/`, { timeout: 10_000 });
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });

  // Frame 2: Dashboard 30 days
  await page.waitForSelector('button:has-text("30 days")', { timeout: 10_000 });
  await snap('2. Dashboard with 30-day KPI overview');

  // Frame 3: Dashboard 7 days period toggle
  const btn7d = page.locator('button:has-text("7 days")');
  await btn7d.click();
  await page.waitForTimeout(500);
  await snap('3. Dashboard period toggled to 7 days');

  // Frame 4: Products list
  await page.goto(`${baseUrl}/products`);
  await page.waitForSelector('table tbody tr', { timeout: 10_000 });
  await snap('4. Products catalog list with toolbar');

  // Frame 5: Products collapsible filter drawer opened
  const filterToggle = page.locator('button:has-text("Filters")');
  await filterToggle.click();
  await page.waitForSelector('label:has-text("Min price")', { timeout: 10_000 });
  await page.waitForSelector('select#products-category-id', { timeout: 5000 });
  await snap('5. Products collapsible filters drawer with category dropdown');

  // Frame 6: Product edit page (2-column layout with Media asset & Category dropdown)
  const productEditLink = page.locator('table tbody tr a:has-text("Edit")').first();
  await productEditLink.click();
  await page.waitForURL(/\/products\/\d+\/edit/, { timeout: 10_000 });
  await page.waitForSelector('text=Media asset', { timeout: 10_000 });
  await snap('6. Product edit 2-column layout with media asset and category selector');

  // Frame 7: Inventory list
  await page.goto(`${baseUrl}/inventory`);
  await page.waitForSelector('table tbody tr', { timeout: 10_000 });
  await snap('7. Inventory management list');

  // Frame 8: Inventory detail page
  const invDetailLink = page.locator('table tbody tr a:has-text("View")').first();
  await invDetailLink.click();
  await page.waitForURL(/\/inventory\/\d+/, { timeout: 10_000 });
  await page.waitForSelector('text=Available', { timeout: 10_000 });
  await snap('8. Inventory detail with 3 metric cards and allocation breakdown');

  // Frame 9: Adjust stock dialog with live calculation preview
  const adjustStockBtn = page.locator('button:has-text("Adjust stock")').first();
  await adjustStockBtn.click();
  await page.waitForSelector('[role="dialog"]', { timeout: 10_000 });
  const qtyInput = page.locator('input[placeholder="Enter quantity…"]');
  await qtyInput.fill('10');
  await page.waitForSelector('text=Stock preview:', { timeout: 5000 });
  await snap('9. Adjust stock dialog with live calculation preview');

  // Close dialog
  const cancelBtn = page.locator('button:has-text("Cancel")');
  await cancelBtn.click();
  await page.waitForTimeout(400);

  // Frame 10: Orders list
  await page.goto(`${baseUrl}/orders`);
  await page.waitForSelector('table tbody tr', { timeout: 10_000 });
  await snap('10. Orders list with quick search');

  // Frame 11: Order detail 2-column layout
  const orderDetailLink = page.locator('table tbody tr a:has-text("View")').first();
  await orderDetailLink.click();
  await page.waitForURL(/\/orders\/\d+/, { timeout: 10_000 });
  await page.waitForSelector('text=Line items', { timeout: 10_000 });
  await page.waitForSelector('text=Financial summary', { timeout: 10_000 });
  await snap('11. Order detail 2-column card layout');

  // Frame 12: Users list
  await page.goto(`${baseUrl}/users`);
  await page.waitForSelector('table tbody tr', { timeout: 10_000 });
  await snap('12. Users directory with role filters');

  // Frame 13: User detail page (2-column layout with UserAvatar, Addresses & Danger Zone)
  const userDetailLink = page.locator('table tbody tr a:has-text("View")').first();
  await userDetailLink.click();
  await page.waitForURL(/\/users\/\d+/, { timeout: 10_000 });
  await page.waitForSelector('text=Profile details', { timeout: 10_000 });
  await page.waitForSelector('text=Addresses', { timeout: 10_000 });
  await snap('13. User detail 2-column layout with initials avatar & address book');

  // Frame 14: Settings Roles list
  await page.goto(`${baseUrl}/settings/roles`);
  await page.waitForSelector('table tbody tr', { timeout: 10_000 });
  await snap('14. Role management with human-friendly typography');

  // Frame 15: Edit Admin Role Dialog with domain-grouped permissions
  const editRoleBtn = page.locator('table tbody tr button:has-text("Edit")').nth(1);
  await editRoleBtn.click();
  await page.waitForSelector('[role="dialog"]', { timeout: 10_000 });
  await page.waitForSelector('text=Catalog & Products', { timeout: 10_000 });
  await snap('15. Edit Role dialog with domain-grouped permissions');

  await browser.close();

  console.log(`Encoding ${frames.length} frames into animated WebP...`);
  const animWebp = createAnimatedWebp(frames, width, height, 1200); // ~15s total loop

  const destPath = path.resolve('docs/assets/dashboard-walkthrough.webp');
  fs.writeFileSync(destPath, animWebp);
  const sizeMB = (animWebp.length / (1024 * 1024)).toFixed(2);
  console.log(`Successfully generated ${destPath}! Size: ${animWebp.length} bytes (${sizeMB} MB)`);
}

captureWalkthrough().catch((err) => {
  console.error('Failed to create walkthrough:', err);
  process.exit(1);
});
