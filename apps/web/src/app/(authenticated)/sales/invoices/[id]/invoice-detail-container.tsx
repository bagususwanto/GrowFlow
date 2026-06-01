'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  useSalesInvoice,
  useSendSalesInvoice,
  useRecordInvoicePayment,
  useCreateInvoiceCreditNote,
  useCancelSalesInvoice,
} from '@web/hooks/use-sales-invoices';
import { SalesInvoiceStatusBadge } from '@web/components/sales/sales-orders/invoice-status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { Separator } from '@web/components/ui/separator';
import { Skeleton } from '@web/components/ui/skeleton';
import { toast } from 'sonner';
import { useConfirm } from '@web/hooks/use-confirm';
import { useAuthStore } from '@web/stores/auth.store';
import { RecordPaymentModal } from '@web/components/sales/sales-orders/record-payment-modal';
import { CreateCreditNoteModal } from '@web/components/sales/sales-orders/create-credit-note-modal';
import {
  ChevronLeftIcon,
  ReceiptTextIcon,
  SendIcon,
  DownloadIcon,
  DollarSignIcon,
  FileMinusIcon,
  XCircleIcon,
  HistoryIcon,
} from 'lucide-react';
import { useBreadcrumbLabel } from '@web/hooks/use-breadcrumb-label';
import { SalesCreditNote, SalesInvoicePayment } from '@growflow/types';

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

function formatCurrency(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
}

export function SalesInvoiceDetailContainer() {
  const params = useParams();
  const id = params.id as string;
  const confirm = useConfirm();
  const currentUser = useAuthStore((state) => state.user);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCreditNoteModalOpen, setIsCreditNoteModalOpen] = useState(false);

  const { data: invoice, isLoading, isError, error } = useSalesInvoice(id);
  const sendMutation = useSendSalesInvoice();
  const paymentMutation = useRecordInvoicePayment(id);
  const creditNoteMutation = useCreateInvoiceCreditNote(id);
  const cancelMutation = useCancelSalesInvoice();

  useBreadcrumbLabel(id, invoice?.number);

  const handleSend = async () => {
    const ok = await confirm({
      title: 'Send Invoice',
      description: `Apakah Anda yakin ingin mengirim invoice ${invoice?.number} ke customer? Ini akan mengubah status ke SENT.`,
      confirmText: 'Send Invoice',
    });
    if (ok) {
      toast.promise(sendMutation.mutateAsync(id), {
        loading: 'Sending invoice...',
        success: 'Invoice sent successfully',
        error: (err) => err?.message || 'Failed to send invoice',
      });
    }
  };

  const handleRecordPayment = async (data: { amount: number; paymentDate?: string; note?: string }) => {
    toast.promise(paymentMutation.mutateAsync(data), {
      loading: 'Recording payment...',
      success: () => {
        setIsPaymentModalOpen(false);
        return 'Payment recorded successfully';
      },
      error: (err) => err?.message || 'Failed to record payment',
    });
  };

  const handleCreateCreditNote = async (data: { amount: number; reason: string; note?: string }) => {
    toast.promise(creditNoteMutation.mutateAsync(data), {
      loading: 'Applying Credit Note...',
      success: () => {
        setIsCreditNoteModalOpen(false);
        return 'Credit Note applied successfully';
      },
      error: (err) => err?.message || 'Failed to apply Credit Note',
    });
  };

  const handleCancel = async () => {
    const ok = await confirm({
      title: 'Cancel Invoice',
      description: `Apakah Anda yakin ingin membatalkan invoice ${invoice?.number}? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Cancel Invoice',
      variant: 'destructive',
    });
    if (ok) {
      toast.promise(cancelMutation.mutateAsync(id), {
        loading: 'Cancelling invoice...',
        success: 'Invoice cancelled',
        error: (err) => err?.message || 'Failed to cancel invoice',
      });
    }
  };

  const handleDownloadPdf = () => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    window.open(`${apiBaseUrl}/sales-invoices/${id}/pdf`, '_blank');
  };

  if (isLoading) return <Skeleton className="w-full h-96" />;
  if (isError || !invoice) {
    return (
      <div className="p-8 text-center text-destructive font-medium">
        {error instanceof Error ? error.message : 'Failed to load invoice.'}
      </div>
    );
  }

  const isDraft = invoice.status === 'DRAFT';
  const isSent = invoice.status === 'SENT';
  const isPartial = invoice.status === 'PARTIAL';
  const isPaid = invoice.status === 'PAID';
  const isCancelled = invoice.status === 'CANCELLED';

  const outstanding = Number(invoice.totalAmount) - Number(invoice.paidAmount);

  const appliedCreditNotesSum = invoice.creditNotes
    ?.filter((cn: SalesCreditNote) => cn.status === 'APPLIED')
    ?.reduce((sum: number, cn: SalesCreditNote) => sum + Number(cn.amount), 0) ?? 0;

  const currentOutstanding = outstanding - appliedCreditNotesSum;

  const isFinanceOrAdmin = currentUser?.role === 'superadmin' || currentUser?.role === 'manager' || currentUser?.role === 'finance';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-start gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            nativeButton={false}
            render={
              <Link href="/sales/invoices" title="Back to Invoices">
                <ChevronLeftIcon className="h-4 w-4" />
              </Link>
            }
          />
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Invoice Details
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitor billing items, payment logs, and print statements.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:self-center">
          {!isDraft && !isCancelled && (
            <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
              <DownloadIcon className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          )}

          {isDraft && isFinanceOrAdmin && (
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={handleSend} disabled={sendMutation.isPending}>
              <SendIcon className="w-4 h-4 mr-2" />
              Send Invoice
            </Button>
          )}

          {(isSent || isPartial) && isFinanceOrAdmin && (
            <>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white" onClick={() => setIsPaymentModalOpen(true)}>
                <DollarSignIcon className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsCreditNoteModalOpen(true)}>
                <FileMinusIcon className="w-4 h-4 mr-2" />
                Apply Credit Note
              </Button>
            </>
          )}

          {!isPaid && !isCancelled && Number(invoice.paidAmount) === 0 && isFinanceOrAdmin && (
            <Button variant="destructive" size="sm" onClick={handleCancel} disabled={cancelMutation.isPending}>
              <XCircleIcon className="w-4 h-4 mr-2" />
              Cancel Invoice
            </Button>
          )}
        </div>
      </div>

      {/* Grid details */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Invoice items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <ReceiptTextIcon className="w-5 h-5 text-muted-foreground" />
                  {invoice.number}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Created on {formatDate(invoice.createdAt, true)}</p>
              </div>
              <SalesInvoiceStatusBadge status={invoice.status} className="text-xs py-1 px-3" />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr className="text-xs text-muted-foreground font-semibold uppercase text-left">
                      <th className="p-3">Item</th>
                      <th className="p-3 text-right">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoice.lineItems?.map((li) => (
                      <tr key={li.id}>
                        <td className="p-3">
                          <div className="font-semibold">{li.item?.name || 'Unknown Item'}</div>
                          <div className="text-xs text-muted-foreground font-mono">{li.item?.code}</div>
                        </td>
                        <td className="p-3 text-right font-medium">{li.qty} {li.item?.unit}</td>
                        <td className="p-3 text-right">
                          {formatCurrency(li.unitPrice)}
                        </td>
                        <td className="p-3 text-right font-semibold">
                          {formatCurrency(li.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Outstanding calculation */}
              <div className="flex flex-col items-end gap-2 mt-6 pr-4">
                <div className="flex items-center gap-12 text-sm">
                  <span className="text-muted-foreground">Total Nilai Faktur:</span>
                  <span className="font-semibold">{formatCurrency(invoice.totalAmount)}</span>
                </div>
                <div className="flex items-center gap-12 text-sm">
                  <span className="text-muted-foreground">Sudah Dibayar:</span>
                  <span className="font-semibold text-emerald-500">{formatCurrency(invoice.paidAmount)}</span>
                </div>
                {appliedCreditNotesSum > 0 && (
                  <div className="flex items-center gap-12 text-sm">
                    <span className="text-muted-foreground">Kredit Note Diberikan:</span>
                    <span className="font-semibold text-rose-500">-{formatCurrency(appliedCreditNotesSum)}</span>
                  </div>
                )}
                <Separator className="w-64 my-1" />
                <div className="flex items-center gap-12">
                  <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Sisa Tagihan</span>
                  <span className={`text-lg font-bold ${currentOutstanding > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {formatCurrency(currentOutstanding)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment & Credit Notes History */}
          <Card>
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <HistoryIcon className="w-4 h-4 text-muted-foreground" />
                History & Transaction Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              {/* Payment Logs */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Customer Payments</h4>
                {invoice.payments && invoice.payments.length > 0 ? (
                  <div className="border rounded-lg divide-y text-sm">
                    {invoice.payments.map((payment: SalesInvoicePayment) => (
                      <div key={payment.id} className="flex justify-between items-center p-3 hover:bg-muted/10">
                        <div>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Payment Recorded</span>
                          {payment.note && <div className="text-xs text-muted-foreground mt-0.5">{payment.note}</div>}
                          <div className="text-[10px] text-muted-foreground mt-1">Date: {formatDate(payment.paymentDate)}</div>
                        </div>
                        <div className="font-bold">{formatCurrency(payment.amount)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-muted-foreground border border-dashed rounded-lg">
                    No payment transactions logged.
                  </div>
                )}
              </div>

              {/* Credit Note Logs */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Credit Notes</h4>
                {invoice.creditNotes && invoice.creditNotes.length > 0 ? (
                  <div className="border rounded-lg divide-y text-sm">
                    {invoice.creditNotes.map((cn: SalesCreditNote) => (
                      <div key={cn.id} className="flex justify-between items-center p-3 hover:bg-muted/10">
                        <div>
                          <span className="font-semibold text-rose-500 font-mono">{cn.number}</span>
                          <div className="text-xs text-foreground mt-0.5">{cn.reason}</div>
                          {cn.note && <div className="text-xs text-muted-foreground mt-0.5">{cn.note}</div>}
                          <div className="text-[10px] text-muted-foreground mt-1">Issued: {cn.issuedAt ? formatDate(cn.issuedAt) : '-'}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-rose-500">-{formatCurrency(cn.amount)}</div>
                          <div className="text-[10px] uppercase font-semibold text-muted-foreground mt-0.5">{cn.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-muted-foreground border border-dashed rounded-lg">
                    No credit notes applied.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar info metadata */}
        <Card className="h-fit">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Document Info</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Customer</div>
              <div className="font-bold text-foreground mt-1">{invoice.customer?.name}</div>
              <div className="text-xs text-muted-foreground font-mono">{invoice.customer?.code}</div>
            </div>

            <Separator />

            <div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Sales Order Ref</div>
              <Link href={`/sales/sales-orders/${invoice.salesOrderId}`} className="font-semibold text-primary hover:underline font-mono block mt-1">
                {invoice.salesOrder?.number}
              </Link>
            </div>

            <Separator />

            <div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Invoice Date</div>
              <div className="font-semibold text-foreground mt-1">{formatDate(invoice.invoiceDate)}</div>
            </div>

            <Separator />

            <div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Due Date</div>
              <div className="font-semibold text-foreground mt-1">{formatDate(invoice.dueDate)}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Payment Terms: {invoice.paymentTermsDays} Days</div>
            </div>

            {invoice.sentAt && (
              <>
                <Separator />
                <div>
                  <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Sent to Customer</div>
                  <div className="font-semibold text-foreground mt-1">{formatDate(invoice.sentAt, true)}</div>
                </div>
              </>
            )}

            {invoice.note && (
              <>
                <Separator />
                <div>
                  <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Notes</div>
                  <div className="mt-1 p-2 bg-muted rounded text-xs leading-relaxed text-muted-foreground">{invoice.note}</div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSubmit={handleRecordPayment}
        maxAmount={currentOutstanding}
        isPending={paymentMutation.isPending}
      />

      {/* Credit Note Modal */}
      <CreateCreditNoteModal
        isOpen={isCreditNoteModalOpen}
        onClose={() => setIsCreditNoteModalOpen(false)}
        onSubmit={handleCreateCreditNote}
        maxAmount={currentOutstanding}
        isPending={creditNoteMutation.isPending}
      />
    </div>
  );
}
