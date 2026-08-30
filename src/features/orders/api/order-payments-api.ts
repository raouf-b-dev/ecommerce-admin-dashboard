import { apiClient } from '@/lib/api/client';
import {
  readApiErrorFromResponse,
  toApiRequestError,
} from '@/lib/api/parse-api-error';
import type { PaymentDetailResponseDto } from '@/features/orders/types';

/**
 * Payment for an order. API returns HTTP 200 with `null` when none exists yet.
 */
export async function getOrderPaymentRequest(
  orderId: number,
): Promise<PaymentDetailResponseDto | null> {
  const { data, error, response } = await apiClient.GET(
    '/v1/payments/orders/{orderId}',
    {
      params: { path: { orderId } },
    },
  );

  if (error || !response.ok) {
    const parsed = response ? await readApiErrorFromResponse(response) : null;
    throw toApiRequestError(
      response ?? new Response(null, { status: 500 }),
      parsed,
      'Failed to load payment',
    );
  }

  // Explicit null from API = no payment yet (valid business state).
  return data ?? null;
}
