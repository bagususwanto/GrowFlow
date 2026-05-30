'use client';

import { ColumnDef } from '@tanstack/react-table';
import { SalesOrder } from '@growflow/types';
import { Button } from '@web/components/ui/button';
import { SalesOrderStatusBadge } from './status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@web/components/ui/dropdown-menu';
import { EditIcon, EllipsisVerticalIcon, ArrowUpDownIcon, ArrowUpIcon, ArrowDownIcon, EyeIcon, Trash2Icon, CheckSquareIcon } from 'lucide-react';

function formatDate(dateStr: string) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

interface ColumnActions {
  onView: (so: SalesOrder) => void;
  onEdit: (so: SalesOrder) => void;
  onConfirm: (so: SalesOrder) => void;
  onDelete: (so: SalesOrder) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export const getColumns = ({
  onView,
  onEdit,
  onConfirm,
  onDelete,
  sortBy,
  sortOrder,
  onSort,
}: ColumnActions): ColumnDef<SalesOrder>[] => [
  {
    accessorKey: 'number',
    header: () => {
      const isSorted = sortBy === 'number';
      return (
        <Button
          variant="ghost"
          onClick={() => onSort?.('number')}
          className="-ml-4 hover:bg-transparent font-semibold h-8 text-xs uppercase tracking-wider text-muted-foreground"
        >
          SO Number
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
      return <span className="font-mono text-xs font-semibold">{row.original.number}</span>;
    },
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ row }) => {
      const so = row.original;
      return <span className="font-medium">{so.customer?.name || '-'}</span>;
    },
  },
  {
    accessorKey: 'warehouse',
    header: 'Warehouse',
    cell: ({ row }) => {
      const so = row.original;
      return <span>{so.warehouse?.name || '-'}</span>;
    },
  },
  {
    accessorKey: 'orderDate',
    header: 'Order Date',
    cell: ({ row }) => {
      return <span>{formatDate(row.original.orderDate)}</span>;
    },
  },
  {
    accessorKey: 'totalAmount',
    header: 'Total Amount',
    cell: ({ row }) => {
      const amount = row.original.totalAmount;
      return <span className="font-semibold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)}</span>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      return <SalesOrderStatusBadge status={row.original.status} />;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const so = row.original;
      const isDraft = so.status === 'DRAFT';

      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="flex data-[state=open]:bg-muted p-0 w-8 h-8 text-muted-foreground"
                size="icon"
              >
                <EllipsisVerticalIcon className="w-4 h-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onView(so)}>
                <EyeIcon className="mr-2 w-4 h-4" />
                View Details
              </DropdownMenuItem>

              {isDraft && (
                <>
                  <DropdownMenuItem onClick={() => onEdit(so)}>
                    <EditIcon className="mr-2 w-4 h-4" />
                    Edit Draft
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onConfirm(so)}>
                    <CheckSquareIcon className="mr-2 w-4 h-4" />
                    Confirm SO
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete(so)}>
                    <Trash2Icon className="mr-2 w-4 h-4" />
                    Delete SO
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
