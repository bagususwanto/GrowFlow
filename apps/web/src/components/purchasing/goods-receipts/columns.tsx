'use client';

import { ColumnDef } from '@tanstack/react-table';
import { GoodsReceipt } from '@growflow/types';
import { Button } from '@web/components/ui/button';
import { GoodsReceiptStatusBadge } from './status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@web/components/ui/dropdown-menu';
import { EllipsisVerticalIcon, ArrowUpDownIcon, ArrowUpIcon, ArrowDownIcon, EyeIcon, Trash2Icon, CheckCircleIcon } from 'lucide-react';

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
  onView: (gr: GoodsReceipt) => void;
  onConfirm: (gr: GoodsReceipt) => void;
  onDelete: (gr: GoodsReceipt) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  userRole?: string;
}

export const getColumns = ({
  onView,
  onConfirm,
  onDelete,
  sortBy,
  sortOrder,
  onSort,
  userRole,
}: ColumnActions): ColumnDef<GoodsReceipt>[] => [
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
          GRN Number
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
    accessorKey: 'purchaseOrder',
    header: 'PO Reference',
    cell: ({ row }) => {
      const gr = row.original;
      return <span className="font-mono text-xs font-semibold">{gr.purchaseOrder?.number || '-'}</span>;
    },
  },
  {
    accessorKey: 'warehouse',
    header: 'Warehouse',
    cell: ({ row }) => {
      const gr = row.original;
      return <span className="font-medium">{gr.warehouse?.name || '-'}</span>;
    },
  },
  {
    accessorKey: 'receivedDate',
    header: 'Received Date',
    cell: ({ row }) => {
      return <span>{formatDate(row.original.receivedDate)}</span>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      return <GoodsReceiptStatusBadge status={row.original.status} />;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const gr = row.original;
      const isDraft = gr.status === 'DRAFT';
      const isWarehouseOrAdmin = userRole === 'superadmin' || userRole === 'manager' || userRole === 'warehouse';

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
              <DropdownMenuItem onClick={() => onView(gr)}>
                <EyeIcon className="mr-2 w-4 h-4" />
                View Details
              </DropdownMenuItem>

              {isDraft && isWarehouseOrAdmin && (
                <DropdownMenuItem onClick={() => onConfirm(gr)}>
                  <CheckCircleIcon className="mr-2 w-4 h-4" />
                  Confirm Receipt
                </DropdownMenuItem>
              )}

              {isDraft && (
                <DropdownMenuItem variant="destructive" onClick={() => onDelete(gr)}>
                  <Trash2Icon className="mr-2 w-4 h-4" />
                  Delete GRN
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
