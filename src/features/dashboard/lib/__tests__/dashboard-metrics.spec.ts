import {
  buildDashboardPeriod,
  calculateRefundRate,
  formatPercent,
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

  it('computes percent change accurately', () => {
    expect(percentChange(130, 100)).toBe(30);
    expect(percentChange(80, 100)).toBe(-20);
    expect(percentChange(0, 0)).toBe(0);
    expect(percentChange(10, 0)).toBeNull();
  });

  it('computes refund rate and formats percentages', () => {
    expect(calculateRefundRate(50, 1000)).toBe(5);
    expect(calculateRefundRate(0, 1000)).toBe(0);
    expect(calculateRefundRate(50, 0)).toBe(0);
    expect(calculateRefundRate(200, 100)).toBe(100);
    expect(formatPercent(5.23)).toBe('5.2%');
    expect(formatPercent(null)).toBe('n/a');
  });
});
