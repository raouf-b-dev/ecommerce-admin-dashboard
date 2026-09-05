import { cn } from '@/lib/utils';
import { formatStatusLabel } from '@/lib/format';
import {
  type InventorySeverity,
  getOrderStatusDotClass,
  resolveInventorySeverity,
} from '@/lib/status';

type OrderStatusType =
  | 'pending_payment'
  | 'payment_failed'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | string;

type StatusBadgeProps =
  | {
      variant: 'order';
      status: OrderStatusType;
      className?: string;
    }
  | {
      variant: 'product';
      isActive: boolean;
      className?: string;
    }
  | {
      variant: 'user';
      isActive: boolean;
      className?: string;
    }
  | {
      variant: 'inventory';
      status?: 'critical' | 'low' | 'healthy';
      availableQuantity?: number;
      lowStockThreshold?: number;
      className?: string;
    };

type BadgeStyle = {
  label: string;
  pillClasses: string;
  dotClasses: string;
};

function getOrderBadgeStyle(status: string): BadgeStyle {
  const dotClasses = getOrderStatusDotClass(status);
  switch (status) {
    case 'delivered':
    case 'shipped':
      return {
        label: formatStatusLabel(status),
        pillClasses:
          'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
        dotClasses,
      };
    case 'confirmed':
      return {
        label: formatStatusLabel(status),
        pillClasses:
          'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
        dotClasses,
      };
    case 'processing':
    case 'pending_payment':
      return {
        label: formatStatusLabel(status),
        pillClasses:
          'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
        dotClasses,
      };
    case 'payment_failed':
    case 'cancelled':
      return {
        label: formatStatusLabel(status),
        pillClasses:
          'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
        dotClasses,
      };
    case 'refunded':
    default:
      return {
        label: formatStatusLabel(status),
        pillClasses:
          'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20',
        dotClasses,
      };
  }
}

function getProductBadgeStyle(isActive: boolean): BadgeStyle {
  if (isActive) {
    return {
      label: 'Active',
      pillClasses:
        'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
      dotClasses: 'bg-emerald-500',
    };
  }
  return {
    label: 'Inactive',
    pillClasses:
      'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20',
    dotClasses: 'bg-slate-400',
  };
}

function getInventoryBadgeStyle(
  status?: InventorySeverity,
  available?: number,
  threshold?: number,
): BadgeStyle | null {
  const resolvedStatus = resolveInventorySeverity(available, threshold, status);

  if (!resolvedStatus) {
    return null;
  }

  switch (resolvedStatus) {
    case 'critical':
      return {
        label: 'Critical',
        pillClasses:
          'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
        dotClasses: 'bg-rose-500',
      };
    case 'low':
      return {
        label: 'Low stock',
        pillClasses:
          'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
        dotClasses: 'bg-amber-500',
      };
    case 'healthy':
      return {
        label: 'Healthy',
        pillClasses:
          'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
        dotClasses: 'bg-emerald-500',
      };
  }
}

export function StatusBadge(props: StatusBadgeProps) {
  let style: BadgeStyle | null;

  switch (props.variant) {
    case 'order':
      style = getOrderBadgeStyle(props.status);
      break;
    case 'product':
    case 'user':
      style = getProductBadgeStyle(props.isActive);
      break;
    case 'inventory':
      style = getInventoryBadgeStyle(
        props.status,
        props.availableQuantity,
        props.lowStockThreshold,
      );
      break;
  }

  if (!style) {
    return null;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        style.pillClasses,
        props.className,
      )}
    >
      <span
        className={cn('h-1.5 w-1.5 shrink-0 rounded-full', style.dotClasses)}
        aria-hidden="true"
      />
      <span className="capitalize">{style.label}</span>
    </span>
  );
}
