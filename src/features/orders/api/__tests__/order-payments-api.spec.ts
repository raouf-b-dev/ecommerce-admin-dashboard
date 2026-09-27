import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getOrderPaymentRequest } from '@/features/orders/api/order-payments-api';

const getMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    GET: getMock,
  },
}));

describe('getOrderPaymentRequest', () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it('returns null when API responds 200 with null (no payment yet)', async () => {
    getMock.mockResolvedValue({
      data: null,
      error: undefined,
      response: new Response('null', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    });

    await expect(getOrderPaymentRequest(4)).resolves.toBeNull();
  });

  it('returns payment detail on 200', async () => {
    const payment = {
      id: 1,
      orderId: 4,
      amount: 29.99,
      currency: 'USD',
      status: 'CAPTURED',
    };
    getMock.mockResolvedValue({
      data: payment,
      error: undefined,
      response: new Response(JSON.stringify(payment), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    });

    await expect(getOrderPaymentRequest(4)).resolves.toEqual(payment);
  });

  it('throws for unexpected failures', async () => {
    getMock.mockResolvedValue({
      data: undefined,
      error: { message: 'boom' },
      response: new Response(
        JSON.stringify({ statusCode: 500, message: 'Internal error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      ),
    });

    await expect(getOrderPaymentRequest(4)).rejects.toMatchObject({
      statusCode: 500,
    });
  });
});
