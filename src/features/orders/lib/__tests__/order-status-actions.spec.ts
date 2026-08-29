import { describe, expect, it } from 'vitest';
import {
  getAllowedOrderActions,
  isOrderActionAllowed,
} from '@/features/orders/lib/order-status-actions';

describe('getAllowedOrderActions', () => {
  it('returns confirm and cancel for pending_payment', () => {
    expect(getAllowedOrderActions('pending_payment')).toEqual([
      'confirm',
      'cancel',
    ]);
  });

  it('returns process and cancel for confirmed', () => {
    expect(getAllowedOrderActions('confirmed')).toEqual(['process', 'cancel']);
  });

  it('returns ship and cancel for processing', () => {
    expect(getAllowedOrderActions('processing')).toEqual(['ship', 'cancel']);
  });

  it('returns deliver and cancel for shipped', () => {
    expect(getAllowedOrderActions('shipped')).toEqual(['deliver', 'cancel']);
  });

  it('returns cancel only for payment_failed', () => {
    expect(getAllowedOrderActions('payment_failed')).toEqual(['cancel']);
  });

  it('returns none for terminal statuses', () => {
    expect(getAllowedOrderActions('delivered')).toEqual([]);
    expect(getAllowedOrderActions('cancelled')).toEqual([]);
    expect(getAllowedOrderActions('refunded')).toEqual([]);
  });

  it('returns none for unknown status', () => {
    expect(getAllowedOrderActions('mystery')).toEqual([]);
  });
});

describe('isOrderActionAllowed', () => {
  it('gates actions by status', () => {
    expect(isOrderActionAllowed('confirmed', 'process')).toBe(true);
    expect(isOrderActionAllowed('confirmed', 'ship')).toBe(false);
    expect(isOrderActionAllowed('shipped', 'deliver')).toBe(true);
  });
});
