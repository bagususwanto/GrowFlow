'use client';

import { ColumnDef } from '@tanstack/react-table';
import { PurchaseOrder } from '@growflow/types';
import { Button } from '@web/components/ui/button';
import { PurchaseOrderStatusBadge } from './status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@web/components/ui/dropdown-menu';
import { EditIcon, EllipsisVerticalIcon, ArrowUpDownIcon, ArrowUpIcon, ArrowDownIcon, EyeIcon, Trash2Icon, SendIcon, CheckSquareIcon } from 'lucide-react';

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
  onView: (po: PurchaseOrder) => void;
  onEdit: (po: PurchaseOrder) => void;
  onSubmit: (po: PurchaseOrder) => void;
  onApprove: (po: PurchaseOrder) => void;
  onDelete: (po: PurchaseOrder) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  userRole?: string;
}

export const getColumns = ({
  onView,
  onEdit,
  onSubmit,
  onApprove,
  onDelete,
  sortBy,
  sortOrder,
  onSort,
  userRole,
}: ColumnActions): ColumnDef<PurchaseOrder>[] => [
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
          PO Number
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
    accessorKey: 'supplier',
    header: 'Supplier',
    cell: ({ row }) => {
      const po = row.original;
      return <span className="font-medium">{po.supplier?.name || '-'}</span>;
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
      return <PurchaseOrderStatusBadge status={row.original.status} />;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const po = row.original;
      const isDraft = po.status === 'DRAFT';
      const isSubmitted = po.status === 'SUBMITTED';
      const isManagerOrAdmin = userRole === 'superadmin' || userRole === 'manager';

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
              <DropdownMenuItem onClick={() => onView(po)}>
                <EyeIcon className="mr-2 w-4 h-4" />
                View Details
              </DropdownMenuItem>

              {isDraft && (
                <>
                  <DropdownMenuItem onClick={() => onEdit(po)}>
                    <EditIcon className="mr-2 w-4 h-4" />
                    Edit Draft
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSubmit(po)}>
                    <SendIcon className="mr-2 w-4 h-4" />
                    Submit PO
                  </DropdownMenuItem>
                </>
              )}

              {isSubmitted && isManagerOrAdmin && (
                <DropdownMenuItem onClick={() => onApprove(po)}>
                  <CheckSquareIcon className="mr-2 w-4 h-4" />
                  Approve PO
                </DropdownMenuItem>
              )}

              {isDraft && (
                <DropdownMenuItem variant="destructive" onClick={() => onDelete(po)}>
                  <Trash2Icon className="mr-2 w-4 h-4" />
                  Delete PO
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
