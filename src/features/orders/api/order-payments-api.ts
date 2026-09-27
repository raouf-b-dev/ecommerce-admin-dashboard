import { apiClient } from '@/lib/api/client';
import { throwApiErrorFromResponse } from '@/lib/api/throw-api-error';
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
    return await throwApiErrorFromResponse(response, 'Failed to load payment');
  }

  // Explicit null from API = no payment yet (valid business state).
  return data ?? null;
}
