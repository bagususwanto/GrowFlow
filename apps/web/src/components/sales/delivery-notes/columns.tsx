'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { DeliveryNote } from '@growflow/types';
import { Button } from '@web/components/ui/button';
import { Badge } from '@web/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@web/components/ui/dropdown-menu';
import { EllipsisVerticalIcon, ArrowUpDownIcon, ArrowUpIcon, ArrowDownIcon, EyeIcon, Trash2Icon, CheckSquareIcon } from 'lucide-react';
import { hasPermission } from '@web/lib/permissions';

function formatDate(dateStr: string) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

interface ColumnActions {
  onView: (dn: DeliveryNote) => void;
  onConfirm: (dn: DeliveryNote) => void;
  onDelete: (dn: DeliveryNote) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  userPermissions?: string[];
}

export const getColumns = ({
  onView,
  onConfirm,
  onDelete,
  sortBy,
  sortOrder,
  onSort,
  userPermissions,
}: ColumnActions): ColumnDef<DeliveryNote>[] => [
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
          DN Number
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
    accessorKey: 'salesOrder',
    header: 'Sales Order Ref',
    cell: ({ row }) => {
      const salesOrder = row.original.salesOrder;
      if (!salesOrder) return <span className="text-muted-foreground">-</span>;
      return (
        <Link
          href={`/sales/sales-orders/${salesOrder.id}`}
          className="font-mono text-xs font-semibold text-primary hover:underline"
        >
          {salesOrder.number}
        </Link>
      );
    },
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ row }) => {
      return <span className="font-medium">{row.original.salesOrder?.customer?.name || '-'}</span>;
    },
  },
  {
    accessorKey: 'warehouse',
    header: 'Source Warehouse',
    cell: ({ row }) => {
      return <span>{row.original.salesOrder?.warehouse?.name || '-'}</span>;
    },
  },
  {
    accessorKey: 'deliveryDate',
    header: 'Delivery Date',
    cell: ({ row }) => {
      return <span>{formatDate(row.original.deliveryDate)}</span>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={status === 'CONFIRMED' ? 'default' : 'secondary'} className="capitalize font-semibold tracking-wide">
          {status.toLowerCase()}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const dn = row.original;
      const isDraft = dn.status === 'DRAFT';
      const canConfirm = hasPermission(userPermissions, 'confirm:delivery-notes');
      const canDelete = hasPermission(userPermissions, 'delete:delivery-notes');

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
              <DropdownMenuItem onClick={() => onView(dn)}>
                <EyeIcon className="mr-2 w-4 h-4" />
                View Details
              </DropdownMenuItem>

              {isDraft && (
                <>
                  {canConfirm && (
                    <DropdownMenuItem onClick={() => onConfirm(dn)}>
                      <CheckSquareIcon className="mr-2 w-4 h-4" />
                      Confirm Delivery
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem variant="destructive" onClick={() => onDelete(dn)}>
                      <Trash2Icon className="mr-2 w-4 h-4" />
                      Delete Draft
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
