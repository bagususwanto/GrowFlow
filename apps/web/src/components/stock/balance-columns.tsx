import { ColumnDef } from '@tanstack/react-table';
import { StockBalance } from '@growflow/types';
import { Button } from '@web/components/ui/button';
import { ArrowUpDownIcon, ArrowUpIcon, ArrowDownIcon, PackageIcon, WarehouseIcon } from 'lucide-react';

interface ColumnActions {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export const getColumns = ({ sortBy, sortOrder, onSort }: ColumnActions): ColumnDef<StockBalance>[] => [
  {
    accessorKey: 'item.code',
    header: 'Item Code',
    cell: ({ row }) => {
      const balance = row.original;
      return (
        <div className="flex items-center gap-2 font-medium">
          <div className="flex justify-center items-center bg-muted rounded-full w-8 h-8">
            <PackageIcon className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="font-mono text-sm">{balance.item?.code || '-'}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'item.name',
    header: 'Item Name',
    cell: ({ row }) => {
      return <span className="font-medium">{row.original.item?.name || '-'}</span>;
    },
  },
  {
    accessorKey: 'warehouse.name',
    header: 'Warehouse',
    cell: ({ row }) => {
      const balance = row.original;
      return (
        <div className="flex items-center gap-2">
          <WarehouseIcon className="w-3.5 h-3.5 text-muted-foreground" />
          <span>{balance.warehouse?.name || '-'}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'qty',
    header: () => {
      const isSorted = sortBy === 'qty';
      return (
        <Button
          variant="ghost"
          onClick={() => onSort?.('qty')}
          className="-ml-4 hover:bg-transparent font-semibold h-8 text-xs uppercase tracking-wider text-muted-foreground"
        >
          Quantity
          {isSorted ? (
            sortOrder === 'asc' ? (
              <ArrowUpIcon className="ml-2 w-3.5 h-3.5 text-foreground" />
            ) : (
              <ArrowDownIcon className="ml-2 w-3.5 h-3.5 text-foreground" />
            )
          ) : (
            <ArrowUpDownIcon className="ml-2 w-3.5 h-3.5 text-muted-foreground/30" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const balance = row.original;
      const minStock = balance.item?.minStock || 0;
      const isLowStock = balance.qty <= minStock;

      return (
        <div className="flex items-center gap-1.5 font-mono">
          <span className={isLowStock && balance.qty > 0 ? "text-warning font-semibold" : balance.qty === 0 ? "text-destructive font-semibold" : "font-medium"}>
            {balance.qty}
          </span>
          <span className="text-muted-foreground text-xs">{balance.item?.unit}</span>
          {isLowStock && (
            <span className="ml-2 px-1.5 py-0.5 rounded bg-warning/10 text-warning text-[10px] font-sans font-medium uppercase tracking-wider">
              Low Stock
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'updatedAt',
    header: () => {
      const isSorted = sortBy === 'updatedAt';
      return (
        <Button
          variant="ghost"
          onClick={() => onSort?.('updatedAt')}
          className="-ml-4 hover:bg-transparent font-semibold h-8 text-xs uppercase tracking-wider text-muted-foreground"
        >
          Last Updated
          {isSorted ? (
            sortOrder === 'asc' ? (
              <ArrowUpIcon className="ml-2 w-3.5 h-3.5 text-foreground" />
            ) : (
              <ArrowDownIcon className="ml-2 w-3.5 h-3.5 text-foreground" />
            )
          ) : (
            <ArrowUpDownIcon className="ml-2 w-3.5 h-3.5 text-muted-foreground/30" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.original.updatedAt);
      return <span className="text-muted-foreground text-sm">{date.toLocaleString()}</span>;
    },
  },
];
