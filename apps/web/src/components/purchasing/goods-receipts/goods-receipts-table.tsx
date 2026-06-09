'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useGoodsReceipts, useDeleteGoodsReceipt, useConfirmGoodsReceipt } from '@web/hooks/use-goods-receipts';
import { useDebounce } from '@web/hooks/use-debounce';
import { getColumns } from './columns';
import { ListGoodsReceiptsQuery, GoodsReceiptStatus } from '@growflow/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@web/components/ui/select';
import { toast } from 'sonner';
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon, RotateCcwIcon, ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-react';
import { useConfirm } from '@web/hooks/use-confirm';
import { useAuthStore } from '@web/stores/auth.store';

export function GoodsReceiptsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const confirm = useConfirm();
  const user = useAuthStore((state) => state.user);

  const urlPage = searchParams.get('page');
  const urlLimit = searchParams.get('limit');
  const urlSearch = searchParams.get('search');
  const urlStatus = searchParams.get('status');
  const urlSortBy = searchParams.get('sortBy');
  const urlSortOrder = searchParams.get('sortOrder');
  const urlSupplierId = searchParams.get('supplierId');

  const page = urlPage ? parseInt(urlPage, 10) : 1;
  const limit = urlLimit ? parseInt(urlLimit, 10) : 10;
  const status = urlStatus || 'all';
  const sortBy = urlSortBy || 'createdAt';
  const sortOrder = (urlSortOrder === 'asc' || urlSortOrder === 'desc') ? urlSortOrder : 'desc';

  const [search, setSearch] = React.useState(urlSearch || '');
  const debouncedSearch = useDebounce(search, 500);

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
    const q: ListGoodsReceiptsQuery = {
      page,
      limit,
      sortBy,
      sortOrder,
    };
    if (debouncedSearch) q.search = debouncedSearch;
    if (status && status !== 'all') q.status = status as GoodsReceiptStatus;
    if (urlSupplierId) q.supplierId = urlSupplierId;
    return q;
  }, [page, limit, debouncedSearch, status, sortBy, sortOrder, urlSupplierId]);

  const { data, isLoading, isError, error } = useGoodsReceipts(query);
  const deleteMutation = useDeleteGoodsReceipt();
  const confirmMutation = useConfirmGoodsReceipt();

  const handleView = React.useCallback(
    (gr: { id: string }) => {
      router.push(`/logistics/goods-receipts/${gr.id}`);
    },
    [router],
  );

  const handleConfirm = React.useCallback(
    async (gr: { id: string; number: string }) => {
      const ok = await confirm({
        title: 'Confirm Goods Receipt',
        description: (
          <>
            Confirm receipt for <span className="font-bold">{gr.number}</span>? This will add items to stock balance and cannot be undone.
          </>
        ),
        confirmText: 'Confirm Receipt',
      });
      if (ok) {
        toast.promise(confirmMutation.mutateAsync(gr.id), {
          loading: `Confirming GRN ${gr.number}...`,
          success: `GRN ${gr.number} confirmed. Stock balances updated successfully`,
          error: 'Failed to confirm receipt',
        });
      }
    },
    [confirm, confirmMutation]
  );

  const handleDelete = React.useCallback(
    async (gr: { id: string; number: string }) => {
      const ok = await confirm({
        title: 'Delete Goods Receipt',
        description: (
          <>
            Are you sure you want to delete draft <span className="font-bold">{gr.number}</span>? This action cannot be undone.
          </>
        ),
        confirmText: 'Delete',
        variant: 'destructive',
      });
      if (ok) {
        toast.promise(deleteMutation.mutateAsync(gr.id), {
          loading: `Deleting GRN ${gr.number}...`,
          success: `GRN ${gr.number} deleted successfully`,
          error: 'Failed to delete GRN',
        });
      }
    },
    [confirm, deleteMutation],
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
        onConfirm: handleConfirm,
        onDelete: handleDelete,
        sortBy,
        sortOrder,
        onSort: handleSort,
        userPermissions: user?.permissions,
      }),
    [handleView, handleConfirm, handleDelete, sortBy, sortOrder, handleSort, user?.permissions],
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

  const isFilterActive =
    (urlSearch && urlSearch !== '') ||
    (urlStatus && urlStatus !== 'all') ||
    urlSupplierId;

  const handleResetFilters = () => {
    setSearch('');
    const newParams = new URLSearchParams();
    if (limit !== 10) {
      newParams.set('limit', String(limit));
    }
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  return (
    <Card>
      <CardContent className="p-4">
        {/* Filters and search section */}
        <div className="flex flex-wrap items-center gap-2 mb-4 w-full">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="top-2.5 left-2.5 absolute w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search GRN number..."
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
                {status === 'CONFIRMED' && 'Confirmed'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
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

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
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
                      : 'Something went wrong while fetching goods receipts.'}
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
                    No goods receipts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination controls */}
        {totalPages > 0 && (
          <div className="flex sm:flex-row flex-col justify-between items-center gap-4 mt-4 p-4 border-t">
            <div className="flex sm:flex-row flex-col items-center gap-4 w-full sm:w-auto">
              <div className="text-muted-foreground text-sm">
                Showing page {page} of {totalPages} ({total} GRN total)
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
    </Card>
  );
}
