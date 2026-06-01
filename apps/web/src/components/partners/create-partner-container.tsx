'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCreatePartner } from './use-partners';
import { PartnerForm, PartnerFormValues } from './partner-form';
import { Card, CardContent } from '@web/components/ui/card';
import { toast } from 'sonner';
import { ApiError } from '@growflow/types';

export function CreatePartnerContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPath = searchParams.get('from') || '/partners';
  const createMutation = useCreatePartner();

  const handleSubmit = async (data: PartnerFormValues) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        type: data.type,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        paymentTermsDays: data.paymentTermsDays,
      });
      toast.success('Partner created successfully');
      router.push(fromPath);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Failed to create partner');
    }
  };

  const defaultType = fromPath === '/sales/customers'
    ? 'CUSTOMER'
    : fromPath === '/purchasing/suppliers'
      ? 'SUPPLIER'
      : undefined;

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <PartnerForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
          defaultType={defaultType}
        />
      </CardContent>
    </Card>
  );
}
