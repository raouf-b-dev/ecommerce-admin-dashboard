// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: AGPL-3.0-only

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
  DEMO_CATALOG_OPERATOR_EMAIL,
  DEMO_CATALOG_OPERATOR_PASSWORD,
} from '@/lib/mock/constants';
import { resetMockStore } from '@/lib/mock/data/store';
import { handlers } from '@/lib/mock/handlers';

const API = 'http://localhost:3000';
const server = setupServer(...handlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  resetMockStore();
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
    });
  });
});
