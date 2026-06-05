'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useJournalEntry, usePostJournalEntry, useCancelJournalEntry } from '@web/hooks/use-accounting';
import { JournalEntry } from '@growflow/types';
import { Card, CardContent, CardHeader, CardTitle } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { Badge } from '@web/components/ui/badge';
import { Skeleton } from '@web/components/ui/skeleton';
import { Separator } from '@web/components/ui/separator';
import {
  ChevronLeftIcon,
  FileTextIcon,
  CalendarIcon,
  UserIcon,
  CheckSquareIcon,
  BanIcon,
  ArrowUpRightIcon,
  CoinsIcon
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

export function JournalEntryDetailContainer() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const confirm = useConfirm();

  const { data: je, isLoading, isError, error } = useJournalEntry(id);
  useBreadcrumbLabel(id, je?.number);

  const postMutation = usePostJournalEntry();
  const cancelMutation = useCancelJournalEntry();

  const handlePost = async () => {
    if (!je) return;
    const ok = await confirm({
      title: 'Post Journal Entry',
      description: (
        <>
          Are you sure you want to post journal <span className="font-bold">{je.number}</span>? Once posted, ledger entries are officially committed.
        </>
      ),
      confirmText: 'Post Journal',
    });
    if (ok) {
      toast.promise(postMutation.mutateAsync(je.id), {
        loading: 'Posting journal entry...',
        success: 'Journal posted successfully',
        error: (err) => err?.message || 'Failed to post journal entry',
      });
    }
  };

  const handleCancel = async () => {
    if (!je) return;
    const ok = await confirm({
      title: 'Cancel Journal Entry',
      description: (
        <>
          Are you sure you want to cancel journal <span className="font-bold">{je.number}</span>? This will void its impact.
        </>
      ),
      confirmText: 'Cancel Journal',
      variant: 'destructive',
    });
    if (ok) {
      toast.promise(cancelMutation.mutateAsync(je.id), {
        loading: 'Cancelling journal entry...',
        success: 'Journal cancelled successfully',
        error: (err) => err?.message || 'Failed to cancel journal entry',
      });
    }
  };

  if (isLoading) return <Skeleton className="w-full h-96" />;
  if (isError || !je) {
    return (
      <div className="p-8 text-center text-destructive font-medium">
        {error instanceof Error ? error.message : 'Failed to load Journal Entry.'}
      </div>
    );
  }

  // Calculate totals
  const totalDebit = je.lines?.reduce((sum, line) => sum + Number(line.debit), 0) || 0;
  const totalCredit = je.lines?.reduce((sum, line) => sum + Number(line.credit), 0) || 0;

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'DRAFT':
        return <Badge variant="secondary">Draft</Badge>;
      case 'POSTED':
        return <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600/90 text-white dark:bg-emerald-500">Posted</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{st}</Badge>;
    }
  };

  const getSourceLink = () => {
    if (!je.sourceType || !je.sourceId) return null;
    let url = '';
    let label = '';
    
    switch (je.sourceType) {
      case 'VENDOR_INVOICE':
        url = `/purchasing/vendor-invoices/${je.sourceId}`;
        label = 'Supplier Bill';
        break;
      case 'SALES_INVOICE':
        url = `/sales/invoices/${je.sourceId}`;
        label = 'Sales Invoice';
        break;
      default:
        return null;
    }

    return (
      <Link
        href={url}
        className="text-primary font-semibold hover:underline inline-flex items-center gap-0.5"
      >
        View {label}
        <ArrowUpRightIcon className="w-3.5 h-3.5" />
      </Link>
    );
  };

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
              <Link href="/accounting/journal-entries" title="Back to Journal Entries">
                <ChevronLeftIcon className="h-4 w-4" />
              </Link>
            }
          />
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Journal Entry Details
            </h1>
            <p className="text-sm text-muted-foreground">
              Review double-entry debits, credits, and ledger balance adjustments.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {je.status === 'DRAFT' && (
          <div className="flex flex-wrap items-center gap-2 sm:self-center">
            <Button size="sm" onClick={handlePost} disabled={postMutation.isPending}>
              <CheckSquareIcon className="w-4 h-4 mr-2" />
              Post Journal
            </Button>
            <Button size="sm" variant="destructive" onClick={handleCancel} disabled={cancelMutation.isPending}>
              <BanIcon className="w-4 h-4 mr-2" />
              Cancel Journal
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Panel */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <FileTextIcon className="w-5 h-5 text-muted-foreground" />
                {je.number}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Created on {formatDate(je.createdAt, true)}</p>
            </div>
            {getStatusBadge(je.status)}
          </CardHeader>
          <CardContent className="pt-6">
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr className="text-xs text-muted-foreground font-semibold uppercase text-left">
                    <th className="p-3 w-[220px]">Account</th>
                    <th className="p-3">Memo / Description</th>
                    <th className="p-3 text-right w-[150px]">Debit</th>
                    <th className="p-3 text-right w-[150px]">Credit</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {je.lines?.map((line) => (
                    <tr key={line.id}>
                      <td className="p-3">
                        <div className="font-semibold text-foreground">
                          {line.account?.name || 'Unknown Account'}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono font-semibold">
                          {line.account?.code}
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">
                        {line.description || je.description || '-'}
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-foreground">
                        {Number(line.debit) > 0
                          ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(line.debit)
                          : '-'}
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-foreground">
                        {Number(line.credit) > 0
                          ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(line.credit)
                          : '-'}
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="bg-muted/10 font-bold border-t border-border/70">
                    <td colSpan={2} className="p-3 text-right text-foreground uppercase tracking-wide text-xs">
                      Total Ledger Impact
                    </td>
                    <td className="p-3 text-right font-mono text-foreground">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalDebit)}
                    </td>
                    <td className="p-3 text-right font-mono text-foreground">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalCredit)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Audit Trail & Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  Journal Date
                </div>
                <div className="font-bold text-foreground mt-1">{formatDate(je.entryDate)}</div>
              </div>

              <Separator />

              <div>
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1">
                  <CoinsIcon className="w-3.5 h-3.5" />
                  Source Document
                </div>
                <div className="font-bold text-foreground mt-1 capitalize">
                  {je.sourceType ? je.sourceType.toLowerCase().replace(/_/g, ' ') : 'Manual Adjustment'}
                </div>
                {je.sourceId && <div className="mt-1">{getSourceLink()}</div>}
              </div>

              <Separator />

              <div>
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1">
                  <UserIcon className="w-3.5 h-3.5" />
                  Prepared By
                </div>
                <div className="font-semibold text-foreground mt-1">{je.createdBy?.name || 'System Auto'}</div>
              </div>

              {je.status === 'POSTED' && (
                <>
                  <Separator />
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5" />
                      Posted By
                    </div>
                    <div className="font-semibold text-foreground mt-1">{je.postedBy?.name || 'System Auto'}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      at {je.postedAt ? formatDate(je.postedAt, true) : '-'}
                    </div>
                  </div>
                </>
              )}

              {je.description && (
                <>
                  <Separator />
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Memo / Notes</div>
                    <div className="mt-1 p-2 bg-muted rounded text-xs leading-relaxed text-muted-foreground">
                      {je.description}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
