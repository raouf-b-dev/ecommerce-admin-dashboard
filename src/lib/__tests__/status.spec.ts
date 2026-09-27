import { describe, expect, it } from 'vitest';
import {
  getOrderStatusDotClass,
  resolveInventorySeverity,
} from '@/lib/status';

describe('status utilities', () => {
  describe('resolveInventorySeverity', () => {
    it('returns explicit status when provided', () => {
      expect(resolveInventorySeverity(0, 10, 'healthy')).toBe('healthy');
      expect(resolveInventorySeverity(100, 10, 'critical')).toBe('critical');
    });

    it('returns null when availableQuantity is undefined and no explicit status', () => {
      expect(resolveInventorySeverity(undefined, 10)).toBeNull();
    });

    it('returns critical when available <= 0', () => {
      expect(resolveInventorySeverity(0, 10)).toBe('critical');
      expect(resolveInventorySeverity(-2, 10)).toBe('critical');
    });

    it('returns low when available <= threshold', () => {
      expect(resolveInventorySeverity(3, 10)).toBe('low');
      expect(resolveInventorySeverity(10, 10)).toBe('low');
    });

    it('returns healthy when available > threshold', () => {
      expect(resolveInventorySeverity(11, 10)).toBe('healthy');
      expect(resolveInventorySeverity(50, 10)).toBe('healthy');
    });

    it('returns null if available > 0 but threshold is undefined', () => {
      expect(resolveInventorySeverity(5, undefined)).toBeNull();
    });
  });

  describe('getOrderStatusDotClass', () => {
    it('returns emerald dot for delivered and shipped', () => {
      expect(getOrderStatusDotClass('delivered')).toBe('bg-emerald-500');
      expect(getOrderStatusDotClass('shipped')).toBe('bg-emerald-500');
    });

    it('returns blue dot for confirmed', () => {
      expect(getOrderStatusDotClass('confirmed')).toBe('bg-blue-500');
    });

    it('returns amber dot for processing and pending_payment', () => {
      expect(getOrderStatusDotClass('processing')).toBe('bg-amber-500');
      expect(getOrderStatusDotClass('pending_payment')).toBe('bg-amber-500');
    });

    it('returns rose dot for payment_failed and cancelled', () => {
      expect(getOrderStatusDotClass('payment_failed')).toBe('bg-rose-500');
      expect(getOrderStatusDotClass('cancelled')).toBe('bg-rose-500');
    });

    it('returns slate dot for refunded and unknown status fallback', () => {
      expect(getOrderStatusDotClass('refunded')).toBe('bg-slate-400');
      expect(getOrderStatusDotClass('unknown_status')).toBe('bg-slate-400');
    });
  });
});
