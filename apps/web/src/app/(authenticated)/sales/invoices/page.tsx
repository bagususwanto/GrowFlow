'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSalesInvoices } from '@web/hooks/use-sales-invoices';
import { SalesInvoiceStatusBadge } from '@web/components/sales/sales-orders/invoice-status-badge';
import { Input } from '@web/components/ui/input';
import { Button } from '@web/components/ui/button';
import { Card, CardContent } from '@web/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@web/components/ui/select';
import { Skeleton } from '@web/components/ui/skeleton';
import { SearchIcon, ReceiptTextIcon, ArrowRightIcon, FileTextIcon } from 'lucide-react';
import { useDebounce } from '@web/hooks/use-debounce';
import { useBreadcrumbLabel } from '@web/hooks/use-breadcrumb-label';
import { SalesInvoiceStatus } from '@growflow/types';

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
}

export default function SalesInvoicesListPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const queryParams = {
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    status: status === 'ALL' ? undefined : (status as SalesInvoiceStatus),
  };

  const { data, isLoading } = useSalesInvoices(queryParams);

  useBreadcrumbLabel('invoices', 'Invoices');

  const invoices = data?.data || [];
  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (val: string | null) => {
    setStatus(val || 'ALL');
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-4 px-4 lg:px-6">
      {/* Header */}
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-start gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ReceiptTextIcon className="h-3 w-3" />
            Billing & Invoicing
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Sales Invoices</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Monitor billing statements, customer payments, credit adjustments, and due dates.
          </p>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="bg-card/45 backdrop-blur-xs border-foreground/10">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoice number, SO number, customer..."
                value={search}
                onChange={handleSearchChange}
                className="pl-9"
              />
            </div>

            <div>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="PARTIAL">Partial</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Total count indicator */}
            <div className="flex items-center justify-end text-sm text-muted-foreground">
              Total Invoices: {data?.total ?? 0}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table / List */}
      <Card className="border-foreground/10 bg-card/45 backdrop-blur-xs">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/40 border-b border-foreground/10">
                  <tr className="text-xs text-muted-foreground uppercase font-bold">
                    <th className="p-4">Invoice No</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Order Reference</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4 text-right">Total Amount</th>
                    <th className="p-4 text-right">Remaining Bal</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/10">
                  {invoices.map((inv) => {
                    const outstanding = Number(inv.totalAmount) - Number(inv.paidAmount);
                    return (
                      <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-4 font-semibold font-mono">
                          <Link href={`/sales/invoices/${inv.id}`} className="text-primary hover:underline">
                            {inv.number}
                          </Link>
                          <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                            Issued: {formatDate(inv.invoiceDate)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-foreground">{inv.customer?.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{inv.customer?.code}</div>
                        </td>
                        <td className="p-4">
                          <Link href={`/sales/sales-orders/${inv.salesOrderId}`} className="font-mono text-xs hover:underline text-muted-foreground">
                            {inv.salesOrder?.number}
                          </Link>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{formatDate(inv.dueDate)}</div>
                        </td>
                        <td className="p-4 text-right font-semibold">
                          {formatCurrency(inv.totalAmount)}
                        </td>
                        <td className={`p-4 text-right font-bold ${outstanding > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {formatCurrency(outstanding)}
                        </td>
                        <td className="p-4">
                          <SalesInvoiceStatusBadge status={inv.status} />
                        </td>
                        <td className="p-4 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            nativeButton={false}
                            render={
                              <Link href={`/sales/invoices/${inv.id}`} title="View Details">
                                <ArrowRightIcon className="h-4 w-4" />
                              </Link>
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground space-y-4">
              <FileTextIcon className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-sm font-medium">No sales invoices found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-2">
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
