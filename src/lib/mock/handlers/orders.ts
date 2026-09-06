import { http, HttpResponse } from 'msw';
import { getMockStore, isoNow } from '@/lib/mock/data/store';
import type {
  OrderDetailResponseDto,
  OrderListItemResponseDto,
  OrderMutationResponseDto,
} from '@/lib/mock/data/types';
import {
  paginate,
  parseOptionalNumber,
  parsePositiveInt,
  sortByKey,
} from '@/lib/mock/lib/paginate-filter';

type OrderStatus = OrderDetailResponseDto['status'];

const TRANSITIONS: Record<string, OrderStatus> = {
  confirm: 'confirmed',
  process: 'processing',
  ship: 'shipped',
  deliver: 'delivered',
  cancel: 'cancelled',
};

function toListItem(order: OrderDetailResponseDto): OrderListItemResponseDto {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    userName: order.userName,
    userEmail: order.userEmail,
    status: order.status,
    itemCount: order.items.length,
    totalAmount: order.totalAmount,
    currency: order.currency,
    createdAt: order.createdAt,
  };
}

function transitionOrder(orderId: number, action: string) {
  const order = getMockStore().orders.find((item) => item.id === orderId);
  if (!order) {
    return HttpResponse.json(
      { message: 'Order not found', statusCode: 404 },
      { status: 404 },
    );
  }

  const nextStatus = TRANSITIONS[action];
  if (!nextStatus) {
    return HttpResponse.json(
      { message: 'Unsupported transition', statusCode: 400 },
      { status: 400 },
    );
  }

  order.status = nextStatus;
  order.updatedAt = isoNow();

  const body: OrderMutationResponseDto = {
    id: order.id,
    status: order.status,
    totalPrice: order.totalPrice,
    currency: order.currency,
    updatedAt: order.updatedAt,
  };

  return HttpResponse.json(body);
}

export const ordersHandlers = [
  http.get('*/v1/orders', ({ request }) => {
    const url = new URL(request.url);
    const page = parsePositiveInt(url.searchParams.get('page'), 1);
    const limit = parsePositiveInt(url.searchParams.get('limit'), 10);
    const status = url.searchParams.get('status') as OrderStatus | null;
    const userId = parseOptionalNumber(url.searchParams.get('userId'));
    const userEmail = url.searchParams.get('userEmail')?.trim().toLowerCase();
    const userName = url.searchParams.get('userName')?.trim().toLowerCase();
    const firstName = url.searchParams.get('firstName')?.trim().toLowerCase();
    const lastName = url.searchParams.get('lastName')?.trim().toLowerCase();
    const createdAfter = url.searchParams.get('createdAfter');
    const createdBefore = url.searchParams.get('createdBefore');
    const minAmount = parseOptionalNumber(url.searchParams.get('minAmount'));
    const maxAmount = parseOptionalNumber(url.searchParams.get('maxAmount'));
    const sortBy = url.searchParams.get('sortBy');
    const sortOrder = url.searchParams.get('sortOrder');

    let items = getMockStore().orders.map(toListItem);

    if (status) {
      items = items.filter((item) => item.status === status);
    }
    if (userId !== undefined) {
      items = items.filter((item) => item.userId === userId);
    }
    if (userEmail) {
      items = items.filter((item) =>
        item.userEmail.toLowerCase().includes(userEmail),
      );
    }
    if (userName) {
      items = items.filter((item) =>
        item.userName.toLowerCase().includes(userName),
      );
    }
    if (firstName) {
      items = items.filter((item) =>
        item.userName.toLowerCase().includes(firstName),
      );
    }
    if (lastName) {
      items = items.filter((item) =>
        item.userName.toLowerCase().includes(lastName),
      );
    }
    if (createdAfter) {
      items = items.filter((item) => item.createdAt >= createdAfter);
    }
    if (createdBefore) {
      items = items.filter((item) => item.createdAt <= createdBefore);
    }
    if (minAmount !== undefined) {
      items = items.filter((item) => item.totalAmount >= minAmount);
    }
    if (maxAmount !== undefined) {
      items = items.filter((item) => item.totalAmount <= maxAmount);
    }

    items = sortByKey(items, sortBy, sortOrder, {
      createdAt: (item) => item.createdAt,
      totalAmount: (item) => item.totalAmount,
      id: (item) => item.id,
      status: (item) => item.status,
    });

    return HttpResponse.json(paginate(items, page, limit));
  }),

  http.get('*/v1/orders/:id', ({ params }) => {
    const id = Number(params.id);
    const order = getMockStore().orders.find((item) => item.id === id);
    if (!order) {
      return HttpResponse.json(
        { message: 'Order not found', statusCode: 404 },
        { status: 404 },
      );
    }
    return HttpResponse.json(order);
  }),

  http.patch('*/v1/orders/:id/confirm', ({ params }) =>
    transitionOrder(Number(params.id), 'confirm'),
  ),
  http.patch('*/v1/orders/:id/process', ({ params }) =>
    transitionOrder(Number(params.id), 'process'),
  ),
  http.patch('*/v1/orders/:id/ship', ({ params }) =>
    transitionOrder(Number(params.id), 'ship'),
  ),
  http.patch('*/v1/orders/:id/deliver', ({ params }) =>
    transitionOrder(Number(params.id), 'deliver'),
  ),
  http.patch('*/v1/orders/:id/cancel', ({ params }) =>
    transitionOrder(Number(params.id), 'cancel'),
  ),
];
