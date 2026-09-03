import { http, HttpResponse } from 'msw';
import { getMockStore, isoNow } from '@/lib/mock/data/store';
import type { RoleResponseDto } from '@/lib/mock/data/types';

export const rolesHandlers = [
  http.get('*/v1/roles', () => {
    return HttpResponse.json(getMockStore().roles);
  }),

  http.get('*/v1/roles/:id', ({ params }) => {
    const id = Number(params.id);
    const role = getMockStore().roles.find((item) => item.id === id);
    if (!role) {
      return HttpResponse.json(
        { message: 'Role not found', statusCode: 404 },
        { status: 404 },
      );
    }
    return HttpResponse.json(role);
  }),

  http.post('*/v1/roles', async ({ request }) => {
    const body = (await request.json()) as {
      code: string;
      name: string;
      permissions: string[];
    };
    const store = getMockStore();
    const stamp = isoNow();
    const role: RoleResponseDto = {
      id: store.nextRoleId++,
      code: body.code,
      name: body.name,
      isSystem: false,
      permissions: { codes: body.permissions },
      createdAt: stamp,
      updatedAt: stamp,
    };
    store.roles.push(role);
    return HttpResponse.json(role, { status: 201 });
  }),

  http.patch('*/v1/roles/:id', async ({ params, request }) => {
    const id = Number(params.id);
    const role = getMockStore().roles.find((item) => item.id === id);
    if (!role) {
      return HttpResponse.json(
        { message: 'Role not found', statusCode: 404 },
        { status: 404 },
      );
    }

    const body = (await request.json()) as {
      name: string;
      permissions: string[];
    };
    role.name = body.name;
    role.permissions = { codes: body.permissions };
    role.updatedAt = isoNow();
    return new HttpResponse(null, { status: 204 });
  }),

  http.delete('*/v1/roles/:id', ({ params }) => {
    const id = Number(params.id);
    const store = getMockStore();
    const role = store.roles.find((item) => item.id === id);
    if (!role) {
      return HttpResponse.json(
        { message: 'Role not found', statusCode: 404 },
        { status: 404 },
      );
    }
    if (role.isSystem) {
      return HttpResponse.json(
        { message: 'Cannot delete system role', statusCode: 400 },
        { status: 400 },
      );
    }
    store.roles = store.roles.filter((item) => item.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('*/v1/permissions', () => {
    return HttpResponse.json(getMockStore().permissions);
  }),
];
