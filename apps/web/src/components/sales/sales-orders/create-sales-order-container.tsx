'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCreateSalesOrder } from '@web/hooks/use-sales-orders';
import { SalesOrderForm, SalesOrderFormValues } from './sales-order-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@web/components/ui/card';
import { toast } from 'sonner';
import { Button } from '@web/components/ui/button';
import { ChevronLeftIcon } from 'lucide-react';

export function CreateSalesOrderContainer() {
  const router = useRouter();
  const createMutation = useCreateSalesOrder();

  const handleSubmit = async (values: SalesOrderFormValues) => {
    try {
      const result = await createMutation.mutateAsync({
        customerId: values.customerId,
        warehouseId: values.warehouseId,
        note: values.note,
        orderDate: values.orderDate,
        lineItems: values.lineItems,
      });

      toast.success(`Sales Order ${result.number} created successfully`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create Sales Order';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.push('/sales/sales-orders')}
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Create Sales Order</h2>
          <p className="text-xs text-muted-foreground">Buat transaksi baru pemesanan penjualan barang.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Order Form</CardTitle>
          <CardDescription>
            Isi informasi umum dan item barang yang dipesan oleh customer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SalesOrderForm
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
