'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usePurchaseOrder, useSubmitPurchaseOrder, useApprovePurchaseOrder, useCancelPurchaseOrder } from '@web/hooks/use-purchase-orders';
import { PurchaseOrderStatusBadge } from './status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { Skeleton } from '@web/components/ui/skeleton';
import { Separator } from '@web/components/ui/separator';
import { toast } from 'sonner';
import { useConfirm } from '@web/hooks/use-confirm';
import { useAuthStore } from '@web/stores/auth.store';
import { FileTextIcon, SendIcon, CheckSquareIcon, XCircleIcon, ShoppingBagIcon, EditIcon, ChevronLeftIcon } from 'lucide-react';
import { useBreadcrumbLabel } from '@web/hooks/use-breadcrumb-label';

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

export function PurchaseOrderDetailContainer() {
  const params = useParams();
  const id = params.id as string;
  const confirm = useConfirm();
  const user = useAuthStore((state) => state.user);

  const { data: po, isLoading, isError, error } = usePurchaseOrder(id);
  const submitMutation = useSubmitPurchaseOrder();
  const approveMutation = useApprovePurchaseOrder();
  const cancelMutation = useCancelPurchaseOrder();

  useBreadcrumbLabel(id, po?.number);

  const handleSubmit = async () => {
    const ok = await confirm({
      title: 'Submit Purchase Order',
      description: (
        <>
          Submit <span className="font-bold">{po?.number}</span>? This will forward the document to manager review.
        </>
      ),
      confirmText: 'Submit PO',
    });
    if (ok) {
      toast.promise(submitMutation.mutateAsync(id), {
        loading: 'Submitting Purchase Order...',
        success: 'Purchase Order submitted successfully',
        error: 'Failed to submit PO',
      });
    }
  };

  const handleApprove = async () => {
    const ok = await confirm({
      title: 'Approve Purchase Order',
      description: (
        <>
          Approve <span className="font-bold">{po?.number}</span>? Items will be eligible for GRN receipt.
        </>
      ),
      confirmText: 'Approve PO',
    });
    if (ok) {
      toast.promise(approveMutation.mutateAsync(id), {
        loading: 'Approving Purchase Order...',
        success: 'Purchase Order approved successfully',
        error: 'Failed to approve PO',
      });
    }
  };

  const handleCancel = async () => {
    const ok = await confirm({
      title: 'Cancel Purchase Order',
      description: (
        <>
          Are you sure you want to cancel <span className="font-bold">{po?.number}</span>? This action cannot be reversed.
        </>
      ),
      confirmText: 'Cancel PO',
      variant: 'destructive',
    });
    if (ok) {
      toast.promise(cancelMutation.mutateAsync(id), {
        loading: 'Cancelling Purchase Order...',
        success: 'Purchase Order cancelled',
        error: 'Failed to cancel PO',
      });
    }
  };

  if (isLoading) return <Skeleton className="w-full h-96" />;
  if (isError || !po) {
    return (
      <div className="p-8 text-center text-destructive font-medium">
        {error instanceof Error ? error.message : 'Failed to load Purchase Order.'}
      </div>
    );
  }

  const isDraft = po.status === 'DRAFT';
  const isSubmitted = po.status === 'SUBMITTED';
  const isApproved = po.status === 'APPROVED';
  const isPartial = po.status === 'PARTIAL';
  
  const isManagerOrAdmin = user?.role === 'superadmin' || user?.role === 'manager';
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
              <Link href="/purchasing/purchase-orders" title="Back to Purchase Orders">
                <ChevronLeftIcon className="h-4 w-4" />
              </Link>
            }
          />
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Purchase Order Details
            </h1>
            <p className="text-sm text-muted-foreground">
              Track lifecycle progress and actions for this purchase order.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:self-center">
          {isDraft && (
            <>
              <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/purchasing/purchase-orders/${id}/edit`}><EditIcon className="w-4 h-4 mr-2" />Edit Draft</Link>} />
              <Button size="sm" onClick={handleSubmit} disabled={submitMutation.isPending}>
                <SendIcon className="w-4 h-4 mr-2" />Submit PO
              </Button>
            </>
          )}

          {isSubmitted && isManagerOrAdmin && (
            <Button size="sm" onClick={handleApprove} disabled={approveMutation.isPending} className="bg-primary hover:bg-primary/90">
              <CheckSquareIcon className="w-4 h-4 mr-2" />Approve PO
            </Button>
          )}

          {(isApproved || isPartial) && isWarehouseOrAdmin && (
            <Button size="sm" nativeButton={false} render={<Link href={`/purchasing/goods-receipts/new?poId=${id}`}><ShoppingBagIcon className="w-4 h-4 mr-2" />Receive Items (GRN)</Link>} />
          )}

          {!['CANCELLED', 'DONE', 'PARTIAL'].includes(po.status) && isManagerOrAdmin && (
            <Button variant="destructive" size="sm" onClick={handleCancel} disabled={cancelMutation.isPending}>
              <XCircleIcon className="w-4 h-4 mr-2" />Cancel PO
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
                {po.number}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Created on {formatDate(po.createdAt, true)}</p>
            </div>
            <PurchaseOrderStatusBadge status={po.status} className="text-xs py-1 px-3" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr className="text-xs text-muted-foreground font-semibold uppercase text-left">
                    <th className="p-3">Item</th>
                    <th className="p-3 text-right">Order Qty</th>
                    <th className="p-3 text-right">Received Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {po.lineItems?.map((li) => (
                    <tr key={li.id}>
                      <td className="p-3">
                        <div className="font-semibold">{li.item?.name || 'Unknown Item'}</div>
                        <div className="text-xs text-muted-foreground font-mono">{li.item?.code}</div>
                      </td>
                      <td className="p-3 text-right font-medium">{li.qty} {li.item?.unit}</td>
                      <td className="p-3 text-right font-medium text-primary">{li.qtyReceived} {li.item?.unit}</td>
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
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(po.totalAmount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metadata Sidebar */}
        <Card className="h-fit">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Document Info</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Supplier</div>
              <div className="font-bold text-foreground mt-1">{po.supplier?.name}</div>
              <div className="text-xs text-muted-foreground font-mono">{po.supplier?.code}</div>
            </div>

            <Separator />

            <div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Order Date</div>
              <div className="font-semibold text-foreground mt-1">{formatDate(po.orderDate)}</div>
            </div>

            <Separator />

            <div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Created By</div>
              <div className="font-semibold text-foreground mt-1">{po.createdBy?.name || po.createdById || '-'}</div>
            </div>

            {po.approvedBy && (
              <>
                <Separator />
                <div>
                  <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Approved By</div>
                  <div className="font-semibold text-foreground mt-1">{po.approvedBy.name}</div>
                  <div className="text-xs text-muted-foreground">on {po.approvedAt ? formatDate(po.approvedAt, true) : '-'}</div>
                </div>
              </>
            )}

            {po.cancelledAt && (
              <>
                <Separator />
                <div>
                  <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider text-destructive">Cancelled Date</div>
                  <div className="font-semibold text-destructive mt-1">{formatDate(po.cancelledAt, true)}</div>
                </div>
              </>
            )}

            {po.note && (
              <>
                <Separator />
                <div>
                  <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Notes / Terms</div>
                  <div className="mt-1 p-2 bg-muted rounded text-xs leading-relaxed text-muted-foreground">{po.note}</div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
