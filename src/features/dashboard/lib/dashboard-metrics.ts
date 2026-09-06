import { formatStatusLabel } from '@/lib/format';

export type DashboardPeriodDays = 7 | 30 | 90;

export function buildDashboardPeriod(
  days: DashboardPeriodDays,
  now = new Date(),
): { days: DashboardPeriodDays; from: string; to: string } {
  const to = new Date(now.getTime());
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return {
    days,
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function attentionStatusLabel(status: string): string {
  return formatStatusLabel(status);
}

export function calculateRefundRate(refunded: number, gross: number): number | null {
  if (gross <= 0) {
    return 0;
  }
  return Math.min(100, Math.max(0, (refunded / gross) * 100));
}

export function formatPercent(value: number | null): string {
  if (value === null) {
    return 'n/a';
  }
  return `${Math.round(value * 10) / 10}%`;
}
