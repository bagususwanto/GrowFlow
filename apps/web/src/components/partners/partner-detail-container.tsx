'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { usePartner, useDeletePartner } from './use-partners';
import { Card, CardContent } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { Badge } from '@web/components/ui/badge';
import { Skeleton } from '@web/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@web/components/ui/alert';
import { toast } from 'sonner';
import { PartnerTransactions } from './partner-transactions';
import { ApiError } from '@growflow/types';
import { useConfirm } from '@web/hooks/use-confirm';
import { useBreadcrumbLabel } from '@web/hooks/use-breadcrumb-label';
import {
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  EditIcon,
  Trash2Icon,
  AlertCircleIcon,
  Loader2Icon,
  ClockIcon,
  DollarSignIcon,
  ChevronLeftIcon,
} from 'lucide-react';
import { useSalesInvoices } from '@web/hooks/use-sales-invoices';
import { useSalesOrders } from '@web/hooks/use-sales-orders';
import { useDeliveryNotes } from '@web/hooks/use-delivery-notes';
import { usePurchaseOrders } from '@web/hooks/use-purchase-orders';
import { useGoodsReceipts } from '@web/hooks/use-goods-receipts';
// ... rest of imports unchanged ...

interface PartnerDetailContainerProps {
  id: string;
}

export function PartnerDetailContainer({ id }: PartnerDetailContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPath = searchParams.get('from') || '/partners';
  const confirm = useConfirm();
  const { data: partner, isLoading, isError, error } = usePartner(id);
  const deleteMutation = useDeletePartner();

  useBreadcrumbLabel(id, partner?.name);

  const isCustomer = partner?.type === 'CUSTOMER';
  const isSupplier = partner?.type === 'SUPPLIER';

  const { data: invoicesData } = useSalesInvoices(isCustomer ? { customerId: id, limit: 100 } : {});

  const { data: sosData } = useSalesOrders(isCustomer ? { customerId: id, limit: 1 } : {});

  const { data: dnsData } = useDeliveryNotes(isCustomer ? { customerId: id, limit: 1 } : {});

  const { data: posData } = usePurchaseOrders(isSupplier ? { supplierId: id, limit: 1 } : {});

  const { data: grnsData } = useGoodsReceipts(isSupplier ? { supplierId: id, limit: 1 } : {});

  const totalOutstanding = React.useMemo(() => {
    if (!invoicesData?.data) return 0;
    return invoicesData.data
      .filter((inv) => inv.status !== 'CANCELLED' && inv.status !== 'DRAFT')
      .reduce((sum, inv) => sum + (Number(inv.totalAmount) - Number(inv.paidAmount)), 0);
  }, [invoicesData]);

  const handleEdit = () => {
    router.push(`/partners/${id}/edit?from=${encodeURIComponent(fromPath)}`);
  };

  const handleDelete = async () => {
    if (!partner) return;
    const ok = await confirm({
      title: 'Delete Partner',
      description: (
        <>
          Are you sure you want to delete partner <span className="font-bold">{partner.name}</span>?
          This action cannot be undone.
        </>
      ),
      confirmText: 'Delete',
      variant: 'destructive',
    });
    if (ok) {
      try {
        await toast.promise(deleteMutation.mutateAsync(partner.id), {
          loading: `Deleting partner ${partner.name}...`,
          success: `Partner ${partner.name} deleted successfully`,
          error: 'Failed to delete partner',
        });
        router.push(fromPath);
      } catch (err) {
        const apiError = err as ApiError;
        toast.error(apiError.message || 'Failed to delete partner');
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 pt-4">
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !partner) {
    return (
      <Alert variant="destructive" className="w-full">
        <AlertCircleIcon className="h-4 w-4" />
        <AlertTitle>Error loading partner</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Could not fetch partner details.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header aligned with actions */}
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-start gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            nativeButton={false}
            render={
              <Link href={fromPath} title="Back">
                <ChevronLeftIcon className="h-4 w-4" />
              </Link>
            }
          />
          <div className="space-y-0.5">
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{partner.name}</h1>
              <Badge variant="outline" className="font-mono text-xs">
                {partner.code}
              </Badge>
              <Badge className="capitalize text-xs">{partner.type.toLowerCase()}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage contact details, addresses, and history for this partner.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:self-center">
          <Button variant="outline" size="sm" onClick={handleEdit} className="h-9">
            <EditIcon className="mr-1.5 w-4 h-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="h-9"
          >
            {deleteMutation.isPending ? (
              <Loader2Icon className="mr-1.5 w-4 h-4 animate-spin" />
            ) : (
              <Trash2Icon className="mr-1.5 w-4 h-4" />
            )}
            Delete
          </Button>
        </div>
      </div>

      {/* Mini KPI Cards row */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
        {isCustomer ? (
          <>
            <Card className="p-4 flex flex-col justify-between bg-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Total Sales Orders
              </span>
              <span className="text-xl font-bold mt-1 text-foreground">{sosData?.total ?? 0}</span>
            </Card>
            <Card className="p-4 flex flex-col justify-between bg-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Total Delivery Notes
              </span>
              <span className="text-xl font-bold mt-1 text-foreground">{dnsData?.total ?? 0}</span>
            </Card>
            <Card className="p-4 flex flex-col justify-between bg-card border-l-4 border-l-amber-500">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <DollarSignIcon className="w-3.5 h-3.5 text-amber-500" />
                Outstanding Piutang
              </span>
              <span
                className={`text-xl font-black mt-1 ${totalOutstanding > 0 ? 'text-amber-500' : 'text-emerald-500'}`}
              >
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0,
                }).format(totalOutstanding)}
              </span>
            </Card>
          </>
        ) : (
          <>
            <Card className="p-4 flex flex-col justify-between bg-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Total Purchase Orders
              </span>
              <span className="text-xl font-bold mt-1 text-foreground">{posData?.total ?? 0}</span>
            </Card>
            <Card className="p-4 flex flex-col justify-between bg-card">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Total Goods Receipts
              </span>
              <span className="text-xl font-bold mt-1 text-foreground">{grnsData?.total ?? 0}</span>
            </Card>
            <Card className="p-4 flex flex-col justify-between bg-card border-l-4 border-l-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <DollarSignIcon className="w-3.5 h-3.5 text-muted-foreground" />
                Outstanding Utang
              </span>
              <span className="text-xl font-black mt-1 text-muted-foreground">Rp 0</span>
            </Card>
          </>
        )}
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Section 1: Contact & Status */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Contact & Status</h3>
                <p className="text-xs text-muted-foreground">
                  General contact info and operational status.
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Email
                  </span>
                  <span className="text-sm flex items-center gap-1.5 text-foreground">
                    <MailIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    {partner.email || (
                      <span className="text-muted-foreground/40 italic">Not set</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Phone
                  </span>
                  <span className="text-sm flex items-center gap-1.5 text-foreground">
                    <PhoneIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    {partner.phone || (
                      <span className="text-muted-foreground/40 italic">Not set</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Payment Terms
                  </span>
                  <span className="text-sm flex items-center gap-1.5 text-foreground font-semibold">
                    <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    {partner.paymentTermsDays ?? 30} Days
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </span>
                  <Badge variant={partner.isActive ? 'default' : 'destructive'}>
                    {partner.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Section 2: Address & Audit */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Location & History</h3>
                <p className="text-xs text-muted-foreground">Registered address and system logs.</p>
              </div>

              <div className="space-y-3.5">
                <div className="flex flex-col py-2 border-b gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Address
                  </span>
                  <span className="text-sm flex items-start gap-1.5 text-foreground">
                    <MapPinIcon className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                    {partner.address || (
                      <span className="text-muted-foreground/40 italic">Not set</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Created At
                  </span>
                  <span className="text-sm flex items-center gap-1.5 text-foreground">
                    <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    {new Date(partner.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Last Updated
                  </span>
                  <span className="text-sm flex items-center gap-1.5 text-foreground">
                    <ClockIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    {new Date(partner.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <PartnerTransactions
        partnerId={partner.id}
        partnerType={partner.type as 'SUPPLIER' | 'CUSTOMER'}
      />
    </div>
  );
}
