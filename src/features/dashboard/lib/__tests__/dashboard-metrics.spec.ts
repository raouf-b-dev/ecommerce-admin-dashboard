import { describe, expect, it } from 'vitest';
import {
  buildDashboardPeriod,
  formatPercentDelta,
  percentChange,
} from '@/features/dashboard/lib/dashboard-metrics';

describe('dashboard-metrics', () => {
  it('builds an ISO period ending at now', () => {
    const now = new Date('2026-08-30T12:00:00.000Z');
    const period = buildDashboardPeriod(7, now);
    expect(period.days).toBe(7);
    expect(period.to).toBe(now.toISOString());
    expect(period.from).toBe('2026-08-23T12:00:00.000Z');
  });

  it('computes percent change and formats deltas', () => {
    expect(percentChange(130, 100)).toBe(30);
    expect(percentChange(0, 0)).toBe(0);
    expect(percentChange(10, 0)).toBeNull();
    expect(formatPercentDelta(30)).toBe('+30%');
    expect(formatPercentDelta(null)).toBe('n/a');
  });
});
