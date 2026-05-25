'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useUsers, useDeleteUser } from '@web/hooks/use-users';
import { getColumns } from './columns';
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
import { Alert, AlertDescription, AlertTitle } from '@web/components/ui/alert';
import { toast } from 'sonner';
import { ChevronLeftIcon, ChevronRightIcon, AlertCircleIcon } from 'lucide-react';

export function UsersTable() {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const limit = 10;

  const { data, isLoading, isError, error } = useUsers(page, limit);
  const deleteMutation = useDeleteUser();

  const handleEdit = (user: { id: string }) => {
    router.push(`/dashboard/users/${user.id}/edit`);
  };

  const handleDelete = async (user: { id: string; name: string }) => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      toast.promise(deleteMutation.mutateAsync(user.id), {
        loading: `Deleting user ${user.name}...`,
        success: `User ${user.name} deleted successfully`,
        error: 'Failed to delete user',
      });
    }
  };

  const columns = React.useMemo(
    () => getColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    [],
  );

  const tableData = React.useMemo(() => data?.data || [], [data]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="w-full h-10" />
            <Skeleton className="w-full h-20" />
            <Skeleton className="w-full h-20" />
            <Skeleton className="w-full h-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon className="w-4 h-4" />
        <AlertTitle>Error loading users</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Something went wrong while fetching users.'}
        </AlertDescription>
      </Alert>
    );
  }

  const totalPages = data ? Math.ceil(data.total / limit) : 0;
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  return (
    <Card>
      <CardContent className="p-4">
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
              {table.getRowModel().rows?.length ? (
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
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t">
            <div className="text-muted-foreground text-sm">
              Showing page {page} of {totalPages} ({data?.total} users total)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={!hasPreviousPage}
              >
                <ChevronLeftIcon className="w-4 h-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={!hasNextPage}
              >
                Next
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
