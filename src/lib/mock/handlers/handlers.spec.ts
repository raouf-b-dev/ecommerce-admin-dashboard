import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
  DEMO_CATALOG_OPERATOR_EMAIL,
  DEMO_CATALOG_OPERATOR_PASSWORD,
} from '@/lib/mock/constants';
import { resetMockStore, setMockSessionActive } from '@/lib/mock/data/store';
import { handlers } from '@/lib/mock/handlers';

const API = 'http://localhost:3000';
const server = setupServer(...handlers);

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' });
});

afterEach(() => {
  resetMockStore();
  setMockSessionActive(false);
  server.resetHandlers(...handlers);
});

afterAll(() => {
  server.close();
});

type ProductListBody = {
  items: Array<{ id: number; name: string; categoryId: number | null; price: number }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

async function listProducts(query = ''): Promise<ProductListBody> {
  const response = await fetch(`${API}/v1/products${query}`);
  expect(response.ok).toBe(true);
  return response.json() as Promise<ProductListBody>;
}

describe('admin mock handlers', () => {
  describe('GET /v1/products', () => {
    it('returns only products for the requested categoryId', async () => {
      const body = await listProducts('?categoryId=2');

      expect(body.total).toBeGreaterThan(0);
      expect(body.items.every((item) => item.categoryId === 2)).toBe(true);
    });

    it('returns different product sets for different categories', async () => {
      const electronics = await listProducts('?categoryId=1');
      const clothing = await listProducts('?categoryId=2');

      const electronicsIds = new Set(electronics.items.map((item) => item.id));
      const clothingIds = clothing.items.map((item) => item.id);

      expect(electronics.total).not.toBe(clothing.total);
      expect(clothingIds.some((id) => electronicsIds.has(id))).toBe(false);
    });

    it('filters by search text', async () => {
      const body = await listProducts('?search=hoodie');

      expect(body.total).toBeGreaterThan(0);
      expect(
        body.items.every((item) => item.name.toLowerCase().includes('hoodie')),
      ).toBe(true);
    });

    it('filters by minPrice and maxPrice', async () => {
      const body = await listProducts('?minPrice=50&maxPrice=100');

      expect(body.total).toBeGreaterThan(0);
      expect(
        body.items.every((item) => item.price >= 50 && item.price <= 100),
      ).toBe(true);
    });

    it('sorts by price ascending', async () => {
      const body = await listProducts('?sortBy=price&sortOrder=asc&limit=100');
      const prices = body.items.map((item) => item.price);

      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    it('paginates results', async () => {
      const page1 = await listProducts('?limit=5&page=1');
      const page2 = await listProducts('?limit=5&page=2');

      expect(page1.items).toHaveLength(5);
      expect(page2.items.length).toBeGreaterThan(0);
      expect(page1.items[0]?.id).not.toBe(page2.items[0]?.id);
      expect(page1.total).toBe(page2.total);
    });
  });

  describe('POST /v1/authentication/login', () => {
    it('accepts demo admin credentials', async () => {
      const response = await fetch(`${API}/v1/authentication/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: DEMO_ADMIN_EMAIL,
          password: DEMO_ADMIN_PASSWORD,
        }),
      });

      expect(response.status).toBe(200);
      const body = (await response.json()) as { accessToken?: string };
      expect(body.accessToken).toBeTruthy();
    });

    it('accepts demo catalog operator credentials', async () => {
      const response = await fetch(`${API}/v1/authentication/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: DEMO_CATALOG_OPERATOR_EMAIL,
          password: DEMO_CATALOG_OPERATOR_PASSWORD,
        }),
      });

      expect(response.status).toBe(200);
      const body = (await response.json()) as { accessToken?: string };
      expect(body.accessToken).toBeTruthy();
    });

    it('rejects the wrong password for admin', async () => {
      const response = await fetch(`${API}/v1/authentication/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: DEMO_ADMIN_EMAIL,
          password: 'wrong-password',
        }),
      });

      expect(response.status).toBe(401);
      const body: unknown = await response.json();
      expect(body).toMatchObject({
        success: false,
        statusCode: 401,
        code: 'UNAUTHORIZED',
      });
    });
  });

  describe('PATCH /v1/orders/:id/cancel', () => {
    it('returns 404 ORDER_NOT_FOUND for a missing order', async () => {
      const response = await fetch(`${API}/v1/orders/999999/cancel`, {
        method: 'PATCH',
      });

      expect(response.status).toBe(404);
      const body: unknown = await response.json();
      expect(body).toMatchObject({
        success: false,
        statusCode: 404,
        code: 'ORDER_NOT_FOUND',
      });
      expect(body).toEqual(
        expect.objectContaining({
          timestamp: expect.any(String),
          message: expect.any(String),
        }),
      );
    });
  });

  describe('GET /v1/products/:id', () => {
    it('returns 404 PRODUCT_NOT_FOUND for a missing product', async () => {
      const response = await fetch(`${API}/v1/products/999999`);

      expect(response.status).toBe(404);
      const body: unknown = await response.json();
      expect(body).toMatchObject({
        success: false,
        statusCode: 404,
        code: 'PRODUCT_NOT_FOUND',
      });
    });
  });

  describe('GET /v1/platform/config', () => {
    it('returns platform config with default currency and exponent', async () => {
      const response = await fetch(`${API}/v1/platform/config`);
      expect(response.status).toBe(200);
      const body: unknown = await response.json();
      expect(body).toEqual({
        defaultCurrency: 'USD',
        defaultCurrencyExponent: 2,
        supportedCurrencies: ['USD'],
      });
    });
  });

  describe('POST /v1/products', () => {
    it('rejects prices with excess non-zero scale', async () => {
      const response = await fetch(`${API}/v1/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Overprecise',
          price: 49.999,
          currency: 'USD',
          categoryId: 1,
        }),
      });

      expect(response.status).toBe(400);
      const body: unknown = await response.json();
      expect(body).toMatchObject({
        success: false,
        code: 'AMOUNT_INVALID',
        statusCode: 400,
      });
    });

    it('rejects create without currency with VALIDATION_FAILED', async () => {
      const response = await fetch(`${API}/v1/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'No currency',
          price: 10,
          currency: '   ',
          categoryId: 1,
        }),
      });

      expect(response.status).toBe(400);
      const body: unknown = await response.json();
      expect(body).toMatchObject({
        success: false,
        statusCode: 400,
        code: 'VALIDATION_FAILED',
      });
    });

    it('slugifies a supplied slug and uppercases the SKU', async () => {
      const response = await fetch(`${API}/v1/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Gadget',
          price: 10,
          currency: 'USD',
          categoryId: 1,
          slug: 'UX Slug!',
          sku: ' ux 1 ',
        }),
      });

      expect(response.status).toBe(201);
      const body: unknown = await response.json();
      expect(body).toMatchObject({
        slug: 'ux-slug',
        sku: 'UX 1',
      });
    });
  });

  describe('POST /v1/products/:id/activate', () => {
    it('returns USECASE_ERROR when the product has no category', async () => {
      const create = await fetch(`${API}/v1/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Uncategorized',
          price: 12,
          currency: 'USD',
          categoryId: 1,
        }),
      });
      expect(create.status).toBe(201);
      const created: unknown = await create.json();
      expect(created).toEqual(
        expect.objectContaining({ id: expect.any(Number) }),
      );
      if (
        typeof created !== 'object' ||
        created === null ||
        !('id' in created) ||
        typeof created.id !== 'number'
      ) {
        throw new Error('expected created product id');
      }

      const clearCategory = await fetch(`${API}/v1/products/${created.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: null }),
      });
      expect(clearCategory.status).toBe(200);

      const response = await fetch(
        `${API}/v1/products/${created.id}/activate`,
        { method: 'POST' },
      );

      expect(response.status).toBe(400);
      const body: unknown = await response.json();
      expect(body).toMatchObject({
        success: false,
        statusCode: 400,
        code: 'USECASE_ERROR',
      });
    });
  });

  describe('POST /v1/inventory/products/:productId/adjust', () => {
    it('returns NOT_FOUND when inventory is missing', async () => {
      const response = await fetch(
        `${API}/v1/inventory/products/999999/adjust`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'ADD', quantity: 1 }),
        },
      );

      expect(response.status).toBe(404);
      const body: unknown = await response.json();
      expect(body).toMatchObject({
        success: false,
        statusCode: 404,
        code: 'NOT_FOUND',
      });
    });
  });

  describe('POST /v1/categories', () => {
    it('returns USECASE_ERROR on name conflict', async () => {
      const response = await fetch(`${API}/v1/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Electronics' }),
      });

      expect(response.status).toBe(409);
      const body: unknown = await response.json();
      expect(body).toMatchObject({
        success: false,
        statusCode: 409,
        code: 'USECASE_ERROR',
      });
    });
  });

  describe('POST /v1/categories/:id/activate', () => {
    it('returns DOMAIN_ERROR when already active', async () => {
      const response = await fetch(`${API}/v1/categories/1/activate`, {
        method: 'POST',
      });

      expect(response.status).toBe(400);
      const body: unknown = await response.json();
      expect(body).toMatchObject({
        success: false,
        statusCode: 400,
        code: 'DOMAIN_ERROR',
      });
    });
  });

  describe('DELETE /v1/roles/:id', () => {
    it('returns USECASE_ERROR when deleting a system role', async () => {
      const response = await fetch(`${API}/v1/roles/1`, { method: 'DELETE' });

      expect(response.status).toBe(400);
      const body: unknown = await response.json();
      expect(body).toMatchObject({
        success: false,
        statusCode: 400,
        code: 'USECASE_ERROR',
      });
    });
  });

  describe('POST /v1/authentication/refresh', () => {
    it('returns UNAUTHORIZED when the mock session is inactive', async () => {
      const response = await fetch(`${API}/v1/authentication/refresh`, {
        method: 'POST',
      });

      expect(response.status).toBe(401);
      const body: unknown = await response.json();
      expect(body).toMatchObject({
        success: false,
        statusCode: 401,
        code: 'UNAUTHORIZED',
      });
    });
  });

  describe('POST /v1/authentication/change-password', () => {
    it('returns VALIDATION_FAILED for an incomplete body when signed in', async () => {
      const login = await fetch(`${API}/v1/authentication/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: DEMO_ADMIN_EMAIL,
          password: DEMO_ADMIN_PASSWORD,
        }),
      });
      expect(login.status).toBe(200);

      const response = await fetch(`${API}/v1/authentication/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: '', newPassword: '' }),
      });

      expect(response.status).toBe(400);
      const body: unknown = await response.json();
      expect(body).toMatchObject({
        success: false,
        statusCode: 400,
        code: 'VALIDATION_FAILED',
      });
    });
  });
});
