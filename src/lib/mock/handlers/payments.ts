import { http, HttpResponse } from 'msw';
import { getMockStore } from '@/lib/mock/data/store';

export const paymentsHandlers = [
  http.get('*/v1/payments/orders/:orderId', ({ params }) => {
    const orderId = Number(params.orderId);
    const payment = getMockStore().payments.find(
      (item) => item.orderId === orderId,
    );
    return HttpResponse.json(payment ?? null);
  }),
];
