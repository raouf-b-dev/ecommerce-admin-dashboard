import { Link } from 'react-router';
import type { TopProductItemDto } from '@/features/dashboard/types';
import { formatMoney } from '@/lib/format';

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

  const maxRevenue = Math.max(...items.map((i) => i.lineRevenue), 1);

  return (
    <ul className="space-y-3.5">
      {items.map((item, index) => {
        const sharePercent = Math.min(
          100,
          Math.max(0, Math.round((item.lineRevenue / maxRevenue) * 100)),
        );

        return (
          <li key={item.productId} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-foreground">
                  {index + 1}
                </span>
                <div className="min-w-0 truncate">
                  <Link
                    to={`/inventory/${item.productId}`}
                    className="truncate font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                  >
                    {item.name}
                  </Link>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {item.unitsSold} sold
                    {item.sku ? ` · ${item.sku}` : ''}
                  </span>
                </div>
              </div>
              <span className="shrink-0 font-medium tabular-nums text-foreground/90">
                {formatMoney(item.lineRevenue, currency)}
              </span>
            </div>

            {/* Revenue share bar relative to top product in the list */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                className="h-full rounded-full bg-primary/40 transition-all duration-300"
                style={{ width: `${sharePercent}%` }}
                aria-hidden="true"
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
