import { http, HttpResponse } from 'msw';
import { getMockStore } from '@/lib/mock/data/store';
import type { CategoryResponseDto } from '@/lib/mock/data/types';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function conflict(message: string) {
  return HttpResponse.json({ message, statusCode: 409 }, { status: 409 });
}

function notFound() {
  return HttpResponse.json(
    { message: 'Category not found', statusCode: 404 },
    { status: 404 },
  );
}

export const categoriesHandlers = [
  http.get('*/v1/categories', () => {
    return HttpResponse.json(getMockStore().categories);
  }),

  http.get('*/v1/categories/:id', ({ params }) => {
    const id = Number(params.id);
    const category = getMockStore().categories.find((item) => item.id === id);
    if (!category) {
      return notFound();
    }
    return HttpResponse.json(category);
  }),

  http.post('*/v1/categories', async ({ request }) => {
    const body = (await request.json()) as {
      name: string;
      slug?: string;
      description?: string;
    };
    const store = getMockStore();
    const name = body.name.trim();
    const slug = body.slug?.trim() || slugify(name);

    if (store.categories.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      return conflict('Category name already exists');
    }
    if (store.categories.some((item) => item.slug === slug)) {
      return conflict('Category slug already exists');
    }

    const category: CategoryResponseDto = {
      id: store.nextCategoryId++,
      name,
      slug,
      description: body.description?.trim() || null,
      isActive: true,
    };
    store.categories.push(category);
    return HttpResponse.json(category, { status: 201 });
  }),

  http.patch('*/v1/categories/:id', async ({ params, request }) => {
    const id = Number(params.id);
    const category = getMockStore().categories.find((item) => item.id === id);
    if (!category) {
      return notFound();
    }

    const body = (await request.json()) as {
      name?: string;
      slug?: string;
      description?: string;
    };
    const nextName = body.name?.trim() ?? category.name;
    const nextSlug = body.slug?.trim() || category.slug;
    const store = getMockStore();

    if (
      store.categories.some(
        (item) =>
          item.id !== id && item.name.toLowerCase() === nextName.toLowerCase(),
      )
    ) {
      return conflict('Category name already exists');
    }
    if (store.categories.some((item) => item.id !== id && item.slug === nextSlug)) {
      return conflict('Category slug already exists');
    }

    category.name = nextName;
    category.slug = nextSlug;
    if (body.description !== undefined) {
      category.description = body.description.trim() || null;
    }

    for (const product of store.products) {
      if (product.categoryId === id) {
        product.categoryName = category.name;
      }
    }

    return HttpResponse.json(category);
  }),

  http.delete('*/v1/categories/:id', ({ params }) => {
    const id = Number(params.id);
    const store = getMockStore();
    const index = store.categories.findIndex((item) => item.id === id);
    if (index < 0) {
      return notFound();
    }

    store.categories.splice(index, 1);
    for (const product of store.products) {
      if (product.categoryId === id) {
        product.categoryId = null;
        product.categoryName = null;
      }
    }

    return new HttpResponse(null, { status: 204 });
  }),

  http.post('*/v1/categories/:id/activate', ({ params }) => {
    const id = Number(params.id);
    const category = getMockStore().categories.find((item) => item.id === id);
    if (!category) {
      return notFound();
    }
    if (category.isActive) {
      return HttpResponse.json(
        { message: 'Category is already active', statusCode: 400 },
        { status: 400 },
      );
    }
    category.isActive = true;
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('*/v1/categories/:id/deactivate', ({ params }) => {
    const id = Number(params.id);
    const category = getMockStore().categories.find((item) => item.id === id);
    if (!category) {
      return notFound();
    }
    if (!category.isActive) {
      return HttpResponse.json(
        { message: 'Category is already inactive', statusCode: 400 },
        { status: 400 },
      );
    }
    category.isActive = false;
    return new HttpResponse(null, { status: 204 });
  }),
];