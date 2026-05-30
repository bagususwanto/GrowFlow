'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useGoodsReceipt, useConfirmGoodsReceipt } from '@web/hooks/use-goods-receipts';
import { GoodsReceiptStatusBadge } from './status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { Skeleton } from '@web/components/ui/skeleton';
import { Separator } from '@web/components/ui/separator';
import { toast } from 'sonner';
import { useConfirm } from '@web/hooks/use-confirm';
import { useAuthStore } from '@web/stores/auth.store';
import { ArrowLeftIcon, FileTextIcon, CheckCircleIcon, WarehouseIcon, CalendarIcon, UserIcon } from 'lucide-react';

function formatDate(dateStr: string, includeTime = false) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: includeTime ? '2-digit' : undefined,
      minute: includeTime ? '2-digit' : undefined,
    });
  } catch {
    return dateStr;
  }
}

export function GoodsReceiptDetailContainer() {
  const params = useParams();
  const id = params.id as string;
  const confirm = useConfirm();
  const user = useAuthStore((state) => state.user);

  const { data: gr, isLoading, isError, error } = useGoodsReceipt(id);
  const confirmMutation = useConfirmGoodsReceipt();

  const handleConfirm = async () => {
    const ok = await confirm({
      title: 'Confirm Goods Receipt',
      description: `Confirm GRN ${gr?.number}? Doing this will update stock balances for received items immediately.`,
      confirmText: 'Confirm Receipt',
    });
    if (ok) {
      toast.promise(confirmMutation.mutateAsync(id), {
        loading: 'Confirming Goods Receipt...',
        success: 'Goods Receipt confirmed. Stock updated.',
        error: 'Failed to confirm receipt',
      });
    }
  };

  if (isLoading) return <Skeleton className="w-full h-96" />;
  if (isError || !gr) {
    return (
      <div className="p-8 text-center text-destructive font-medium">
        {error instanceof Error ? error.message : 'Failed to load Goods Receipt.'}
      </div>
    );
  }

  const isDraft = gr.status === 'DRAFT';
  const isWarehouseOrAdmin = user?.role === 'superadmin' || user?.role === 'manager' || user?.role === 'warehouse';

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <Button variant="ghost" size="sm" className="w-fit" render={<Link href="/purchasing/goods-receipts"><ArrowLeftIcon className="w-4 h-4 mr-2" />Back to List</Link>} />
        
        <div className="flex flex-wrap items-center gap-2">
          {isDraft && isWarehouseOrAdmin && (
            <Button size="sm" onClick={handleConfirm} disabled={confirmMutation.isPending} className="bg-primary hover:bg-primary/90">
              <CheckCircleIcon className="w-4 h-4 mr-2" />Confirm Receipt
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <FileTextIcon className="w-5 h-5 text-muted-foreground" />
                {gr.number}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Created on {formatDate(gr.createdAt, true)}</p>
            </div>
            <GoodsReceiptStatusBadge status={gr.status} className="text-xs py-1 px-3" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr className="text-xs text-muted-foreground font-semibold uppercase text-left">
                    <th className="p-3">Item</th>
                    <th className="p-3 text-right">Received Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {gr.lineItems?.map((li) => (
                    <tr key={li.id}>
                      <td className="p-3">
                        <div className="font-semibold">{li.item?.name || 'Unknown Item'}</div>
                        <div className="text-xs text-muted-foreground font-mono">{li.item?.code}</div>
                      </td>
                      <td className="p-3 text-right font-bold text-primary">{li.qty} {li.item?.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Metadata Sidebar */}
        <Card className="h-fit">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Receipt Info</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Source PO Reference</div>
              <div className="font-bold text-foreground mt-1 font-mono hover:underline">
                <Link href={`/purchasing/purchase-orders/${gr.purchaseOrderId}`}>
                  {gr.purchaseOrder?.number || gr.purchaseOrderId}
                </Link>
              </div>
            </div>

            <Separator />

            <div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1">
                <WarehouseIcon className="w-3.5 h-3.5" />
                Target Warehouse
              </div>
              <div className="font-bold text-foreground mt-1">{gr.warehouse?.name}</div>
            </div>

            <Separator />

            <div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                Received Date
              </div>
              <div className="font-semibold text-foreground mt-1">{formatDate(gr.receivedDate)}</div>
            </div>

            <Separator />

            <div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1">
                <UserIcon className="w-3.5 h-3.5" />
                Receiver Staff
              </div>
              <div className="font-semibold text-foreground mt-1">{gr.createdBy?.name || gr.createdById || '-'}</div>
            </div>

            {gr.note && (
              <>
                <Separator />
                <div>
                  <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Notes</div>
                  <div className="mt-1 p-2 bg-muted rounded text-xs leading-relaxed text-muted-foreground">{gr.note}</div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
