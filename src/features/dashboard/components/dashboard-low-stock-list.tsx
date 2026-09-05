import { Link } from 'react-router';
import { StatusBadge } from '@/components/ui/status-badge';
import { resolveInventorySeverity } from '@/lib/status';
import type { InventoryAlertItemDto } from '@/features/dashboard/types';
import { cn } from '@/lib/utils';

type Props = {
  items: InventoryAlertItemDto[];
  totalAtRisk?: number;
};

export function DashboardLowStockList({ items, totalAtRisk }: Props) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No low-stock SKUs.</p>
    );
  }

  const displayItems = items.slice(0, 5);
  const atRiskCount = totalAtRisk ?? items.length;

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-border/60 rounded-lg border border-border/80 bg-card overflow-hidden">
        {displayItems.map((item) => {
          const isCritical =
            resolveInventorySeverity(
              item.availableQuantity,
              item.lowStockThreshold,
            ) === 'critical';
          return (
            <li
              key={item.productId}
              className="flex items-center justify-between gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-muted/40"
            >
              <div className="min-w-0 flex-1">
                <Link
                  to={`/inventory/${item.productId}`}
                  className="block truncate font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                  title={item.productTitle || `Product #${item.productId}`}
                >
                  {item.productTitle || `Product #${item.productId}`}
                </Link>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <StatusBadge
                  variant="inventory"
                  availableQuantity={item.availableQuantity}
                  lowStockThreshold={item.lowStockThreshold}
                />
                <span className="min-w-[3rem] text-right font-mono text-xs tabular-nums">
                  <span
                    className={cn(
                      'font-semibold',
                      isCritical
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-amber-600 dark:text-amber-400',
                    )}
                  >
                    {item.availableQuantity}
                  </span>
                  <span className="text-muted-foreground">
                    {' '}/ {item.lowStockThreshold}
                  </span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="text-right">
        <Link
          to="/inventory?lowStockOnly=true"
          className="text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          {atRiskCount > 0
            ? `${atRiskCount} at risk → Inventory`
            : 'Inventory →'}
        </Link>
      </div>
    </div>
  );
}
