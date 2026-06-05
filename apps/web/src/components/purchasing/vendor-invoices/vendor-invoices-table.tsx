'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useVendorInvoices, useReceiveVendorInvoice, useRecordVendorInvoicePayment, useCancelVendorInvoice, VendorInvoice } from '@web/hooks/use-vendor-invoices';
import { useDebounce } from '@web/hooks/use-debounce';
import { getColumns } from './columns';
import { ListVendorInvoicesQuery } from '@web/hooks/use-vendor-invoices';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@web/components/ui/table';
import { Button } from '@web/components/ui/button';
import { Card, CardContent } from '@web/components/ui/card';
import { Skeleton } from '@web/components/ui/skeleton';
import { Input } from '@web/components/ui/input';
import { DatePicker } from '@web/components/ui/date-picker';
import { format } from 'date-fns';
import { Label } from '@web/components/ui/label';
import { Textarea } from '@web/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@web/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@web/components/ui/dialog';
import { toast } from 'sonner';
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon, RotateCcwIcon, ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-react';
import { useConfirm } from '@web/hooks/use-confirm';

export function VendorInvoicesTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const confirm = useConfirm();

  const urlPage = searchParams.get('page');
  const urlLimit = searchParams.get('limit');
  const urlSearch = searchParams.get('search');
  const urlStatus = searchParams.get('status');
  const urlSortBy = searchParams.get('sortBy');
  const urlSortOrder = searchParams.get('sortOrder');

  const page = urlPage ? parseInt(urlPage, 10) : 1;
  const limit = urlLimit ? parseInt(urlLimit, 10) : 10;
  const status = urlStatus || 'all';
  const sortBy = urlSortBy || 'createdAt';
  const sortOrder = (urlSortOrder === 'asc' || urlSortOrder === 'desc') ? urlSortOrder : 'desc';

  const [search, setSearch] = React.useState(urlSearch || '');
  const debouncedSearch = useDebounce(search, 500);

  // Modal states
  const [selectedInvoice, setSelectedInvoice] = React.useState<VendorInvoice | null>(null);
  const [isReceiveOpen, setIsReceiveOpen] = React.useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false);

  // Form states
  const [invoiceDate, setInvoiceDate] = React.useState('');
  const [dueDate, setDueDate] = React.useState('');
  const [paymentAmount, setPaymentAmount] = React.useState('');
  const [paymentDate, setPaymentDate] = React.useState('');
  const [note, setNote] = React.useState('');

  React.useEffect(() => {
    setSearch(urlSearch || '');
  }, [urlSearch]);

  const createQueryString = React.useCallback(
    (params: Record<string, string | number | boolean | null | undefined>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '' || value === 'all') {
          newParams.delete(key);
        } else {
          newParams.set(key, String(value));
        }
      });
      return newParams.toString();
    },
    [searchParams]
  );

  React.useEffect(() => {
    const currentUrlSearch = searchParams.get('search') || '';
    if (debouncedSearch !== currentUrlSearch && search === debouncedSearch) {
      const queryString = createQueryString({
        search: debouncedSearch || null,
        page: 1,
      });
      router.replace(`${pathname}?${queryString}`, { scroll: false });
    }
  }, [debouncedSearch, search, pathname, router, createQueryString, searchParams]);

  const setPage = React.useCallback(
    (newPage: number) => {
      const queryString = createQueryString({ page: newPage });
      router.replace(`${pathname}?${queryString}`, { scroll: false });
    },
    [pathname, router, createQueryString]
  );

  const setLimit = React.useCallback(
    (newLimit: number) => {
      const queryString = createQueryString({ limit: newLimit, page: 1 });
      router.replace(`${pathname}?${queryString}`, { scroll: false });
    },
    [pathname, router, createQueryString]
  );

  const setStatus = React.useCallback(
    (newStatus: string) => {
      const queryString = createQueryString({ status: newStatus, page: 1 });
      router.replace(`${pathname}?${queryString}`, { scroll: false });
    },
    [pathname, router, createQueryString]
  );

  const query = React.useMemo(() => {
    const q: ListVendorInvoicesQuery = {
      page,
      limit,
    };
    if (debouncedSearch) q.search = debouncedSearch;
    if (status && status !== 'all') q.status = status;
    return q;
  }, [page, limit, debouncedSearch, status]);

  const { data, isLoading, isError, error } = useVendorInvoices(query);
  const receiveMutation = useReceiveVendorInvoice();
  const paymentMutation = useRecordVendorInvoicePayment(selectedInvoice?.id || '');
  const cancelMutation = useCancelVendorInvoice();

  const handleView = React.useCallback(
    (inv: VendorInvoice) => {
      router.push(`/purchasing/vendor-invoices/${inv.id}`);
    },
    [router],
  );

  const handleOpenReceive = React.useCallback(
    (inv: VendorInvoice) => {
      setSelectedInvoice(inv);
      const today = new Date().toISOString().split('T')[0];
      setInvoiceDate(today);
      
      // Calculate due date based on payment terms
      const due = new Date();
      due.setDate(due.getDate() + (inv.paymentTermsDays || 30));
      setDueDate(due.toISOString().split('T')[0]);
      
      setNote('');
      setIsReceiveOpen(true);
    },
    []
  );

  const handleOpenPayment = React.useCallback(
    (inv: VendorInvoice) => {
      setSelectedInvoice(inv);
      const outstanding = inv.totalAmount - inv.paidAmount;
      setPaymentAmount(outstanding.toString());
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setIsPaymentOpen(true);
    },
    []
  );

  const handleCancel = React.useCallback(
    async (inv: VendorInvoice) => {
      const ok = await confirm({
        title: 'Cancel Vendor Bill',
        description: (
          <>
            Are you sure you want to cancel bill <span className="font-bold">{inv.number}</span>? This action cannot be undone.
          </>
        ),
        confirmText: 'Cancel Bill',
        variant: 'destructive',
      });
      if (ok) {
        toast.promise(cancelMutation.mutateAsync(inv.id), {
          loading: `Cancelling bill ${inv.number}...`,
          success: `Bill ${inv.number} cancelled successfully`,
          error: (err) => err?.message || 'Failed to cancel bill',
        });
      }
    },
    [confirm, cancelMutation]
  );

  const handleSort = React.useCallback(
    (field: string) => {
      let newOrder: 'asc' | 'desc' = 'asc';
      if (sortBy === field) {
        newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      }
      const queryString = createQueryString({
        sortBy: field,
        sortOrder: newOrder,
        page: 1,
      });
      router.replace(`${pathname}?${queryString}`, { scroll: false });
    },
    [sortBy, sortOrder, pathname, router, createQueryString]
  );

  const columns = React.useMemo(
    () =>
      getColumns({
        onView: handleView,
        onReceive: handleOpenReceive,
        onPayment: handleOpenPayment,
        onCancel: handleCancel,
        sortBy,
        sortOrder,
        onSort: handleSort,
      }),
    [handleView, handleOpenReceive, handleOpenPayment, handleCancel, sortBy, sortOrder, handleSort],
  );

  const tableData = React.useMemo(() => data?.data || [], [data]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const total = data?.total || 0;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  const isFilterActive = (urlSearch && urlSearch !== '') || (urlStatus && urlStatus !== 'all');

  const handleResetFilters = () => {
    setSearch('');
    const newParams = new URLSearchParams();
    if (limit !== 10) {
      newParams.set('limit', String(limit));
    }
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const submitReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      await receiveMutation.mutateAsync({
        id: selectedInvoice.id,
        data: {
          invoiceDate,
          dueDate,
          note: note || undefined,
        },
      });
      toast.success(`Bill ${selectedInvoice.number} marked as received`);
      setIsReceiveOpen(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to mark bill as received';
      toast.error(errorMsg);
    }
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    try {
      await paymentMutation.mutateAsync({
        amount: amountNum,
        paymentDate: paymentDate || undefined,
        note: note || undefined,
      });
      toast.success(`Payment recorded for ${selectedInvoice.number}`);
      setIsPaymentOpen(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to record payment';
      toast.error(errorMsg);
    }
  };

  return (
    <Card className="shadow-xs border-border/40">
      <CardContent className="p-4">
        {/* Filters section */}
        <div className="flex flex-wrap items-center gap-2 mb-4 w-full">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="top-2.5 left-2.5 absolute w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search Bill # or Supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>

          <Select value={status} onValueChange={(val) => setStatus(val || 'all')}>
            <SelectTrigger className="w-full sm:w-40 h-9">
              <SelectValue placeholder="Filter by Status">
                {status === 'all' && 'All Status'}
                {status === 'DRAFT' && 'Draft'}
                {status === 'RECEIVED' && 'Received'}
                {status === 'PARTIAL' && 'Partial Paid'}
                {status === 'PAID' && 'Paid'}
                {status === 'CANCELLED' && 'Cancelled'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="RECEIVED">Received</SelectItem>
              <SelectItem value="PARTIAL">Partial Paid</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {isFilterActive && (
            <Button
              variant="ghost"
              onClick={handleResetFilters}
              className="w-full sm:w-auto h-9 text-muted-foreground text-xs"
            >
              <RotateCcwIcon className="mr-1.5 w-3.5 h-3.5" />
              Reset
            </Button>
          )}
        </div>

        <div className="border rounded-lg overflow-hidden border-border/60">
          <Table>
            <TableHeader className="bg-muted/30">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: limit }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        <Skeleton className="w-full h-6" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 font-medium text-destructive text-center"
                  >
                    {error instanceof Error
                      ? error.message
                      : 'Something went wrong while fetching vendor invoices.'}
                  </TableCell>
                </TableRow>
              ) : tableData.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-muted-foreground text-center"
                  >
                    No vendor invoices found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination controls */}
        {totalPages > 0 && (
          <div className="flex sm:flex-row flex-col justify-between items-center gap-4 mt-4 p-4 border-t border-border/55">
            <div className="flex sm:flex-row flex-col items-center gap-4 w-full sm:w-auto">
              <div className="text-muted-foreground text-sm">
                Showing page {page} of {totalPages} ({total} bills total)
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs whitespace-nowrap">
                  Rows per page:
                </span>
                <Select
                  value={limit.toString()}
                  onValueChange={(val) => setLimit(Number(val || 10))}
                >
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => setPage(1)}
                  disabled={!hasPreviousPage || isLoading}
                >
                  <ChevronsLeftIcon className="w-4 h-4" />
                  <span className="sr-only">First page</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => setPage(Math.max(page - 1, 1))}
                  disabled={!hasPreviousPage || isLoading}
                >
                  <ChevronLeftIcon className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => setPage(Math.min(page + 1, totalPages))}
                  disabled={!hasNextPage || isLoading}
                >
                  Next
                  <ChevronRightIcon className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => setPage(totalPages)}
                  disabled={!hasNextPage || isLoading}
                >
                  <ChevronsRightIcon className="w-4 h-4" />
                  <span className="sr-only">Last page</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Mark as Received Modal */}
      <Dialog open={isReceiveOpen} onOpenChange={setIsReceiveOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mark Bill as Received</DialogTitle>
            <DialogDescription>
              Marking bill <span className="font-semibold">{selectedInvoice?.number}</span> as received will officially record the transaction in the ledger and post the appropriate accounting journals.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitReceive} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceDate">Invoice Date</Label>
                <DatePicker
                  value={invoiceDate}
                  onChange={(date) => setInvoiceDate(date ? format(date, 'yyyy-MM-dd') : '')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <DatePicker
                  value={dueDate}
                  onChange={(date) => setDueDate(date ? format(date, 'yyyy-MM-dd') : '')}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Notes / Memo</Label>
              <Textarea
                id="note"
                placeholder="Optional description of this invoice..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsReceiveOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={receiveMutation.isPending}>
                {receiveMutation.isPending ? 'Confirming...' : 'Confirm Receipt'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Record Payment Modal */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record AP Payment</DialogTitle>
            <DialogDescription>
              Record cash disbursement to settle outstanding balance of bill <span className="font-semibold">{selectedInvoice?.number}</span>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitPayment} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount (IDR)</Label>
              <Input
                id="amount"
                type="number"
                required
                min="1"
                max={selectedInvoice ? selectedInvoice.totalAmount - selectedInvoice.paidAmount : undefined}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>Total Bill: {selectedInvoice ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(selectedInvoice.totalAmount) : ''}</span>
                <span>Outstanding: {selectedInvoice ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(selectedInvoice.totalAmount - selectedInvoice.paidAmount) : ''}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date</Label>
              <DatePicker
                value={paymentDate}
                onChange={(date) => setPaymentDate(date ? format(date, 'yyyy-MM-dd') : '')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Notes / Reference</Label>
              <Textarea
                id="note"
                placeholder="Payment reference, bank transfer ID, check number, etc."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsPaymentOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={paymentMutation.isPending}>
                {paymentMutation.isPending ? 'Recording...' : 'Record Payment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
