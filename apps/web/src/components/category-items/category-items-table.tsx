'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import {
  useCategoryItems,
  useCreateCategoryItem,
  useUpdateCategoryItem,
  useDeleteCategoryItem,
} from './use-category-items';
import { useDebounce } from '@web/hooks/use-debounce';
import { getColumns } from './category-columns';
import { ListCategoryItemsQuery, CategoryItem, ApiError } from '@growflow/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@web/components/ui/table';
import { Button } from '@web/components/ui/button';
import { Skeleton } from '@web/components/ui/skeleton';
import { Input } from '@web/components/ui/input';
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
  DialogHeader,
  DialogTitle,
} from '@web/components/ui/dialog';
import { CategoryItemForm, CategoryFormValues } from './category-item-form';
import { toast } from 'sonner';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  RotateCcwIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react';
import { useConfirm } from '@web/hooks/use-confirm';

interface CategoryItemsTableProps {
  isCreateOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CategoryItemsTable({ isCreateOpen, onOpenChange }: CategoryItemsTableProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const confirm = useConfirm();

  // Read search params
  const urlPage = searchParams.get('cat_page');
  const urlLimit = searchParams.get('cat_limit');
  const urlSearch = searchParams.get('cat_search');
  const urlSortBy = searchParams.get('cat_sortBy');
  const urlSortOrder = searchParams.get('cat_sortOrder');

  // Compute active states
  const page = urlPage ? parseInt(urlPage, 10) : 1;
  const limit = urlLimit ? parseInt(urlLimit, 10) : 10;
  const sortBy = urlSortBy || 'createdAt';
  const sortOrder = urlSortOrder === 'asc' || urlSortOrder === 'desc' ? urlSortOrder : 'desc';

  // Search input uses a local state for instant typing response
  const [search, setSearch] = React.useState(urlSearch || '');
  const debouncedSearch = useDebounce(search, 500);

  // Modal dialog states
  const [localCreateOpen, setLocalCreateOpen] = React.useState(false);
  const isCreateOpenControlled = isCreateOpen !== undefined;
  const isCreateOpenVal = isCreateOpenControlled ? isCreateOpen : localCreateOpen;
  const setIsCreateOpenVal = isCreateOpenControlled ? onOpenChange : setLocalCreateOpen;

  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<CategoryItem | undefined>(undefined);

  // Sync local search input with URL search param changes (e.g. reset)
  React.useEffect(() => {
    setSearch(urlSearch || '');
  }, [urlSearch]);

  // Helper to generate search params string
  const createQueryString = React.useCallback(
    (params: Record<string, string | number | boolean | null | undefined>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, String(value));
        }
      });

      return newParams.toString();
    },
    [searchParams],
  );

  // Sync debounced search to URL
  React.useEffect(() => {
    const currentUrlSearch = searchParams.get('cat_search') || '';
    if (debouncedSearch !== currentUrlSearch && search === debouncedSearch) {
      const queryString = createQueryString({
        cat_search: debouncedSearch || null,
        cat_page: 1, // Reset page on new search
      });
      router.replace(`${pathname}?${queryString}`, { scroll: false });
    }
  }, [debouncedSearch, search, pathname, router, createQueryString, searchParams]);

  // Setters that update URL
  const setPage = React.useCallback(
    (newPage: number) => {
      const queryString = createQueryString({ cat_page: newPage });
      router.replace(`${pathname}?${queryString}`, { scroll: false });
    },
    [pathname, router, createQueryString],
  );

  const setLimit = React.useCallback(
    (newLimit: number) => {
      const queryString = createQueryString({ cat_limit: newLimit, cat_page: 1 });
      router.replace(`${pathname}?${queryString}`, { scroll: false });
    },
    [pathname, router, createQueryString],
  );

  // Construct query object for API request
  const query = React.useMemo(() => {
    const q: ListCategoryItemsQuery = {
      page,
      limit,
      sortBy,
      sortOrder,
    };
    if (debouncedSearch) q.search = debouncedSearch;
    return q;
  }, [page, limit, debouncedSearch, sortBy, sortOrder]);

  const { data, isLoading, isError, error } = useCategoryItems(query);
  const createMutation = useCreateCategoryItem();
  const updateMutation = useUpdateCategoryItem(editingCategory?.id || '');
  const deleteMutation = useDeleteCategoryItem();

  const handleCreateSubmit = async (values: CategoryFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success('Category created successfully');
      setIsCreateOpenVal?.(false);
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to create category');
    }
  };

  const handleEditSubmit = async (values: CategoryFormValues) => {
    try {
      await updateMutation.mutateAsync(values);
      toast.success('Category updated successfully');
      setIsEditOpen(false);
      setEditingCategory(undefined);
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Failed to update category');
    }
  };

  const handleEdit = React.useCallback((category: CategoryItem) => {
    setEditingCategory(category);
    setIsEditOpen(true);
  }, []);

  const handleDelete = React.useCallback(
    async (category: CategoryItem) => {
      const ok = await confirm({
        title: 'Delete Category',
        description: (
          <>
            Are you sure you want to delete category{' '}
            <span className="font-semibold text-foreground">{category.name}</span>?
            This action cannot be undone.
          </>
        ),
        confirmText: 'Delete',
        variant: 'destructive',
      });
      if (ok) {
        try {
          await toast.promise(deleteMutation.mutateAsync(category.id), {
            loading: `Deleting category ${category.name}...`,
            success: `Category ${category.name} deleted successfully`,
            error: 'Failed to delete category',
          });
        } catch (err) {
          const apiError = err as ApiError;
          toast.error(apiError.message || 'Failed to delete category');
        }
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
        cat_sortBy: field,
        cat_sortOrder: newOrder,
        cat_page: 1,
      });
      router.replace(`${pathname}?${queryString}`, { scroll: false });
    },
    [sortBy, sortOrder, pathname, router, createQueryString],
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

  const isFilterActive = urlSearch && urlSearch !== '';

  const handleResetFilters = () => {
    setSearch('');
    const newParams = new URLSearchParams();
    // Keep item page search params if they exist
    Array.from(searchParams.entries()).forEach(([key, val]) => {
      if (!key.startsWith('cat_')) {
        newParams.set(key, val);
      }
    });
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-wrap sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="top-2.5 left-2.5 absolute w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search category name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
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

        <div>
          {/* Create Category Modal */}
          <Dialog open={isCreateOpenVal} onOpenChange={setIsCreateOpenVal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Category</DialogTitle>
                <DialogDescription>
                  Create a new category classification for items.
                </DialogDescription>
              </DialogHeader>
              <div className="pt-2">
                <CategoryItemForm
                  onSubmit={handleCreateSubmit}
                  isSubmitting={createMutation.isPending}
                  onCancel={() => setIsCreateOpenVal?.(false)}
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Category Modal */}
          <Dialog
            open={isEditOpen}
            onOpenChange={(open) => {
              setIsEditOpen(open);
              if (!open) setEditingCategory(undefined);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogDescription>Update the category name or description.</DialogDescription>
              </DialogHeader>
              <div className="pt-2">
                {editingCategory && (
                  <CategoryItemForm
                    initialData={editingCategory}
                    onSubmit={handleEditSubmit}
                    isSubmitting={updateMutation.isPending}
                    onCancel={() => setIsEditOpen(false)}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Categories Table */}
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
                    : 'Something went wrong while fetching categories.'}
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
                  No categories found.
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
              Showing page {page} of {totalPages} ({total} categories total)
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs whitespace-nowrap">
                Rows per page:
              </span>
              <Select value={limit.toString()} onValueChange={(val) => setLimit(Number(val || 10))}>
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
    </div>
  );
}
