import { Link } from 'react-router';
import type { TopProductItemDto } from '@/features/dashboard/types';
import { formatMoney } from '@/features/dashboard/lib/dashboard-metrics';

type Props = {
  items: TopProductItemDto[];
  currency: string;
};

export function DashboardTopProducts({ items, currency }: Props) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No product sales in this period.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.productId}
          className="flex items-baseline justify-between gap-4 text-sm"
        >
          <div className="min-w-0">
            <Link
              to={`/inventory/${item.productId}`}
              className="truncate font-medium text-primary underline-offset-4 hover:underline"
            >
              {item.name}
            </Link>
            <p className="text-xs text-muted-foreground">
              {item.unitsSold} sold
              {item.sku ? ` · ${item.sku}` : ''}
            </p>
          </div>
          <span className="shrink-0 tabular-nums">
            {formatMoney(item.lineRevenue, currency)}
          </span>
        </li>
      ))}
    </ul>
  );
}
