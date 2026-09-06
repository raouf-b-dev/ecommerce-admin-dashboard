import { http, HttpResponse } from 'msw';
import { getMockStore, isoNow } from '@/lib/mock/data/store';
import type { AddressResponseDto, UserDetailResponseDto } from '@/lib/mock/data/types';
import {
  paginate,
  parseOptionalBoolean,
  parsePositiveInt,
} from '@/lib/mock/lib/paginate-filter';

function toListItem(user: UserDetailResponseDto) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    isActive: user.isActive,
    roleCode: user.roleCode,
    createdAt: user.createdAt,
  };
}

export const usersHandlers = [
  http.get('*/v1/users', ({ request }) => {
    const url = new URL(request.url);
    const page = parsePositiveInt(url.searchParams.get('page'), 1);
    const limit = parsePositiveInt(url.searchParams.get('limit'), 20);
    const search = url.searchParams.get('search')?.trim().toLowerCase();
    const isActive = parseOptionalBoolean(url.searchParams.get('isActive'));
    const roleCode = url.searchParams.get('roleCode')?.trim();

    let items = getMockStore().users.map(toListItem);

    if (search) {
      items = items.filter(
        (user) =>
          user.email.toLowerCase().includes(search) ||
          user.firstName.toLowerCase().includes(search) ||
          user.lastName.toLowerCase().includes(search),
      );
    }
    if (isActive !== undefined) {
      items = items.filter((user) => user.isActive === isActive);
    }
    if (roleCode) {
      items = items.filter((user) => user.roleCode === roleCode);
    }

    return HttpResponse.json(paginate(items, page, limit));
  }),

  http.get('*/v1/users/:id', ({ params }) => {
    const id = Number(params.id);
    const user = getMockStore().users.find((item) => item.id === id);
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found', statusCode: 404 },
        { status: 404 },
      );
    }
    return HttpResponse.json(user);
  }),

  http.patch('*/v1/users/:id', async ({ params, request }) => {
    const id = Number(params.id);
    const user = getMockStore().users.find((item) => item.id === id);
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found', statusCode: 404 },
        { status: 404 },
      );
    }

    const body = (await request.json()) as Partial<{
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    }>;

    Object.assign(user, body, { updatedAt: isoNow() });
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('*/v1/users/:id/activate', ({ params }) => {
    const id = Number(params.id);
    const user = getMockStore().users.find((item) => item.id === id);
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found', statusCode: 404 },
        { status: 404 },
      );
    }
    user.isActive = true;
    user.updatedAt = isoNow();
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('*/v1/users/:id/deactivate', ({ params }) => {
    const id = Number(params.id);
    const user = getMockStore().users.find((item) => item.id === id);
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found', statusCode: 404 },
        { status: 404 },
      );
    }
    user.isActive = false;
    user.updatedAt = isoNow();
    return new HttpResponse(null, { status: 204 });
  }),

  http.put('*/v1/users/:id/role', async ({ params, request }) => {
    const id = Number(params.id);
    const user = getMockStore().users.find((item) => item.id === id);
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found', statusCode: 404 },
        { status: 404 },
      );
    }

    const body = (await request.json()) as { roleCode: string };
    const role = getMockStore().roles.find((item) => item.code === body.roleCode);
    if (!role) {
      return HttpResponse.json(
        { message: 'Role not found', statusCode: 404 },
        { status: 404 },
      );
    }

    user.roleCode = body.roleCode;
    user.updatedAt = isoNow();
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('*/v1/users/:id/addresses', async ({ params, request }) => {
    const id = Number(params.id);
    const store = getMockStore();
    const user = store.users.find((item) => item.id === id);
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found', statusCode: 404 },
        { status: 404 },
      );
    }

    const body = (await request.json()) as {
      street: string;
      street2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      type: AddressResponseDto['type'];
      isDefault?: boolean;
      deliveryInstructions?: string;
    };

    const stamp = isoNow();
    const isDefault = body.isDefault === true || user.addresses.length === 0;
    if (isDefault) {
      for (const address of user.addresses) {
        address.isDefault = false;
      }
    }

    const address: AddressResponseDto = {
      id: store.nextUserAddressId++,
      street: body.street,
      street2: body.street2,
      city: body.city,
      state: body.state,
      postalCode: body.postalCode,
      country: body.country,
      type: body.type,
      isDefault,
      deliveryInstructions: body.deliveryInstructions,
      createdAt: stamp,
      updatedAt: stamp,
    };

    user.addresses.push(address);
    user.addressCount = user.addresses.length;
    user.updatedAt = stamp;
    return new HttpResponse(null, { status: 201 });
  }),

  http.patch('*/v1/users/:id/addresses/:addressId', async ({
    params,
    request,
  }) => {
    const userId = Number(params.id);
    const addressId = Number(params.addressId);
    const user = getMockStore().users.find((item) => item.id === userId);
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found', statusCode: 404 },
        { status: 404 },
      );
    }

    const address = user.addresses.find((item) => item.id === addressId);
    if (!address) {
      return HttpResponse.json(
        { message: 'Address not found', statusCode: 404 },
        { status: 404 },
      );
    }

    const body = (await request.json()) as Partial<AddressResponseDto>;
    Object.assign(address, body, { updatedAt: isoNow() });
    user.updatedAt = isoNow();
    return new HttpResponse(null, { status: 204 });
  }),

  http.delete('*/v1/users/:id/addresses/:addressId', ({ params }) => {
    const userId = Number(params.id);
    const addressId = Number(params.addressId);
    const user = getMockStore().users.find((item) => item.id === userId);
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found', statusCode: 404 },
        { status: 404 },
      );
    }

    const index = user.addresses.findIndex((item) => item.id === addressId);
    if (index < 0) {
      return HttpResponse.json(
        { message: 'Address not found', statusCode: 404 },
        { status: 404 },
      );
    }

    const [removed] = user.addresses.splice(index, 1);
    if (removed?.isDefault && user.addresses[0]) {
      user.addresses[0].isDefault = true;
    }
    user.addressCount = user.addresses.length;
    user.updatedAt = isoNow();
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch('*/v1/users/:id/addresses/:addressId/set-default', ({ params }) => {
    const userId = Number(params.id);
    const addressId = Number(params.addressId);
    const user = getMockStore().users.find((item) => item.id === userId);
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found', statusCode: 404 },
        { status: 404 },
      );
    }

    const address = user.addresses.find((item) => item.id === addressId);
    if (!address) {
      return HttpResponse.json(
        { message: 'Address not found', statusCode: 404 },
        { status: 404 },
      );
    }

    for (const item of user.addresses) {
      item.isDefault = item.id === addressId;
      item.updatedAt = isoNow();
    }
    user.updatedAt = isoNow();
    return new HttpResponse(null, { status: 204 });
  }),
];
