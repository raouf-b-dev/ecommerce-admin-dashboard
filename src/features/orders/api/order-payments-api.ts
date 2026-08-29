import { apiClient } from '@/lib/api/client';
import {
  readApiErrorFromResponse,
  toApiRequestError,
} from '@/lib/api/parse-api-error';
import type { PaymentDetailResponseDto } from '@/features/orders/types';

export async function getOrderPaymentRequest(
  orderId: number,
): Promise<PaymentDetailResponseDto> {
  const { data, error, response } = await apiClient.GET(
    '/v1/payments/orders/{orderId}',
    {
      params: { path: { orderId } },
    },
  );

  if (error || !response.ok || !data) {
    const parsed = response ? await readApiErrorFromResponse(response) : null;
    throw toApiRequestError(
      response ?? new Response(null, { status: 500 }),
      parsed,
      'Failed to load payment',
    );
  }

  return data;
}
