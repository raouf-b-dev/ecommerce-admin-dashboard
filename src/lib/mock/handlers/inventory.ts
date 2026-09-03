import { http, HttpResponse } from 'msw';
import { getMockStore, isoNow } from '@/lib/mock/data/store';
import type { InventoryStockResponseDto } from '@/lib/mock/data/types';
import {
  paginate,
  parseOptionalBoolean,
  parseOptionalNumber,
  parsePositiveInt,
  sortByKey,
} from '@/lib/mock/lib/paginate-filter';

export const inventoryHandlers = [
  http.get('*/v1/inventory', ({ request }) => {
    const url = new URL(request.url);
    const page = parsePositiveInt(url.searchParams.get('page'), 1);
    const limit = parsePositiveInt(url.searchParams.get('limit'), 10);
    const sku = url.searchParams.get('sku')?.trim().toLowerCase();
    const productTitle = url.searchParams
      .get('productTitle')
      ?.trim()
      .toLowerCase();
    const lowStockOnly = parseOptionalBoolean(
      url.searchParams.get('lowStockOnly'),
    );
    const productId = parseOptionalNumber(url.searchParams.get('productId'));
    const sortBy = url.searchParams.get('sortBy');
    const sortOrder = url.searchParams.get('sortOrder');

    let items = [...getMockStore().inventory];

    if (sku) {
      items = items.filter((item) => item.sku.toLowerCase().includes(sku));
    }
    if (productTitle) {
      items = items.filter((item) =>
        item.productTitle.toLowerCase().includes(productTitle),
      );
    }
    if (productId !== undefined) {
      items = items.filter((item) => item.productId === productId);
    }
    if (lowStockOnly) {
      items = items.filter(
        (item) => item.availableQuantity <= item.lowStockThreshold,
      );
    }

    items = sortByKey(items, sortBy, sortOrder, {
      availableQuantity: (item) => item.availableQuantity,
      productTitle: (item) => item.productTitle.toLowerCase(),
      sku: (item) => item.sku.toLowerCase(),
      updatedAt: (item) => item.updatedAt,
      id: (item) => item.id,
    });

    const pageResult = paginate(
      items.map(
        ({
          id,
          productId: pid,
          sku: rowSku,
          productTitle: title,
          availableQuantity,
          reservedQuantity,
          totalQuantity,
          updatedAt,
        }) => ({
          id,
          productId: pid,
          sku: rowSku,
          productTitle: title,
          availableQuantity,
          reservedQuantity,
          totalQuantity,
          updatedAt,
        }),
      ),
      page,
      limit,
    );

    return HttpResponse.json(pageResult);
  }),

  http.get('*/v1/inventory/products/:productId', ({ params }) => {
    const productId = Number(params.productId);
    const row = getMockStore().inventory.find(
      (item) => item.productId === productId,
    );
    if (!row) {
      return HttpResponse.json(null);
    }

    return HttpResponse.json({
      id: row.id,
      productId: row.productId,
      sku: row.sku,
      productTitle: row.productTitle,
      availableQuantity: row.availableQuantity,
      reservedQuantity: row.reservedQuantity,
      totalQuantity: row.totalQuantity,
      updatedAt: row.updatedAt,
    });
  }),

  http.post('*/v1/inventory/products/:productId/adjust', async ({
    params,
    request,
  }) => {
    const productId = Number(params.productId);
    const store = getMockStore();
    const row = store.inventory.find((item) => item.productId === productId);
    if (!row) {
      return HttpResponse.json(
        { message: 'Inventory not found', statusCode: 404 },
        { status: 404 },
      );
    }

    const body = (await request.json()) as {
      quantity: number;
      type: 'ADD' | 'SUBTRACT' | 'SET';
      reason?: string;
    };

    if (body.type === 'ADD') {
      row.availableQuantity += body.quantity;
    } else if (body.type === 'SUBTRACT') {
      row.availableQuantity = Math.max(0, row.availableQuantity - body.quantity);
    } else {
      row.availableQuantity = Math.max(0, body.quantity);
    }

    row.totalQuantity = row.availableQuantity + row.reservedQuantity;
    row.updatedAt = isoNow();

    const response: InventoryStockResponseDto = {
      id: row.id,
      productId: row.productId,
      availableQuantity: row.availableQuantity,
      reservedQuantity: row.reservedQuantity,
      totalQuantity: row.totalQuantity,
      lowStockThreshold: row.lowStockThreshold,
      lastRestockDate: row.updatedAt,
      createdAt: row.updatedAt,
      updatedAt: row.updatedAt,
    };

    return HttpResponse.json(response);
  }),
];
