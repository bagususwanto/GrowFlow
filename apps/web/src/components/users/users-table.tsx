'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useUsers, useDeleteUser } from '@web/hooks/use-users';
import { useDebounce } from '@web/hooks/use-debounce';
import { useRoles } from '@web/hooks/use-roles';
import { getColumns } from './columns';
import { FindAllUsersQuery } from '@growflow/types';
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

export function UsersTable() {
  const router = useRouter();

  // State for filtering, sorting, and pagination
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [roleId, setRoleId] = React.useState('all');
  const [isActive, setIsActive] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('createdAt');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

  // Reset page on filter/limit change
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleId, isActive, limit]);

  // Construct query object
  const query = React.useMemo(() => {
    const q: FindAllUsersQuery = {
      page,
      limit,
      sortBy,
      sortOrder,
    };
    if (debouncedSearch) q.search = debouncedSearch;
    if (roleId && roleId !== 'all') q.roleId = roleId;
    if (isActive && isActive !== 'all') q.isActive = isActive === 'true';
    return q;
  }, [page, limit, debouncedSearch, roleId, isActive, sortBy, sortOrder]);

  const { data, isLoading, isError, error } = useUsers(query);
  const { data: rolesData } = useRoles();
  const deleteMutation = useDeleteUser();

  const handleEdit = React.useCallback(
    (user: { id: string }) => {
      router.push(`/dashboard/users/${user.id}/edit`);
    },
    [router],
  );

  const handleDelete = React.useCallback(
    async (user: { id: string; name: string }) => {
      if (confirm(`Are you sure you want to delete ${user.name}?`)) {
        toast.promise(deleteMutation.mutateAsync(user.id), {
          loading: `Deleting user ${user.name}...`,
          success: `User ${user.name} deleted successfully`,
          error: 'Failed to delete user',
        });
      }
    },
    [deleteMutation],
  );

  const handleSort = React.useCallback(
    (field: string) => {
      if (sortBy === field) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(field);
        setSortOrder('asc');
      }
      setPage(1);
    },
    [sortBy],
  );

  const columns = React.useMemo(
    () =>
      getColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        sortBy,
        sortOrder,
        onSort: handleSort,
      }),
    [handleEdit, handleDelete, sortBy, sortOrder, handleSort],
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

  const isFilterActive = search !== '' || roleId !== 'all' || isActive !== 'all';

  const handleResetFilters = () => {
    setSearch('');
    setRoleId('all');
    setIsActive('all');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  return (
    <Card>
      <CardContent className="p-4">
        {/* Filters and search section */}
        <div className="flex flex-wrap items-center gap-2 mb-4 w-full">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="top-2.5 left-2.5 absolute w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>

          <Select value={roleId} onValueChange={(val) => setRoleId(val || 'all')}>
            <SelectTrigger className="w-full sm:w-40 h-9">
              <SelectValue placeholder="Filter by Role">
                {roleId === 'all'
                  ? 'All Roles'
                  : rolesData?.data?.find((r) => r.id === roleId)?.name || 'Loading...'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {rolesData?.data?.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={isActive} onValueChange={(val) => setIsActive(val || 'all')}>
            <SelectTrigger className="w-full sm:w-40 h-9">
              <SelectValue placeholder="Filter by Status">
                {isActive === 'all' && 'All Status'}
                {isActive === 'true' && 'Active'}
                {isActive === 'false' && 'Inactive'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
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
                      : 'Something went wrong while fetching users.'}
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
                    No users found.
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
                Showing page {page} of {totalPages} ({total} users total)
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
                    <SelectItem value="100">100</SelectItem>
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
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={!hasPreviousPage || isLoading}
              >
                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
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
