export type InventorySeverity = 'critical' | 'low' | 'healthy';

export function resolveInventorySeverity(
  available?: number,
  threshold?: number,
  explicitStatus?: InventorySeverity,
): InventorySeverity | null {
  if (explicitStatus) {
    return explicitStatus;
  }
  if (available === undefined) {
    return null;
  }
  if (available <= 0) {
    return 'critical';
  }
  if (threshold !== undefined) {
    return available <= threshold ? 'low' : 'healthy';
  }
  return null;
}

export function getOrderStatusDotClass(status: string): string {
  switch (status) {
    case 'delivered':
    case 'shipped':
      return 'bg-emerald-500';
    case 'confirmed':
      return 'bg-blue-500';
    case 'processing':
    case 'pending_payment':
      return 'bg-amber-500';
    case 'payment_failed':
    case 'cancelled':
      return 'bg-rose-500';
    case 'refunded':
    default:
      return 'bg-slate-400';
  }
}
