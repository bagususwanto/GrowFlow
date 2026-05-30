import React from 'react';
import { Badge } from '@web/components/ui/badge';
import { GoodsReceiptStatus } from '@growflow/types';

interface GoodsReceiptStatusBadgeProps {
  status: GoodsReceiptStatus;
  className?: string;
}

export function GoodsReceiptStatusBadge({ status, className }: GoodsReceiptStatusBadgeProps) {
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
  const label = status;

  switch (status) {
    case 'DRAFT':
      variant = 'secondary';
      break;
    case 'CONFIRMED':
      variant = 'default';
      break;
  }

  return (
    <Badge variant={variant} className={`capitalize font-semibold tracking-wide ${className}`}>
      {label.toLowerCase()}
    </Badge>
  );
}
