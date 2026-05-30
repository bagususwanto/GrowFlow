import React from 'react';
import { Badge } from '@web/components/ui/badge';
import { PurchaseOrderStatus } from '@growflow/types';

interface PurchaseOrderStatusBadgeProps {
  status: PurchaseOrderStatus;
  className?: string;
}

export function PurchaseOrderStatusBadge({ status, className }: PurchaseOrderStatusBadgeProps) {
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
  const label = status;

  switch (status) {
    case 'DRAFT':
      variant = 'secondary';
      break;
    case 'SUBMITTED':
      variant = 'outline';
      break;
    case 'APPROVED':
      variant = 'default';
      break;
    case 'PARTIAL':
      variant = 'default'; // primary
      break;
    case 'DONE':
      variant = 'default'; // Success green-ish or primary
      break;
    case 'CANCELLED':
      variant = 'destructive';
      break;
  }

  return (
    <Badge variant={variant} className={`capitalize font-semibold tracking-wide ${className}`}>
      {label.toLowerCase()}
    </Badge>
  );
}
