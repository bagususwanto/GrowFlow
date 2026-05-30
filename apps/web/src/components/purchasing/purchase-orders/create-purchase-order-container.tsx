'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCreatePurchaseOrder } from '@web/hooks/use-purchase-orders';
import { PurchaseOrderForm, PurchaseOrderFormValues } from './purchase-order-form';
import { Card, CardContent } from '@web/components/ui/card';
import { toast } from 'sonner';
import { ApiError } from '@growflow/types';

export function CreatePurchaseOrderContainer() {
  const router = useRouter();
  const createMutation = useCreatePurchaseOrder();

  const handleSubmit = async (data: PurchaseOrderFormValues) => {
    try {
      await createMutation.mutateAsync({
        supplierId: data.supplierId,
        note: data.note || undefined,
        orderDate: data.orderDate || undefined,
        lineItems: data.lineItems.map((item) => ({
          itemId: item.itemId,
          qty: item.qty,
          unitPrice: item.unitPrice,
        })),
      });
      toast.success('Purchase Order created successfully as DRAFT');
      router.push('/purchasing/purchase-orders');
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Failed to create Purchase Order');
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <PurchaseOrderForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
        />
      </CardContent>
    </Card>
  );
}
