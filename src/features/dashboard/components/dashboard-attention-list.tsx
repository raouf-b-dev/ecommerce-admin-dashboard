import { Link } from 'react-router';
import type { OrderAttentionCountDto } from '@/features/dashboard/types';
import { attentionStatusLabel } from '@/features/dashboard/lib/dashboard-metrics';
import { getOrderStatusDotClass } from '@/lib/status';
import { cn } from '@/lib/utils';

type Props = {
  items: OrderAttentionCountDto[];
};

export function DashboardAttentionList({ items }: Props) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No orders need attention right now.
      </p>
    );
  }

  return (
    <ul className="flex flex-wrap gap-2.5">
      {items.map((item) => (
        <li key={item.status}>
          <Link
            to={`/orders?status=${encodeURIComponent(item.status)}`}
            className="inline-flex items-center gap-2 rounded-lg border border-border/80 bg-card px-3 py-1.5 text-sm font-medium shadow-sm transition-all hover:bg-muted hover:border-border"
          >
            <span
              className={cn(
                'h-2 w-2 shrink-0 rounded-full',
                getOrderStatusDotClass(item.status),
              )}
              aria-hidden="true"
            />
            <span className="capitalize text-foreground/90">
              {attentionStatusLabel(item.status)}
            </span>
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums text-foreground">
              {item.count}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
