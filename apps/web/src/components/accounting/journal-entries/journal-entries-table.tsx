'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useJournalEntries, usePostJournalEntry, useCancelJournalEntry } from '@web/hooks/use-accounting';
import { JournalEntry } from '@growflow/types';
import { useDebounce } from '@web/hooks/use-debounce';
import { Card, CardContent } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { Skeleton } from '@web/components/ui/skeleton';
import { Input } from '@web/components/ui/input';
import { Badge } from '@web/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@web/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@web/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@web/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { SearchIcon, RotateCcwIcon, ChevronsLeftIcon, ChevronsRightIcon, EyeIcon, CheckSquareIcon, BanIcon, EllipsisVerticalIcon } from 'lucide-react';
import { useConfirm } from '@web/hooks/use-confirm';
import Link from 'next/link';

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

export function JournalEntriesTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const confirm = useConfirm();

  const urlPage = searchParams.get('page');
  const urlLimit = searchParams.get('limit');
  const urlSearch = searchParams.get('search');
  const urlStatus = searchParams.get('status');
  const urlStartDate = searchParams.get('startDate');
  const urlEndDate = searchParams.get('endDate');

  const page = urlPage ? parseInt(urlPage, 10) : 1;
  const limit = urlLimit ? parseInt(urlLimit, 10) : 10;
  const status = urlStatus || 'all';

  const [search, setSearch] = React.useState(urlSearch || '');
  const debouncedSearch = useDebounce(search, 500);

  const [startDate, setStartDate] = React.useState(urlStartDate || '');
  const [endDate, setEndDate] = React.useState(urlEndDate || '');

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

  React.useEffect(() => {
    const queryString = createQueryString({
      startDate: startDate || null,
      endDate: endDate || null,
      page: 1,
    });
    router.replace(`${pathname}?${queryString}`, { scroll: false });
  }, [startDate, endDate, pathname, router, createQueryString]);

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
    const q: {
      search?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    } = {
      page,
      limit,
    };
    if (debouncedSearch) q.search = debouncedSearch;
    if (status && status !== 'all') q.status = status;
    if (startDate) q.startDate = startDate;
    if (endDate) q.endDate = endDate;
    return q;
  }, [page, limit, debouncedSearch, status, startDate, endDate]);

  const { data, isLoading, isError, error } = useJournalEntries(query);
  const postMutation = usePostJournalEntry();
  const cancelMutation = useCancelJournalEntry();

  const handlePost = async (je: JournalEntry) => {
    const ok = await confirm({
      title: 'Post Journal Entry',
      description: (
        <>
          Are you sure you want to post journal <span className="font-bold">{je.number}</span>? Once posted, ledger entries are officially committed.
        </>
      ),
      confirmText: 'Post Journal',
    });
    if (ok) {
      toast.promise(postMutation.mutateAsync(je.id), {
        loading: 'Posting journal entry...',
        success: 'Journal posted successfully',
        error: (err) => err?.message || 'Failed to post journal entry',
      });
    }
  };

  const handleCancel = async (je: JournalEntry) => {
    const ok = await confirm({
      title: 'Cancel Journal Entry',
      description: (
        <>
          Are you sure you want to cancel journal <span className="font-bold">{je.number}</span>? This will void its impact.
        </>
      ),
      confirmText: 'Cancel Journal',
      variant: 'destructive',
    });
    if (ok) {
      toast.promise(cancelMutation.mutateAsync(je.id), {
        loading: 'Cancelling journal entry...',
        success: 'Journal cancelled successfully',
        error: (err) => err?.message || 'Failed to cancel journal entry',
      });
    }
  };

  const tableData = React.useMemo(() => data?.data || [], [data]);
  const total = data?.total || 0;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  const isFilterActive =
    (urlSearch && urlSearch !== '') ||
    (urlStatus && urlStatus !== 'all') ||
    urlStartDate ||
    urlEndDate;

  const handleResetFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    const newParams = new URLSearchParams();
    if (limit !== 10) {
      newParams.set('limit', String(limit));
    }
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'DRAFT':
        return <Badge variant="secondary">Draft</Badge>;
      case 'POSTED':
        return <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600/90 text-white dark:bg-emerald-500">Posted</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{st}</Badge>;
    }
  };

  const getSourceBadge = (src: string | null) => {
    if (!src) return <Badge variant="outline">Manual</Badge>;
    return (
      <Badge variant="outline" className="border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 uppercase text-[10px] font-mono">
        {src.replace(/_/g, ' ')}
      </Badge>
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4 w-full">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="top-2.5 left-2.5 absolute w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search JE # or memo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>

          <Select value={status} onValueChange={(val) => setStatus(val || 'all')}>
            <SelectTrigger className="w-full sm:w-36 h-9">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="POSTED">Posted</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 w-36"
              placeholder="Start Date"
            />
            <span className="text-muted-foreground text-xs">to</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9 w-36"
              placeholder="End Date"
            />
          </div>

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

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[120px] font-semibold">Date</TableHead>
                <TableHead className="w-[140px] font-semibold">JE Number</TableHead>
                <TableHead className="font-semibold">Description / Memo</TableHead>
                <TableHead className="w-[150px] font-semibold">Source</TableHead>
                <TableHead className="w-[100px] font-semibold">Status</TableHead>
                <TableHead className="w-[100px] text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: limit }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="w-full h-6" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 font-medium text-destructive text-center"
                  >
                    {error instanceof Error ? error.message : 'Failed to load journal entries.'}
                  </TableCell>
                </TableRow>
              ) : tableData.length ? (
                tableData.map((je) => (
                  <TableRow key={je.id}>
                    <TableCell className="text-xs">{formatDate(je.entryDate)}</TableCell>
                    <TableCell className="font-mono text-xs font-semibold">{je.number}</TableCell>
                    <TableCell className="text-sm max-w-sm truncate">{je.description || '-'}</TableCell>
                    <TableCell>{getSourceBadge(je.sourceType)}</TableCell>
                    <TableCell>{getStatusBadge(je.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              className="flex data-[state=open]:bg-muted p-0 w-8 h-8 text-muted-foreground ml-auto"
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
                            <DropdownMenuItem render={<Link href={`/accounting/journal-entries/${je.id}`} />}>
                              <EyeIcon className="mr-2 w-4 h-4" />
                              View Details
                            </DropdownMenuItem>
                            {je.status === 'DRAFT' && (
                              <>
                                <DropdownMenuItem onClick={() => handlePost(je)}>
                                  <CheckSquareIcon className="mr-2 w-4 h-4" />
                                  Post Journal
                                </DropdownMenuItem>
                                <DropdownMenuItem variant="destructive" onClick={() => handleCancel(je)}>
                                  <BanIcon className="mr-2 w-4 h-4" />
                                  Cancel Journal
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-muted-foreground text-center"
                  >
                    No journal entries found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex sm:flex-row flex-col justify-between items-center gap-4 mt-4 p-4 border-t">
            <div className="text-muted-foreground text-sm">
              Showing page {page} of {totalPages} ({total} entries total)
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs whitespace-nowrap">Rows per page:</span>
              <Select value={limit.toString()} onValueChange={(val) => setLimit(Number(val || 10))}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1.5 ml-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => setPage(1)}
                  disabled={!hasPreviousPage || isLoading}
                >
                  <ChevronsLeftIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => setPage(Math.max(page - 1, 1))}
                  disabled={!hasPreviousPage || isLoading}
                >
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
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => setPage(totalPages)}
                  disabled={!hasNextPage || isLoading}
                >
                  <ChevronsRightIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
