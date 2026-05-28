import { ColumnDef } from '@tanstack/react-table';
import { StockMutation } from '@growflow/types';
import { Badge } from '@web/components/ui/badge';
import { Button } from '@web/components/ui/button';
import { ArrowUpDownIcon, ArrowUpIcon, ArrowDownIcon, PackageIcon, WarehouseIcon } from 'lucide-react';

interface ColumnActions {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export const getColumns = ({ sortBy, sortOrder, onSort }: ColumnActions): ColumnDef<StockMutation>[] => [
  {
    accessorKey: 'item.code',
    header: 'Item Code',
    cell: ({ row }) => {
      const mutation = row.original;
      return (
        <div className="flex items-center gap-2 font-medium">
          <div className="flex justify-center items-center bg-muted rounded-full w-8 h-8">
            <PackageIcon className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="font-mono text-sm">{mutation.item?.code || '-'}</span>
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
      const mutation = row.original;
      return (
        <div className="flex items-center gap-2">
          <WarehouseIcon className="w-3.5 h-3.5 text-muted-foreground" />
          <span>{mutation.warehouse?.name || '-'}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.original.type;
      let badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive' = 'default';
      
      switch (type) {
        case 'IN':
          badgeVariant = 'default';
          break;
        case 'OUT':
          badgeVariant = 'destructive';
          break;
        case 'TRANSFER':
          badgeVariant = 'secondary';
          break;
        case 'ADJUSTMENT':
          badgeVariant = 'outline';
          break;
      }

      return (
        <Badge variant={badgeVariant} className="font-semibold tracking-wider text-[10px]">
          {type}
        </Badge>
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
      const mutation = row.original;
      const isPositive = mutation.qty > 0;
      return (
        <div className="flex items-center gap-1 font-mono font-medium">
          <span className={isPositive ? 'text-green-600 dark:text-green-400' : 'text-destructive'}>
            {isPositive ? `+${mutation.qty}` : mutation.qty}
          </span>
          <span className="text-muted-foreground text-xs">{mutation.item?.unit}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'note',
    header: 'Note',
    cell: ({ row }) => {
      return <span className="text-muted-foreground text-sm line-clamp-1 max-w-[200px]">{row.original.note || '-'}</span>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: () => {
      const isSorted = sortBy === 'createdAt';
      return (
        <Button
          variant="ghost"
          onClick={() => onSort?.('createdAt')}
          className="-ml-4 hover:bg-transparent font-semibold h-8 text-xs uppercase tracking-wider text-muted-foreground"
        >
          Date Time
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
      const date = new Date(row.original.createdAt);
      return <span className="text-muted-foreground text-sm">{date.toLocaleString()}</span>;
    },
  },
];
