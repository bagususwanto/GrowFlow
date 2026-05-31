'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePartner, useDeletePartner } from './use-partners';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@web/components/ui/card';
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
  BriefcaseIcon,
} from 'lucide-react';
// ... rest of imports unchanged ...

interface PartnerDetailContainerProps {
  id: string;
}

export function PartnerDetailContainer({ id }: PartnerDetailContainerProps) {
  const router = useRouter();
  const { data: partner, isLoading, isError, error } = usePartner(id);
  const deleteMutation = useDeletePartner();
  const confirm = useConfirm();

  useBreadcrumbLabel(id, partner?.name);

  const handleEdit = () => {
    router.push(`/relations/partners/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!partner) return;
    const ok = await confirm({
      title: 'Delete Partner',
      description: (
        <>
          Are you sure you want to delete partner{' '}
          <span className="font-bold">{partner.name}</span>?
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
        router.push('/relations/partners');
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
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 pb-6 border-b">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex justify-center items-center bg-primary/10 rounded-full w-16 h-16 text-primary border">
                <BriefcaseIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl font-bold">{partner.name}</CardTitle>
                  <Badge variant="outline" className="font-mono text-xs">
                    {partner.code}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1.5 text-sm capitalize">
                  Type: {partner.type.toLowerCase()}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Section 1: Contact & Status */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Contact & Status</h3>
                <p className="text-xs text-muted-foreground">General contact info and operational status.</p>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</span>
                  <span className="text-sm flex items-center gap-1.5 text-foreground">
                    <MailIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    {partner.email || <span className="text-muted-foreground/40 italic">Not set</span>}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone</span>
                  <span className="text-sm flex items-center gap-1.5 text-foreground">
                    <PhoneIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    {partner.phone || <span className="text-muted-foreground/40 italic">Not set</span>}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
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
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Address</span>
                  <span className="text-sm flex items-start gap-1.5 text-foreground">
                    <MapPinIcon className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                    {partner.address || <span className="text-muted-foreground/40 italic">Not set</span>}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Created At</span>
                  <span className="text-sm flex items-center gap-1.5 text-foreground">
                    <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    {new Date(partner.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Updated</span>
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

      {/* Section 3: Related Data Section */}
      <PartnerTransactions
        partnerId={partner.id}
        partnerType={partner.type as 'SUPPLIER' | 'CUSTOMER'}
      />
    </div>
  );
}
