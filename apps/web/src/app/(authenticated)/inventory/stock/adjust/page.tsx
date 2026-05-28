'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@web/components/ui/card';
import { StockAdjustForm } from '@web/components/stock/stock-adjust-form';
import { useAdjustStock } from '@web/components/stock/use-stock';
import { toast } from 'sonner';
import { Button } from '@web/components/ui/button';
import { ChevronLeftIcon } from 'lucide-react';
import Link from 'next/link';

export default function StockAdjustPage() {
  const router = useRouter();
  const adjustStockMutation = useAdjustStock();

  const handleAdjustSubmit = async (data: {
    itemId: string;
    warehouseId: string;
    qty: number;
    note?: string;
  }) => {
    toast.promise(adjustStockMutation.mutateAsync(data), {
      loading: 'Submitting stock adjustment...',
      success: () => {
        router.push('/inventory/stock');
        return 'Stock adjusted successfully';
      },
      error: (err) => {
        return err instanceof Error ? err.message : 'Failed to adjust stock';
      },
    });
  };

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          nativeButton={false}
          render={
            <Link href="/inventory/stock" title="Back to Stock">
              <ChevronLeftIcon className="h-4 w-4" />
            </Link>
          }
        />
        <div className="space-y-0.5">
          <h1 className="font-bold text-foreground text-2xl tracking-tight">
            Manual Stock Adjustment
          </h1>
          <p className="text-muted-foreground text-xs">
            Manually increase or decrease the inventory levels of a specific item in a warehouse.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adjust Stock Form</CardTitle>
          <CardDescription>
            Use this form only for corrections, disposals, or direct manual updates. For purchases
            or sales, please use proper documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StockAdjustForm
            onSubmit={handleAdjustSubmit}
            isSubmitting={adjustStockMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
