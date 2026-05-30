import React from 'react';
import { Badge } from '@web/components/ui/badge';
import { SalesOrderStatus } from '@growflow/types';

interface SalesOrderStatusBadgeProps {
  status: SalesOrderStatus;
  className?: string;
}

export function SalesOrderStatusBadge({ status, className }: SalesOrderStatusBadgeProps) {
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
  const label = status;

  switch (status) {
    case 'DRAFT':
      variant = 'secondary';
      break;
    case 'CONFIRMED':
      variant = 'default';
      break;
    case 'PARTIAL':
      variant = 'default'; // primary
      break;
    case 'DONE':
      variant = 'default'; // Success / green-ish
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
