import { Link } from 'react-router';
import type { OrderAttentionCountDto } from '@/features/dashboard/types';
import { attentionStatusLabel } from '@/features/dashboard/lib/dashboard-metrics';

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
    <ul className="flex flex-wrap gap-3">
      {items.map((item) => (
        <li key={item.status}>
          <Link
            to={`/orders?status=${encodeURIComponent(item.status)}`}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
          >
            <span className="capitalize">
              {attentionStatusLabel(item.status)}
            </span>
            <span className="tabular-nums font-medium">{item.count}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
