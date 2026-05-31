'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSalesOrder, useConfirmSalesOrder, useCancelSalesOrder } from '@web/hooks/use-sales-orders';
import { SalesOrderStatusBadge } from './status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { Skeleton } from '@web/components/ui/skeleton';
import { Separator } from '@web/components/ui/separator';
import { toast } from 'sonner';
import { useConfirm } from '@web/hooks/use-confirm';
import { useAuthStore } from '@web/stores/auth.store';
import { ChevronLeftIcon, FileTextIcon, CheckSquareIcon, XCircleIcon, TruckIcon, EditIcon } from 'lucide-react';
import { Badge } from '@web/components/ui/badge';

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

export function SalesOrderDetailContainer() {
  const params = useParams();
  const id = params.id as string;
  const confirm = useConfirm();
  const user = useAuthStore((state) => state.user);

  const { data: so, isLoading, isError, error } = useSalesOrder(id);
  const confirmMutation = useConfirmSalesOrder();
  const cancelMutation = useCancelSalesOrder();

  const handleConfirm = async () => {
    const ok = await confirm({
      title: 'Confirm Sales Order',
      description: `Confirm SO ${so?.number}? This will validate the available stock in warehouse ${so?.warehouse?.name} and reserve that stock.`,
      confirmText: 'Confirm SO',
    });
    if (ok) {
      toast.promise(confirmMutation.mutateAsync(id), {
        loading: 'Confirming Sales Order...',
        success: 'Sales Order confirmed successfully',
        error: (err) => err?.response?.data?.message || 'Failed to confirm SO',
      });
    }
  };

  const handleCancel = async () => {
    const ok = await confirm({
      title: 'Cancel Sales Order',
      description: `Are you sure you want to cancel SO ${so?.number}? This action cannot be reversed.`,
      confirmText: 'Cancel SO',
      variant: 'destructive',
    });
    if (ok) {
      toast.promise(cancelMutation.mutateAsync(id), {
        loading: 'Cancelling Sales Order...',
        success: 'Sales Order cancelled',
        error: (err) => err?.response?.data?.message || 'Failed to cancel SO',
      });
    }
  };

  if (isLoading) return <Skeleton className="w-full h-96" />;
  if (isError || !so) {
    return (
      <div className="p-8 text-center text-destructive font-medium">
        {error instanceof Error ? error.message : 'Failed to load Sales Order.'}
      </div>
    );
  }

  const isDraft = so.status === 'DRAFT';
  const isConfirmed = so.status === 'CONFIRMED';
  const isPartial = so.status === 'PARTIAL';

  const isSalesStaffOrAdmin = user?.role === 'superadmin' || user?.role === 'manager' || user?.role === 'staff';
  const isWarehouseOrAdmin = user?.role === 'superadmin' || user?.role === 'manager' || user?.role === 'warehouse';

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
              <Link href="/sales/sales-orders" title="Back to Sales Orders">
                <ChevronLeftIcon className="h-4 w-4" />
              </Link>
            }
          />
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Sales Order Details
            </h1>
            <p className="text-sm text-muted-foreground">
              Track lifecycle progress and actions for this sales order.
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:self-center">
          {isDraft && isSalesStaffOrAdmin && (
            <>
              <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/sales/sales-orders/${id}/edit`}><EditIcon className="w-4 h-4 mr-2" />Edit Draft</Link>} />
              <Button size="sm" onClick={handleConfirm} disabled={confirmMutation.isPending}>
                <CheckSquareIcon className="w-4 h-4 mr-2" />Confirm SO
              </Button>
            </>
          )}

          {(isConfirmed || isPartial) && isWarehouseOrAdmin && (
            <Button size="sm" nativeButton={false} render={<Link href={`/sales/delivery-notes/new?soId=${id}`}><TruckIcon className="w-4 h-4 mr-2" />Ship Goods (DN)</Link>} />
          )}

          {!['CANCELLED', 'DONE', 'PARTIAL'].includes(so.status) && isSalesStaffOrAdmin && (
            <Button variant="destructive" size="sm" onClick={handleCancel} disabled={cancelMutation.isPending}>
              <XCircleIcon className="w-4 h-4 mr-2" />Cancel SO
            </Button>
          )}
        </div>
      </div>


      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <FileTextIcon className="w-5 h-5 text-muted-foreground" />
                  {so.number}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Created on {formatDate(so.createdAt, true)}</p>
              </div>
              <SalesOrderStatusBadge status={so.status} className="text-xs py-1 px-3" />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr className="text-xs text-muted-foreground font-semibold uppercase text-left">
                      <th className="p-3">Item</th>
                      <th className="p-3 text-right">Order Qty</th>
                      <th className="p-3 text-right">Delivered Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {so.lineItems?.map((li) => (
                      <tr key={li.id}>
                        <td className="p-3">
                          <div className="font-semibold">{li.item?.name || 'Unknown Item'}</div>
                          <div className="text-xs text-muted-foreground font-mono">{li.item?.code}</div>
                        </td>
                        <td className="p-3 text-right font-medium">{li.qty} {li.item?.unit}</td>
                        <td className="p-3 text-right font-medium text-primary">{li.qtyDelivered} {li.item?.unit}</td>
                        <td className="p-3 text-right">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(li.unitPrice)}
                        </td>
                        <td className="p-3 text-right font-semibold">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(li.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col items-end gap-2 mt-6 pr-4">
                <div className="flex items-center gap-12">
                  <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Grand Total</span>
                  <span className="text-lg text-foreground font-bold">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(so.totalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Notes List */}
          <Card>
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TruckIcon className="w-4 h-4 text-muted-foreground" />
                Delivery Notes (Shipment)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {so.deliveryNotes && so.deliveryNotes.length > 0 ? (
                <div className="border rounded-lg divide-y text-sm">
                  {so.deliveryNotes.map((dn: { id: string; number: string; deliveryDate: string; createdBy?: { name: string }; status: string }) => (
                    <div key={dn.id} className="flex justify-between items-center p-3 hover:bg-muted/30">
                      <div>
                        <Link href={`/sales/delivery-notes/${dn.id}`} className="font-mono text-primary hover:underline font-semibold">
                          {dn.number}
                        </Link>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Ship Date: {formatDate(dn.deliveryDate)} | By: {dn.createdBy?.name || '-'}
                        </div>
                      </div>
                      <Badge variant={dn.status === 'CONFIRMED' ? 'default' : 'secondary'} className="capitalize">
                        {dn.status.toLowerCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No delivery documents (Delivery Notes) found for this SO.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Metadata Sidebar */}
        <Card className="h-fit">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Document Info</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Customer</div>
              <div className="font-bold text-foreground mt-1">{so.customer?.name}</div>
              <div className="text-xs text-muted-foreground font-mono">{so.customer?.code}</div>
            </div>

            <Separator />

            <div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Source Warehouse</div>
              <div className="font-semibold text-foreground mt-1">{so.warehouse?.name}</div>
            </div>

            <Separator />

            <div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Order Date</div>
              <div className="font-semibold text-foreground mt-1">{formatDate(so.orderDate)}</div>
            </div>

            <Separator />

            <div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Created By (Sales Staff)</div>
              <div className="font-semibold text-foreground mt-1">{so.createdBy?.name || so.createdById || '-'}</div>
            </div>

            {so.confirmedBy && (
              <>
                <Separator />
                <div>
                  <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Confirmed By</div>
                  <div className="font-semibold text-foreground mt-1">{so.confirmedBy.name}</div>
                  <div className="text-xs text-muted-foreground">on {so.confirmedAt ? formatDate(so.confirmedAt, true) : '-'}</div>
                </div>
              </>
            )}

            {so.cancelledAt && (
              <>
                <Separator />
                <div>
                  <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider text-destructive">Cancelled Date</div>
                  <div className="font-semibold text-destructive mt-1">{formatDate(so.cancelledAt, true)}</div>
                </div>
              </>
            )}

            {so.note && (
              <>
                <Separator />
                <div>
                  <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Notes</div>
                  <div className="mt-1 p-2 bg-muted rounded text-xs leading-relaxed text-muted-foreground">{so.note}</div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
