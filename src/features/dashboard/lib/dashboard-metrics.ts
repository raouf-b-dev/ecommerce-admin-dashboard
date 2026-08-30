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

export function formatMoney(
  amount: number,
  currency: string,
  locale = 'en-US',
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function formatPercentDelta(delta: number | null): string {
  if (delta === null) {
    return 'n/a';
  }
  const rounded = Math.round(delta * 10) / 10;
  const sign = rounded > 0 ? '+' : '';
  return `${sign}${rounded}%`;
}

export function attentionStatusLabel(status: string): string {
  return status.replaceAll('_', ' ');
}
