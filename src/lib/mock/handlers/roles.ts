import { http, HttpResponse } from 'msw/http';
import { getMockStore, isoNow } from '@/lib/mock/data/store';
import type {
  CreateRoleDto,
  RoleResponseDto,
  UpdateRoleDto,
} from '@/lib/mock/data/types';
import { apiErrorResponse } from '@/lib/mock/lib/api-error-response';

export const rolesHandlers = [
  http.get('*/v1/roles', () => {
    return HttpResponse.json(getMockStore().roles);
  }),

  http.get('*/v1/roles/:id', ({ params }) => {
    const id = Number(params.id);
    const role = getMockStore().roles.find((item) => item.id === id);
    if (!role) {
      return apiErrorResponse(404, 'ROLE_NOT_FOUND', 'Role not found');
    }
    return HttpResponse.json(role);
  }),

  http.post<never, CreateRoleDto>('*/v1/roles', async ({ request }) => {
    const body = await request.json();
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

  http.patch<{ id: string }, UpdateRoleDto>(
    '*/v1/roles/:id',
    async ({ params, request }) => {
      const id = Number(params.id);
      const role = getMockStore().roles.find((item) => item.id === id);
      if (!role) {
        return apiErrorResponse(404, 'ROLE_NOT_FOUND', 'Role not found');
      }

      const body = await request.json();
      role.name = body.name;
      role.permissions = { codes: body.permissions };
      role.updatedAt = isoNow();
      return new HttpResponse(null, { status: 204 });
    },
  ),

  http.delete('*/v1/roles/:id', ({ params }) => {
    const id = Number(params.id);
    const store = getMockStore();
    const role = store.roles.find((item) => item.id === id);
    if (!role) {
      return apiErrorResponse(404, 'ROLE_NOT_FOUND', 'Role not found');
    }
    if (role.isSystem) {
      return apiErrorResponse(
        400,
        'USECASE_ERROR',
        'Cannot delete system role',
      );
    }
    store.roles = store.roles.filter((item) => item.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('*/v1/permissions', () => {
    return HttpResponse.json(getMockStore().permissions);
  }),
];
