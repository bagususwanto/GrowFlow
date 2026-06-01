import React from 'react';
import { Badge } from '@web/components/ui/badge';
import { SalesInvoiceStatus } from '@growflow/types';

interface SalesInvoiceStatusBadgeProps {
  status: SalesInvoiceStatus;
  className?: string;
}

export function SalesInvoiceStatusBadge({ status, className }: SalesInvoiceStatusBadgeProps) {
  const getStyles = () => {
    switch (status) {
      case 'DRAFT':
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
      case 'SENT':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'PARTIAL':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'PAID':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return '';
    }
  };

  return (
    <Badge variant="outline" className={`capitalize font-semibold tracking-wide ${getStyles()} ${className || ''}`}>
      {status.toLowerCase()}
    </Badge>
  );
}
