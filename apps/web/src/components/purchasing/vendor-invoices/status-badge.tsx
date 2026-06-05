import React from 'react';
import { Badge } from '@web/components/ui/badge';

interface VendorInvoiceStatusBadgeProps {
  status: 'DRAFT' | 'RECEIVED' | 'PARTIAL' | 'PAID' | 'CANCELLED';
  className?: string;
}

export function VendorInvoiceStatusBadge({ status, className }: VendorInvoiceStatusBadgeProps) {
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
  let customClass = '';

  switch (status) {
    case 'DRAFT':
      variant = 'secondary';
      break;
    case 'RECEIVED':
      variant = 'outline';
      customClass = 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20';
      break;
    case 'PARTIAL':
      variant = 'outline';
      customClass = 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20';
      break;
    case 'PAID':
      variant = 'default';
      customClass = 'bg-emerald-600 hover:bg-emerald-600/90 dark:bg-emerald-500 text-white border-transparent';
      break;
    case 'CANCELLED':
      variant = 'destructive';
      break;
  }

  return (
    <Badge variant={variant} className={`capitalize font-semibold tracking-wide ${customClass} ${className}`}>
      {status.toLowerCase()}
    </Badge>
  );
}
