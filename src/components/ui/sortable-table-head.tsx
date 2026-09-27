import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { TableHead } from '@/components/ui/table';
import { cn } from '@/lib/utils';

type SortableTableHeadProps<TSortBy extends string> = {
  label: string;
  sortKey: TSortBy;
  activeSortBy: TSortBy;
  activeSortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: TSortBy, sortOrder: 'asc' | 'desc') => void;
  className?: string;
};

export function SortableTableHead<TSortBy extends string>({
  label,
  sortKey,
  activeSortBy,
  activeSortOrder,
  onSortChange,
  className,
}: SortableTableHeadProps<TSortBy>) {
  const isActive = activeSortBy === sortKey;
  const ariaSort = isActive
    ? activeSortOrder === 'asc'
      ? 'ascending'
      : 'descending'
    : 'none';

  function handleClick() {
    if (isActive) {
      onSortChange(sortKey, activeSortOrder === 'asc' ? 'desc' : 'asc');
      return;
    }
    onSortChange(sortKey, 'desc');
  }

  const SortIcon = isActive
    ? activeSortOrder === 'asc'
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  return (
    <TableHead className={className} aria-sort={ariaSort}>
      <button
        type="button"
        className={cn(
          'inline-flex items-center gap-1 font-medium hover:text-foreground',
          isActive ? 'text-foreground' : 'text-muted-foreground',
        )}
        onClick={handleClick}
      >
        {label}
        <SortIcon className="size-3.5 shrink-0" aria-hidden />
      </button>
    </TableHead>
  );
}
