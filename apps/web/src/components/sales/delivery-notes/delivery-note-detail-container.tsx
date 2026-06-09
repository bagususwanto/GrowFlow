'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useDeliveryNote, useConfirmDeliveryNote } from '@web/hooks/use-delivery-notes';
import { Card, CardContent, CardHeader, CardTitle } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { Skeleton } from '@web/components/ui/skeleton';
import { Separator } from '@web/components/ui/separator';
import { ChevronLeftIcon, FileTextIcon, WarehouseIcon, CalendarIcon, UserIcon, CheckSquareIcon } from 'lucide-react';
import { Badge } from '@web/components/ui/badge';
import { useConfirm } from '@web/hooks/use-confirm';
import { toast } from 'sonner';
import { useBreadcrumbLabel } from '@web/hooks/use-breadcrumb-label';

function formatDate(dateStr: string, includeTime = false) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
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

export function DeliveryNoteDetailContainer() {
  const params = useParams();
  const id = params.id as string;

  const confirm = useConfirm();
  const confirmMutation = useConfirmDeliveryNote();
  const { data: dn, isLoading, isError, error } = useDeliveryNote(id);

  useBreadcrumbLabel(id, dn?.number);

  const handleConfirm = async () => {
    const ok = await confirm({
      title: 'Confirm Goods Delivery',
      description: (
        <>
          Confirm <span className="font-bold">{dn?.number}</span>? This action will deduct the physical stock balance in the source warehouse.
        </>
      ),
      confirmText: 'Confirm Delivery',
    });
    if (ok) {
      toast.promise(confirmMutation.mutateAsync(id), {
        loading: 'Confirming Delivery Note...',
        success: 'Delivery Note confirmed successfully. Warehouse stock updated.',
        error: (err) => err?.message || 'Failed to confirm DN',
      });
    }
  };

  if (isLoading) return <Skeleton className="w-full h-96" />;
  if (isError || !dn) {
    return (
      <div className="p-8 text-center text-destructive font-medium">
        {error instanceof Error ? error.message : 'Failed to load Delivery Note.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header aligned with actions */}
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-start gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            nativeButton={false}
            render={
              <Link href="/logistics/delivery-notes" title="Back to Delivery Notes">
                <ChevronLeftIcon className="h-4 w-4" />
              </Link>
            }
          />
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Delivery Note Details
            </h1>
            <p className="text-sm text-muted-foreground">
              Track item dispatch progress and manage inventory fulfillment.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:self-center">
          {dn.status === 'DRAFT' && (
            <Button size="sm" onClick={handleConfirm} disabled={confirmMutation.isPending}>
              <CheckSquareIcon className="w-4 h-4 mr-2" />Confirm Delivery
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
                {dn.number}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Created on {formatDate(dn.createdAt, true)}</p>
            </div>
            <Badge variant={dn.status === 'CONFIRMED' ? 'default' : 'secondary'} className="capitalize text-xs py-1 px-3">
              {dn.status.toLowerCase()}
            </Badge>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr className="text-xs text-muted-foreground font-semibold uppercase text-left">
                    <th className="p-3">Item</th>
                    <th className="p-3 text-right">Qty Delivered</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {dn.lineItems?.map((li) => (
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
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Delivery Info</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Source SO Reference</div>
              <div className="font-bold text-foreground mt-1 font-mono hover:underline">
                <Link href={`/sales/sales-orders/${dn.salesOrderId}`}>
                  {dn.salesOrder?.number || dn.salesOrderId}
                </Link>
              </div>
            </div>

            <Separator />

            <div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Customer</div>
              <div className="font-bold text-foreground mt-1">{dn.salesOrder?.customer?.name}</div>
            </div>

            <Separator />

            <div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1">
                <WarehouseIcon className="w-3.5 h-3.5" />
                Source Warehouse
              </div>
              <div className="font-bold text-foreground mt-1">{dn.salesOrder?.warehouse?.name}</div>
            </div>

            <Separator />

            <div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                Delivery Date
              </div>
              <div className="font-semibold text-foreground mt-1">{formatDate(dn.deliveryDate)}</div>
            </div>

            <Separator />

            <div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1">
                <UserIcon className="w-3.5 h-3.5" />
                Delivery Staff
              </div>
              <div className="font-semibold text-foreground mt-1">{dn.createdBy?.name || dn.createdById || '-'}</div>
            </div>

            {dn.note && (
              <>
                <Separator />
                <div>
                  <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Notes</div>
                  <div className="mt-1 p-2 bg-muted rounded text-xs leading-relaxed text-muted-foreground">{dn.note}</div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
