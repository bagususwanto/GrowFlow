'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usePurchaseOrder, useUpdatePurchaseOrder } from '@web/hooks/use-purchase-orders';
import { PurchaseOrderForm, PurchaseOrderFormValues } from './purchase-order-form';
import { Card, CardContent } from '@web/components/ui/card';
import { BackButton } from '@web/components/ui/back-button';
import { Skeleton } from '@web/components/ui/skeleton';
import { toast } from 'sonner';
import { ApiError } from '@growflow/types';

export function EditPurchaseOrderContainer() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: po, isLoading, isError, error } = usePurchaseOrder(id);
  const updateMutation = useUpdatePurchaseOrder(id);

  const handleSubmit = async (data: PurchaseOrderFormValues) => {
    try {
      await updateMutation.mutateAsync({
        supplierId: data.supplierId,
        note: data.note || undefined,
        orderDate: data.orderDate || undefined,
        lineItems: data.lineItems.map((item) => ({
          itemId: item.itemId,
          qty: item.qty,
          unitPrice: item.unitPrice,
        })),
      });
      toast.success('Purchase Order updated successfully');
      router.push(`/purchasing/purchase-orders/${id}`);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Failed to update Purchase Order');
    }
  };

  if (isLoading) {
    return <Skeleton className="w-full h-96" />;
  }

  if (isError || !po) {
    return (
      <div className="p-8 text-center text-destructive font-medium">
        {error instanceof Error ? error.message : 'Failed to load Purchase Order details.'}
      </div>
    );
  }

  if (po.status !== 'DRAFT') {
    return (
      <div className="p-8 text-center text-warning font-medium">
        Only DRAFT Purchase Orders can be edited. This PO is currently in status: <span className="font-bold">{po.status}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BackButton fallbackUrl={`/purchasing/purchase-orders/${id}`} />
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Edit Purchase Order
          </h1>
          <p className="text-sm text-muted-foreground">
            Modify the items or pricing details of this draft order.
          </p>
        </div>
      </div>

      <Card className="w-full">
        <CardContent className="p-6">
          <PurchaseOrderForm
            initialData={po}
            onSubmit={handleSubmit}
            isSubmitting={updateMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}

