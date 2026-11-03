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
          'bg-tint-1 text-tint-1-foreground border-positive/30',
        dotClasses,
      };
    case 'confirmed':
      return {
        label: formatStatusLabel(status),
        pillClasses:
          'bg-tint-3 text-tint-3-foreground border-tint-3-foreground/25',
        dotClasses,
      };
    case 'processing':
    case 'pending_payment':
      return {
        label: formatStatusLabel(status),
        pillClasses:
          'bg-tint-2 text-tint-2-foreground border-tint-2-foreground/25',
        dotClasses,
      };
    case 'payment_failed':
    case 'cancelled':
      return {
        label: formatStatusLabel(status),
        pillClasses:
          'bg-tint-4 text-tint-4-foreground border-negative/30',
        dotClasses,
      };
    case 'refunded':
    default:
      return {
        label: formatStatusLabel(status),
        pillClasses:
          'bg-secondary text-secondary-foreground border-border',
        dotClasses,
      };
  }
}

function getProductBadgeStyle(isActive: boolean): BadgeStyle {
  if (isActive) {
    return {
      label: 'Active',
      pillClasses:
        'bg-tint-1 text-tint-1-foreground border-positive/30',
      dotClasses: 'bg-positive',
    };
  }
  return {
    label: 'Inactive',
    pillClasses: 'bg-secondary text-secondary-foreground border-border',
    dotClasses: 'bg-muted-foreground',
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
          'bg-tint-4 text-tint-4-foreground border-negative/30',
        dotClasses: 'bg-negative',
      };
    case 'low':
      return {
        label: 'Low stock',
        pillClasses:
          'bg-tint-2 text-tint-2-foreground border-tint-2-foreground/25',
        dotClasses: 'bg-tint-2-foreground',
      };
    case 'healthy':
      return {
        label: 'Healthy',
        pillClasses:
          'bg-tint-1 text-tint-1-foreground border-positive/30',
        dotClasses: 'bg-positive',
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
        'inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-sm font-medium',
        style.pillClasses,
        props.className,
      )}
    >
      <span
        className={cn('h-1.5 w-1.5 shrink-0 rounded-full', style.dotClasses)}
        aria-hidden="true"
      />
      <span className="truncate capitalize">{style.label}</span>
    </span>
  );
}
