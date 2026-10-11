import type { components } from '@/lib/api/generated/schema';

export type PaymentMethod =
  components['schemas']['PaymentDetailResponseDto']['paymentMethod'];

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CARD: 'Card',
};

function isPaymentMethod(value: string): value is PaymentMethod {
  return Object.hasOwn(PAYMENT_METHOD_LABELS, value);
}

export function formatMoney(
  amount: number,
  currency?: string | null,
  options?: { maximumFractionDigits?: number },
): string {
  if (!currency?.trim()) {
    return String(amount);
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: options?.maximumFractionDigits,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString();
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export function formatStatusLabel(status: string): string {
  return status.replaceAll('_', ' ');
}

export function formatPaymentMethodLabel(
  method: PaymentMethod | string | null | undefined,
): string {
  if (!method) {
    return '-';
  }
  if (isPaymentMethod(method)) {
    return PAYMENT_METHOD_LABELS[method];
  }
  return method;
}

export function formatPercentDelta(delta: number | null): string {
  if (delta === null) {
    return 'n/a';
  }
  const rounded = Math.round(delta * 10) / 10;
  const sign = rounded > 0 ? '+' : '';
  return `${sign}${rounded}%`;
}

