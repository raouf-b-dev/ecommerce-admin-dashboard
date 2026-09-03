import { http, HttpResponse } from 'msw';
import { getMockStore, isoNow } from '@/lib/mock/data/store';
import type {
  ProductDetailResponseDto,
  ProductListItemResponseDto,
  ProductResponseDto,
} from '@/lib/mock/data/types';
import {
  paginate,
  parseOptionalBoolean,
  parseOptionalNumber,
  parsePositiveInt,
  sortByKey,
} from '@/lib/mock/lib/paginate-filter';

function toListItem(
  product: ProductDetailResponseDto,
): ProductListItemResponseDto {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    price: product.price,
    currency: product.currency,
    imageUrl: product.imageUrl,
    categoryId: product.categoryId,
    isActive: product.isActive,
    createdAt: product.createdAt,
  };
}

function toResponse(product: ProductDetailResponseDto): ProductResponseDto {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? undefined,
    price: product.price,
    currency: product.currency,
    sku: product.sku,
    imageUrl: product.imageUrl,
    categoryId: product.categoryId,
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const productsHandlers = [
  http.get('*/v1/products', ({ request }) => {
    const url = new URL(request.url);
    const page = parsePositiveInt(url.searchParams.get('page'), 1);
    const limit = parsePositiveInt(url.searchParams.get('limit'), 10);
    const search = url.searchParams.get('search')?.trim().toLowerCase();
    const isActive = parseOptionalBoolean(url.searchParams.get('isActive'));
    const minPrice = parseOptionalNumber(url.searchParams.get('minPrice'));
    const maxPrice = parseOptionalNumber(url.searchParams.get('maxPrice'));
    const categoryId = parseOptionalNumber(url.searchParams.get('categoryId'));
    const sortBy = url.searchParams.get('sortBy');
    const sortOrder = url.searchParams.get('sortOrder');

    let items = getMockStore().products.map(toListItem);

    if (search) {
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(search) ||
          item.sku.toLowerCase().includes(search) ||
          item.slug.toLowerCase().includes(search),
      );
    }
    if (isActive !== undefined) {
      items = items.filter((item) => item.isActive === isActive);
    }
    if (minPrice !== undefined) {
      items = items.filter((item) => item.price >= minPrice);
    }
    if (maxPrice !== undefined) {
      items = items.filter((item) => item.price <= maxPrice);
    }
    if (categoryId !== undefined) {
      items = items.filter((item) => item.categoryId === categoryId);
    }

    items = sortByKey(items, sortBy, sortOrder, {
      createdAt: (item) => item.createdAt,
      price: (item) => item.price,
      name: (item) => item.name.toLowerCase(),
      id: (item) => item.id,
    });

    return HttpResponse.json(paginate(items, page, limit));
  }),

  http.get('*/v1/products/:id', ({ params }) => {
    const id = Number(params.id);
    const product = getMockStore().products.find((item) => item.id === id);
    if (!product) {
      return HttpResponse.json(
        { message: 'Product not found', statusCode: 404 },
        { status: 404 },
      );
    }
    return HttpResponse.json(product);
  }),

  http.post('*/v1/products', async ({ request }) => {
    const body = (await request.json()) as {
      name: string;
      slug?: string;
      description?: string;
      sku?: string;
      price: number;
      currency?: string;
      imageUrl?: string;
      categoryId?: number;
    };

    const store = getMockStore();
    const createdAt = isoNow();
    const product: ProductDetailResponseDto = {
      id: store.nextProductId++,
      name: body.name,
      slug: body.slug?.trim() || slugify(body.name),
      sku: body.sku?.trim() || `SKU-${Date.now()}`,
      price: body.price,
      currency: body.currency ?? 'USD',
      imageUrl: body.imageUrl ?? null,
      categoryId: body.categoryId ?? null,
      isActive: true,
      createdAt,
      description: body.description ?? null,
      updatedAt: createdAt,
    };

    store.products.unshift(product);
    store.inventory.push({
      id: product.id,
      productId: product.id,
      sku: product.sku,
      productTitle: product.name,
      availableQuantity: 0,
      reservedQuantity: 0,
      totalQuantity: 0,
      updatedAt: createdAt,
      lowStockThreshold: 10,
    });

    return HttpResponse.json(toResponse(product), { status: 201 });
  }),

  http.patch('*/v1/products/:id', async ({ params, request }) => {
    const id = Number(params.id);
    const store = getMockStore();
    const product = store.products.find((item) => item.id === id);
    if (!product) {
      return HttpResponse.json(
        { message: 'Product not found', statusCode: 404 },
        { status: 404 },
      );
    }

    const body = (await request.json()) as Partial<{
      name: string;
      slug: string;
      description: string;
      sku: string;
      price: number;
      currency: string;
      imageUrl: string;
      categoryId: number;
    }>;

    Object.assign(product, body, { updatedAt: isoNow() });
    const inventory = store.inventory.find((row) => row.productId === id);
    if (inventory) {
      inventory.productTitle = product.name;
      inventory.sku = product.sku;
      inventory.updatedAt = product.updatedAt;
    }

    return HttpResponse.json(toResponse(product));
  }),

  http.delete('*/v1/products/:id', ({ params }) => {
    const id = Number(params.id);
    const store = getMockStore();
    const index = store.products.findIndex((item) => item.id === id);
    if (index < 0) {
      return HttpResponse.json(
        { message: 'Product not found', statusCode: 404 },
        { status: 404 },
      );
    }
    store.products.splice(index, 1);
    store.inventory = store.inventory.filter((row) => row.productId !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('*/v1/products/:id/activate', ({ params }) => {
    const id = Number(params.id);
    const product = getMockStore().products.find((item) => item.id === id);
    if (!product) {
      return HttpResponse.json(
        { message: 'Product not found', statusCode: 404 },
        { status: 404 },
      );
    }
    product.isActive = true;
    product.updatedAt = isoNow();
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('*/v1/products/:id/deactivate', ({ params }) => {
    const id = Number(params.id);
    const product = getMockStore().products.find((item) => item.id === id);
    if (!product) {
      return HttpResponse.json(
        { message: 'Product not found', statusCode: 404 },
        { status: 404 },
      );
    }
    product.isActive = false;
    product.updatedAt = isoNow();
    return new HttpResponse(null, { status: 204 });
  }),
];
