'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useItem, useDeleteItem } from './use-items';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { Badge } from '@web/components/ui/badge';
import { Skeleton } from '@web/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@web/components/ui/alert';
import { toast } from 'sonner';
import { ApiError } from '@growflow/types';
import { useConfirm } from '@web/hooks/use-confirm';
import { useBreadcrumbLabel } from '@web/hooks/use-breadcrumb-label';
import {
  PackageIcon,
  LayersIcon,
  CalendarIcon,
  EditIcon,
  Trash2Icon,
  AlertCircleIcon,
  Loader2Icon,
  ClockIcon,
  ScaleIcon,
  InboxIcon,
  CheckCircleIcon,
} from 'lucide-react';

interface ItemDetailContainerProps {
  id: string;
}

export function ItemDetailContainer({ id }: ItemDetailContainerProps) {
  const router = useRouter();
  const { data: item, isLoading, isError, error } = useItem(id);
  const deleteMutation = useDeleteItem();
  const confirm = useConfirm();

  useBreadcrumbLabel(id, item?.name);

  const handleEdit = () => {
    router.push(`/inventory/items/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!item) return;
    const ok = await confirm({
      title: 'Delete Item',
      description: (
        <>
          Are you sure you want to delete item{' '}
          <span className="font-bold">{item.name}</span>?
          This action cannot be undone.
        </>
      ),
      confirmText: 'Delete',
      variant: 'destructive',
    });
    if (ok) {
      try {
        await toast.promise(deleteMutation.mutateAsync(item.id), {
          loading: `Deleting item ${item.name}...`,
          success: `Item ${item.name} deleted successfully`,
          error: 'Failed to delete item',
        });
        router.push('/inventory/items');
      } catch (err) {
        const apiError = err as ApiError;
        toast.error(apiError.message || 'Failed to delete item');
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 pt-4">
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !item) {
    return (
      <Alert variant="destructive" className="w-full">
        <AlertCircleIcon className="h-4 w-4" />
        <AlertTitle>Error loading item</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Could not fetch item details.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <Card className="w-full overflow-hidden bg-card">
        <CardHeader className="bg-muted/30 pb-6 border-b">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex justify-center items-center bg-primary/10 rounded-full w-16 h-16 text-primary border">
                <PackageIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold">{item.name}</CardTitle>
                <CardDescription className="font-mono text-sm">{item.code}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleEdit} className="h-9">
                <EditIcon className="mr-1.5 w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="h-9"
              >
                {deleteMutation.isPending ? (
                  <Loader2Icon className="mr-1.5 w-4 h-4 animate-spin" />
                ) : (
                  <Trash2Icon className="mr-1.5 w-4 h-4" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Section 1: Item specs */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Specifications</h3>
                <p className="text-xs text-muted-foreground">
                  Detailed classification and item info.
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <LayersIcon className="w-3.5 h-3.5" />
                    Category
                  </span>
                  <Badge variant="secondary" className="capitalize">
                    {item.category?.name || 'No Category'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ScaleIcon className="w-3.5 h-3.5" />
                    Unit of Measure
                  </span>
                  <span className="text-sm font-medium">{item.unit}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <InboxIcon className="w-3.5 h-3.5" />
                    Minimum Stock
                  </span>
                  <span className="text-sm font-mono font-semibold">{item.minStock}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <CheckCircleIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    Status
                  </span>
                  <Badge variant={item.isActive ? 'default' : 'destructive'} className="w-fit font-medium">
                    {item.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Section 2: Audit dates */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Timeline & History</h3>
                <p className="text-xs text-muted-foreground">
                  Timestamps tracking item creation and changes.
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    Created At
                  </span>
                  <span className="text-sm text-foreground">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ClockIcon className="w-3.5 h-3.5" />
                    Last Updated
                  </span>
                  <span className="text-sm text-foreground">
                    {new Date(item.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
