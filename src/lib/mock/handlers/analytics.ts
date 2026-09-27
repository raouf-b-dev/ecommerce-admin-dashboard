import { http, HttpResponse } from 'msw';
import { getMockStore } from '@/lib/mock/data/store';
import { parsePositiveInt } from '@/lib/mock/lib/paginate-filter';

function daysBetween(from: string, to: string): number {
  const start = Date.parse(from);
  const end = Date.parse(to);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return 30;
  }
  return Math.max(1, Math.round((end - start) / (24 * 60 * 60 * 1000)) + 1);
}

function buildBuckets(from: string, to: string, bucket: 'day' | 'week') {
  const days = daysBetween(from, to);
  const step = bucket === 'week' ? 7 : 1;
  const buckets = [];
  const start = new Date(from);

  for (let offset = 0; offset < days; offset += step) {
    const point = new Date(start);
    point.setUTCDate(start.getUTCDate() + offset);
    const gross = 800 + ((offset * 137) % 900);
    const refunded = offset % 5 === 0 ? 40 : 0;
    buckets.push({
      bucketStart: point.toISOString(),
      grossAmount: gross,
      refundedAmount: refunded,
      netAmount: gross - refunded,
      capturedCount: 4 + (offset % 8),
      currency: 'USD',
    });
  }

  return buckets;
}

export const analyticsHandlers = [
  http.get('*/v1/admin/analytics/overview', ({ request }) => {
    const url = new URL(request.url);
    const from = url.searchParams.get('from') ?? '2026-02-01T00:00:00.000Z';
    const to = url.searchParams.get('to') ?? '2026-03-01T23:59:59.999Z';
    const store = getMockStore();

    const attentionStatuses = ['pending_payment', 'confirmed', 'processing'] as const;
    const ordersNeedingAttention = attentionStatuses.map((status) => ({
      status,
      count: store.orders.filter((order) => order.status === status).length,
    }));

    const lowStockCount = store.inventory.filter(
      (row) => row.availableQuantity <= row.lowStockThreshold,
    ).length;

    return HttpResponse.json({
      timezone: 'UTC',
      from,
      to,
      current: {
        netRevenue: 18420.5,
        grossRevenue: 19250.0,
        refundedAmount: 829.5,
        ordersCount: store.orders.length + 36,
        paidOrderCount: 38,
        aov: 484.75,
        currency: 'USD',
      },
      previous: {
        netRevenue: 15110.25,
        grossRevenue: 15800.0,
        refundedAmount: 689.75,
        ordersCount: 40,
        paidOrderCount: 34,
        aov: 444.42,
        currency: 'USD',
      },
      ordersNeedingAttention,
      lowStockCount,
    });
  }),

  http.get('*/v1/admin/analytics/payments/time-series', ({ request }) => {
    const url = new URL(request.url);
    const from = url.searchParams.get('from') ?? '2026-02-01T00:00:00.000Z';
    const to = url.searchParams.get('to') ?? '2026-03-01T23:59:59.999Z';
    const bucket =
      url.searchParams.get('bucket') === 'week' ? ('week' as const) : ('day' as const);

    return HttpResponse.json({
      timezone: 'UTC',
      bucket,
      from,
      to,
      buckets: buildBuckets(from, to, bucket),
    });
  }),

  http.get('*/v1/admin/analytics/products/top', ({ request }) => {
    const url = new URL(request.url);
    const from = url.searchParams.get('from') ?? '2026-02-01T00:00:00.000Z';
    const to = url.searchParams.get('to') ?? '2026-03-01T23:59:59.999Z';
    const limit = parsePositiveInt(url.searchParams.get('limit'), 5);
    const products = getMockStore().products.slice(0, limit);

    return HttpResponse.json({
      timezone: 'UTC',
      from,
      to,
      items: products.map((product, index) => ({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        unitsSold: 40 - index * 5,
        lineRevenue: Number((product.price * (40 - index * 5)).toFixed(2)),
      })),
    });
  }),

  http.get('*/v1/admin/analytics/inventory/alerts', ({ request }) => {
    const url = new URL(request.url);
    const limit = parsePositiveInt(url.searchParams.get('limit'), 10);
    const items = getMockStore()
      .inventory.filter(
        (row) => row.availableQuantity <= row.lowStockThreshold,
      )
      .slice(0, limit)
      .map((row) => ({
        productId: row.productId,
        productTitle: row.productTitle,
        sku: row.sku,
        availableQuantity: row.availableQuantity,
        lowStockThreshold: row.lowStockThreshold,
      }));

    return HttpResponse.json({ items });
  }),
];
