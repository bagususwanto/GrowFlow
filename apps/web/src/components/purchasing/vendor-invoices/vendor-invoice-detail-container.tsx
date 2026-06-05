'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useVendorInvoice, useReceiveVendorInvoice, useRecordVendorInvoicePayment, useCancelVendorInvoice } from '@web/hooks/use-vendor-invoices';
import { useGoodsReceipt } from '@web/hooks/use-goods-receipts';
import { usePurchaseOrder } from '@web/hooks/use-purchase-orders';
import { VendorInvoiceStatusBadge } from './status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { Skeleton } from '@web/components/ui/skeleton';
import { Separator } from '@web/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@web/components/ui/dialog';
import { Label } from '@web/components/ui/label';
import { Input } from '@web/components/ui/input';
import { Textarea } from '@web/components/ui/textarea';
import {
  ChevronLeftIcon,
  FileTextIcon,
  CalendarIcon,
  UserIcon,
  CreditCardIcon,
  ReceiptIcon,
  BanIcon,
  ArrowUpRightIcon,
} from 'lucide-react';
import { useConfirm } from '@web/hooks/use-confirm';
import { toast } from 'sonner';
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

export function VendorInvoiceDetailContainer() {
  const params = useParams();
  const id = params.id as string;
  const confirm = useConfirm();

  const { data: inv, isLoading, isError, error } = useVendorInvoice(id);
  useBreadcrumbLabel(id, inv?.number);

  // Load GR and PO to get line items and pricing
  const grId = inv?.goodsReceiptId || '';
  const poId = inv?.purchaseOrderId || '';
  const { data: gr } = useGoodsReceipt(grId);
  const { data: po } = usePurchaseOrder(poId);

  // Mutations
  const receiveMutation = useReceiveVendorInvoice();
  const paymentMutation = useRecordVendorInvoicePayment(id);
  const cancelMutation = useCancelVendorInvoice();

  // Modals state
  const [isReceiveOpen, setIsReceiveOpen] = React.useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false);

  // Form states
  const [invoiceDate, setInvoiceDate] = React.useState('');
  const [dueDate, setDueDate] = React.useState('');
  const [paymentAmount, setPaymentAmount] = React.useState('');
  const [paymentDate, setPaymentDate] = React.useState('');
  const [note, setNote] = React.useState('');

  const handleOpenReceive = () => {
    if (!inv) return;
    const today = new Date().toISOString().split('T')[0];
    setInvoiceDate(today);
    const due = new Date();
    due.setDate(due.getDate() + (inv.paymentTermsDays || 30));
    setDueDate(due.toISOString().split('T')[0]);
    setNote('');
    setIsReceiveOpen(true);
  };

  const handleOpenPayment = () => {
    if (!inv) return;
    const outstanding = inv.totalAmount - inv.paidAmount;
    setPaymentAmount(outstanding.toString());
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setNote('');
    setIsPaymentOpen(true);
  };

  const handleCancel = async () => {
    if (!inv) return;
    const ok = await confirm({
      title: 'Cancel Vendor Bill',
      description: (
        <>
          Are you sure you want to cancel bill <span className="font-bold">{inv.number}</span>? This action cannot be undone.
        </>
      ),
      confirmText: 'Cancel Bill',
      variant: 'destructive',
    });
    if (ok) {
      toast.promise(cancelMutation.mutateAsync(id), {
        loading: 'Cancelling bill...',
        success: 'Bill cancelled successfully',
        error: (err) => err?.message || 'Failed to cancel bill',
      });
    }
  };

  const submitReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inv) return;
    try {
      await receiveMutation.mutateAsync({
        id,
        data: { invoiceDate, dueDate, note: note || undefined },
      });
      toast.success('Bill marked as received and journal entries posted');
      setIsReceiveOpen(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to mark bill as received';
      toast.error(errorMsg);
    }
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inv) return;
    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }
    try {
      await paymentMutation.mutateAsync({
        amount: amountNum,
        paymentDate: paymentDate || undefined,
        note: note || undefined,
      });
      toast.success('Payment recorded successfully');
      setIsPaymentOpen(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to record payment';
      toast.error(errorMsg);
    }
  };

  if (isLoading) return <Skeleton className="w-full h-96" />;
  if (isError || !inv) {
    return (
      <div className="p-8 text-center text-destructive font-medium">
        {error instanceof Error ? error.message : 'Failed to load Vendor Invoice.'}
      </div>
    );
  }

  // Cross reference GR items with PO prices
  const invoiceItems = gr?.lineItems?.map((grLine) => {
    const poLine = po?.lineItems?.find((pl) => pl.itemId === grLine.itemId);
    const unitPrice = poLine ? Number(poLine.unitPrice) : 0;
    const qty = grLine.qty;
    const subtotal = qty * unitPrice;

    return {
      id: grLine.id,
      itemCode: grLine.item?.code || 'N/A',
      itemName: grLine.item?.name || 'Unknown Item',
      unit: grLine.item?.unit || 'pcs',
      qty,
      unitPrice,
      subtotal,
    };
  }) || [];

  const outstandingAmount = inv.totalAmount - inv.paidAmount;

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-start gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            nativeButton={false}
            render={
              <Link href="/purchasing/vendor-invoices" title="Back to Vendor Invoices">
                <ChevronLeftIcon className="h-4 w-4" />
              </Link>
            }
          />
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Vendor Bill Details
            </h1>
            <p className="text-sm text-muted-foreground">
              Review accounts payable, record supplier payments, and view journal ledger impact.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:self-center">
          {inv.status === 'DRAFT' && (
            <>
              <Button size="sm" onClick={handleOpenReceive} disabled={receiveMutation.isPending}>
                <ReceiptIcon className="w-4 h-4 mr-2" />
                Mark as Received
              </Button>
              <Button size="sm" variant="destructive" onClick={handleCancel} disabled={cancelMutation.isPending}>
                <BanIcon className="w-4 h-4 mr-2" />
                Cancel Bill
              </Button>
            </>
          )}
          {(inv.status === 'RECEIVED' || inv.status === 'PARTIAL') && (
            <Button size="sm" onClick={handleOpenPayment} disabled={paymentMutation.isPending}>
              <CreditCardIcon className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bill Items */}
          <Card className="shadow-xs border-border/40">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileTextIcon className="w-4 h-4 text-muted-foreground" />
                Line Items
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="border rounded-lg overflow-hidden border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 border-b border-border/60">
                    <tr className="text-xs text-muted-foreground font-semibold uppercase text-left">
                      <th className="p-3">Item</th>
                      <th className="p-3 text-right">Received Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {invoiceItems.length > 0 ? (
                      invoiceItems.map((item) => (
                        <tr key={item.id}>
                          <td className="p-3">
                            <div className="font-semibold">{item.itemName}</div>
                            <div className="text-xs text-muted-foreground font-mono">{item.itemCode}</div>
                          </td>
                          <td className="p-3 text-right">
                            {item.qty} {item.unit}
                          </td>
                          <td className="p-3 text-right">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.unitPrice)}
                          </td>
                          <td className="p-3 text-right font-semibold">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.subtotal)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-muted-foreground">
                          No items found (GR details loading).
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end gap-2 text-sm pr-2">
                <span className="text-muted-foreground font-medium">Total Bill:</span>
                <span className="font-bold text-foreground">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(inv.totalAmount)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payments History */}
          <Card className="shadow-xs border-border/40">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CreditCardIcon className="w-4 h-4 text-muted-foreground" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="border rounded-lg overflow-hidden border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 border-b border-border/60">
                    <tr className="text-xs text-muted-foreground font-semibold uppercase text-left">
                      <th className="p-3">Date</th>
                      <th className="p-3">Reference/Note</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {inv.payments && inv.payments.length > 0 ? (
                      inv.payments.map((p) => (
                        <tr key={p.id}>
                          <td className="p-3">
                            <div className="font-medium">{formatDate(p.paymentDate)}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <UserIcon className="w-3 h-3" /> Recorded by Staff
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground max-w-[200px] truncate">
                            {p.note || 'No memo'}
                          </td>
                          <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.amount)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-muted-foreground text-xs">
                          No payments have been recorded yet for this bill.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="shadow-xs border-border/40">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Bill Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Bill Number:</span>
                <span className="font-mono font-bold text-foreground text-right">{inv.number}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Status:</span>
                <VendorInvoiceStatusBadge status={inv.status} />
              </div>

              <Separator />

              <div>
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Supplier</div>
                <div className="font-bold text-foreground mt-1">{inv.supplier?.name}</div>
                <div className="text-xs text-muted-foreground font-mono mt-0.5">{inv.supplier?.code}</div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    Bill Date
                  </div>
                  <div className="font-semibold text-foreground mt-1">
                    {inv.invoiceDate ? formatDate(inv.invoiceDate) : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    Due Date
                  </div>
                  <div className="font-semibold text-foreground mt-1">
                    {inv.dueDate ? formatDate(inv.dueDate) : '-'}
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Payment terms: <span className="font-semibold">{inv.paymentTermsDays} Days</span>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium">Total Bill:</span>
                  <span className="font-semibold text-foreground">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(inv.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium">Paid Amount:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(inv.paidAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-dashed pt-2">
                  <span className="text-foreground font-bold text-xs uppercase">Outstanding:</span>
                  <span className={`text-base font-extrabold ${outstandingAmount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(outstandingAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xs border-border/40">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Document Links
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Goods Receipt:</span>
                {inv.goodsReceipt ? (
                  <Link
                    href={`/purchasing/goods-receipts/${inv.goodsReceiptId}`}
                    className="font-mono text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
                  >
                    {inv.goodsReceipt.number}
                    <ArrowUpRightIcon className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span className="text-muted-foreground text-xs font-mono">{inv.goodsReceiptId}</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Purchase Order:</span>
                {inv.purchaseOrder ? (
                  <Link
                    href={`/purchasing/purchase-orders/${inv.purchaseOrderId}`}
                    className="font-mono text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
                  >
                    {inv.purchaseOrder.number}
                    <ArrowUpRightIcon className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span className="text-muted-foreground text-xs font-mono">{inv.purchaseOrderId}</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mark as Received Modal */}
      <Dialog open={isReceiveOpen} onOpenChange={setIsReceiveOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mark Bill as Received</DialogTitle>
            <DialogDescription>
              Marking bill <span className="font-semibold">{inv.number}</span> as received will officially record the transaction in the ledger and post the appropriate accounting journals.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitReceive} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceDate">Invoice Date</Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  required
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Notes / Memo</Label>
              <Textarea
                id="note"
                placeholder="Optional description of this invoice..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsReceiveOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={receiveMutation.isPending}>
                {receiveMutation.isPending ? 'Confirming...' : 'Confirm Receipt'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Record Payment Modal */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record AP Payment</DialogTitle>
            <DialogDescription>
              Record cash disbursement to settle outstanding balance of bill <span className="font-semibold">{inv.number}</span>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitPayment} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount (IDR)</Label>
              <Input
                id="amount"
                type="number"
                required
                min="1"
                max={outstandingAmount}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>Total Bill: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(inv.totalAmount)}</span>
                <span>Outstanding: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(outstandingAmount)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Notes / Reference</Label>
              <Textarea
                id="note"
                placeholder="Payment reference, bank transfer ID, check number, etc."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsPaymentOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={paymentMutation.isPending}>
                {paymentMutation.isPending ? 'Recording...' : 'Record Payment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
