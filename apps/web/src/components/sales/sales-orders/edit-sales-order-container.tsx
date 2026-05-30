'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSalesOrder, useUpdateSalesOrder } from '@web/hooks/use-sales-orders';
import { SalesOrderForm, SalesOrderFormValues } from './sales-order-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@web/components/ui/card';
import { Skeleton } from '@web/components/ui/skeleton';
import { toast } from 'sonner';
import { Button } from '@web/components/ui/button';
import { ChevronLeftIcon } from 'lucide-react';

export function EditSalesOrderContainer() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: so, isLoading, isError, error } = useSalesOrder(id);
  const updateMutation = useUpdateSalesOrder(id);

  const handleSubmit = async (values: SalesOrderFormValues) => {
    try {
      await updateMutation.mutateAsync({
        customerId: values.customerId,
        warehouseId: values.warehouseId,
        note: values.note || undefined,
        orderDate: values.orderDate || undefined,
        lineItems: values.lineItems.map((item) => ({
          itemId: item.itemId,
          qty: item.qty,
          unitPrice: item.unitPrice,
        })),
      });
      toast.success('Sales Order updated successfully');
      router.push(`/sales/sales-orders/${id}`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update Sales Order';
      toast.error(errorMsg);
    }
  };

  if (isLoading) {
    return <Skeleton className="w-full h-96" />;
  }

  if (isError || !so) {
    return (
      <div className="p-8 text-center text-destructive font-medium">
        {error instanceof Error ? error.message : 'Failed to load Sales Order details.'}
      </div>
    );
  }

  if (so.status !== 'DRAFT') {
    return (
      <div className="p-8 text-center text-warning font-medium">
        Hanya Sales Order berstatus DRAFT yang dapat diedit. Status saat ini: <span className="font-bold">{so.status}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.push(`/sales/sales-orders/${id}`)}
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Edit Sales Order</h2>
          <p className="text-xs text-muted-foreground">Ubah draf transaksi pemesanan penjualan barang.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Sales Order Form</CardTitle>
          <CardDescription>
            Ubah informasi umum dan item barang untuk SO draft ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SalesOrderForm
            initialData={so}
            onSubmit={handleSubmit}
            isSubmitting={updateMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
