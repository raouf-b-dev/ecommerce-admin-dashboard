import { describe, expect, it } from 'vitest';
import { parseAllowedOrderActions } from '@/features/orders/lib/order-status-actions';

describe('parseAllowedOrderActions', () => {
  it('keeps known admin actions from the API payload', () => {
    expect(
      parseAllowedOrderActions(['confirm', 'cancel', 'mystery']),
    ).toEqual(['confirm', 'cancel']);
  });

  it('returns empty for missing or empty payloads', () => {
    expect(parseAllowedOrderActions(undefined)).toEqual([]);
    expect(parseAllowedOrderActions([])).toEqual([]);
  });
});
