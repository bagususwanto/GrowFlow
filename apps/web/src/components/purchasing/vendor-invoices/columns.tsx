'use client';

import { ColumnDef } from '@tanstack/react-table';
import { VendorInvoice } from '@web/hooks/use-vendor-invoices';
import { Button } from '@web/components/ui/button';
import { VendorInvoiceStatusBadge } from './status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@web/components/ui/dropdown-menu';
import { EllipsisVerticalIcon, ArrowUpDownIcon, ArrowUpIcon, ArrowDownIcon, EyeIcon, BanIcon, ReceiptIcon, CreditCardIcon } from 'lucide-react';

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
  onView: (inv: VendorInvoice) => void;
  onReceive: (inv: VendorInvoice) => void;
  onPayment: (inv: VendorInvoice) => void;
  onCancel: (inv: VendorInvoice) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export const getColumns = ({
  onView,
  onReceive,
  onPayment,
  onCancel,
  sortBy,
  sortOrder,
  onSort,
}: ColumnActions): ColumnDef<VendorInvoice>[] => [
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
          Bill Number
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
      return <span className="font-medium">{row.original.supplier?.name || '-'}</span>;
    },
  },
  {
    accessorKey: 'invoiceDate',
    header: 'Invoice Date',
    cell: ({ row }) => {
      return <span>{row.original.invoiceDate ? formatDate(row.original.invoiceDate) : '-'}</span>;
    },
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
    cell: ({ row }) => {
      return <span>{row.original.dueDate ? formatDate(row.original.dueDate) : '-'}</span>;
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
    accessorKey: 'outstanding',
    header: 'Outstanding',
    cell: ({ row }) => {
      const outstanding = row.original.totalAmount - row.original.paidAmount;
      return (
        <span className={outstanding > 0 ? "font-semibold text-amber-600 dark:text-amber-400" : "text-muted-foreground"}>
          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(outstanding)}
        </span>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      return <VendorInvoiceStatusBadge status={row.original.status} />;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const inv = row.original;
      const isDraft = inv.status === 'DRAFT';
      const isOpen = inv.status === 'RECEIVED' || inv.status === 'PARTIAL';

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
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onView(inv)}>
                <EyeIcon className="mr-2 w-4 h-4" />
                View Details
              </DropdownMenuItem>

              {isDraft && (
                <>
                  <DropdownMenuItem onClick={() => onReceive(inv)}>
                    <ReceiptIcon className="mr-2 w-4 h-4" />
                    Mark as Received
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => onCancel(inv)}>
                    <BanIcon className="mr-2 w-4 h-4" />
                    Cancel Bill
                  </DropdownMenuItem>
                </>
              )}

              {isOpen && (
                <DropdownMenuItem onClick={() => onPayment(inv)}>
                  <CreditCardIcon className="mr-2 w-4 h-4" />
                  Record Payment
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
