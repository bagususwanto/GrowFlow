'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePartner, useUpdatePartner } from './use-partners';
import { PartnerForm, PartnerFormValues } from './partner-form';
import { Card, CardContent } from '@web/components/ui/card';
import { Skeleton } from '@web/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@web/components/ui/alert';
import { toast } from 'sonner';
import { ApiError } from '@growflow/types';
import { AlertCircleIcon } from 'lucide-react';

interface EditPartnerContainerProps {
  id: string;
}

export function EditPartnerContainer({ id }: EditPartnerContainerProps) {
  const router = useRouter();
  const { data: partner, isLoading, isError, error } = usePartner(id);
  const updateMutation = useUpdatePartner(id);

  const handleSubmit = async (data: PartnerFormValues) => {
    try {
      await updateMutation.mutateAsync({
        name: data.name,
        type: data.type,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        isActive: data.isActive,
      });
      toast.success('Partner updated successfully');
      router.push('/partners');
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Failed to update partner');
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
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
    <Card className="w-full">
      <CardContent className="p-6">
        <PartnerForm
          initialData={partner}
          onSubmit={handleSubmit}
          isSubmitting={updateMutation.isPending}
        />
      </CardContent>
    </Card>
  );
}
