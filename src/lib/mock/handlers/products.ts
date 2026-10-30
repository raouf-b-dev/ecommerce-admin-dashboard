import { http, HttpResponse } from 'msw/http';
import { getMockStore, isoNow } from '@/lib/mock/data/store';
import type {
  CreateProductDto,
  ProductDetailResponseDto,
  ProductListItemResponseDto,
  ProductResponseDto,
  UpdateProductDto,
} from '@/lib/mock/data/types';
import {
  paginate,
  parseOptionalBoolean,
  parseOptionalNumber,
  parsePositiveInt,
  sortByKey,
} from '@/lib/mock/lib/paginate-filter';

/** Matches mock platform config (USD, exponent 2). */
const MOCK_DEFAULT_CURRENCY = 'USD';
const MOCK_DEFAULT_CURRENCY_EXPONENT = 2;

function categoryNameForId(categoryId?: number | null): string | null {
  if (categoryId == null) return null;
  return (
    getMockStore().categories.find((category) => category.id === categoryId)
      ?.name ?? null
  );
}

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
    categoryName: product.categoryName ?? categoryNameForId(product.categoryId),
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
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

/** Mirrors API Product.generateSlug. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function normalizeSku(sku: string | undefined): string | undefined {
  const trimmed = sku?.trim();
  return trimmed && trimmed.length > 0 ? trimmed.toUpperCase() : undefined;
}

/**
 * Mirrors API minorUnitsFromDecimal for a JSON number: extra fraction digits
 * are rejected when any are non-zero beyond the currency exponent.
 */
function isAmountInvalidForExponent(price: number, exponent: number): boolean {
  if (!Number.isFinite(price) || price < 0) {
    return true;
  }

  const text = String(price);
  const dot = text.indexOf('.');
  if (dot === -1) {
    return false;
  }

  const fraction = text.slice(dot + 1);
  if (fraction.length <= exponent) {
    return false;
  }

  return /[1-9]/.test(fraction.slice(exponent));
}

function currencyExponent(currency: string): number {
  if (currency.toUpperCase() === MOCK_DEFAULT_CURRENCY) {
    return MOCK_DEFAULT_CURRENCY_EXPONENT;
  }
  return MOCK_DEFAULT_CURRENCY_EXPONENT;
}

function amountInvalidResponse() {
  return HttpResponse.json(
    {
      message: 'Amount must be a non-negative decimal',
      statusCode: 400,
      code: 'AMOUNT_INVALID',
    },
    { status: 400 },
  );
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

  http.post<never, CreateProductDto>('*/v1/products', async ({ request }) => {
    const body = await request.json();
    const store = getMockStore();
    const createdAt = isoNow();
    if (!body.currency?.trim()) {
      return HttpResponse.json(
        { message: 'Currency is required', statusCode: 400 },
        { status: 400 },
      );
    }

    const currency = body.currency.trim().toUpperCase();
    if (
      isAmountInvalidForExponent(body.price, currencyExponent(currency))
    ) {
      return amountInvalidResponse();
    }

    const sku = normalizeSku(body.sku) ?? `SKU-${Date.now()}`;
    const slug = body.slug?.trim()
      ? slugify(body.slug)
      : slugify(body.name);

    const product: ProductDetailResponseDto = {
      id: store.nextProductId++,
      name: body.name,
      slug,
      sku,
      price: body.price,
      currency,
      imageUrl: body.imageUrl ?? null,
      categoryId: body.categoryId,
      categoryName: categoryNameForId(body.categoryId),
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

  http.patch<{ id: string }, UpdateProductDto>(
    '*/v1/products/:id',
    async ({ params, request }) => {
      const id = Number(params.id);
      const store = getMockStore();
      const product = store.products.find((item) => item.id === id);
      if (!product) {
        return HttpResponse.json(
          { message: 'Product not found', statusCode: 404 },
          { status: 404 },
        );
      }

      const body = await request.json();
      const nextCurrency = body.currency?.trim()
        ? body.currency.trim().toUpperCase()
        : product.currency;
      const nextPrice = body.price ?? product.price;

      if (
        isAmountInvalidForExponent(
          nextPrice,
          currencyExponent(nextCurrency),
        )
      ) {
        return amountInvalidResponse();
      }

      Object.assign(product, body, {
        updatedAt: isoNow(),
        currency: nextCurrency,
      });

      if (body.slug !== undefined) {
        product.slug = body.slug.trim()
          ? slugify(body.slug)
          : slugify(product.name);
      }
      if (body.sku !== undefined) {
        const normalized = normalizeSku(body.sku);
        if (normalized) {
          product.sku = normalized;
        }
      }
      if (body.categoryId !== undefined) {
        product.categoryName = categoryNameForId(body.categoryId);
      }
      const inventory = store.inventory.find((row) => row.productId === id);
      if (inventory) {
        inventory.productTitle = product.name;
        inventory.sku = product.sku;
        inventory.updatedAt = product.updatedAt;
      }

      return HttpResponse.json(toResponse(product));
    },
  ),

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
    if (product.categoryId == null) {
      return HttpResponse.json(
        {
          message: 'Cannot activate a product without a category',
          statusCode: 400,
        },
        { status: 400 },
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
